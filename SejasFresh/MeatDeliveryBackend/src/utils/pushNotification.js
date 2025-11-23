const { Expo } = require('expo-server-sdk');
const webpush = require('web-push');
const User = require('../models/User');

// Create a new Expo SDK client
const expo = new Expo();

// Configure Web Push VAPID keys (set these in environment variables)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@sejas.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('✅ Web Push VAPID keys configured');
} else {
  console.warn('⚠️  Web Push VAPID keys not configured. Web push notifications will not work.');
}

/**
 * Send push notification to a user
 * @param {String} userId - User ID to send notification to
 * @param {String} title - Notification title
 * @param {String} body - Notification message
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} - Result of sending notification
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // Get user and their push token/subscription
    const user = await User.findById(userId).select('pushToken pushSubscription firstName');
    
    if (!user) {
      console.log(`User ${userId} not found`);
      return { success: false, error: 'User not found' };
    }

    // Try Web Push first (for web browsers)
    if (user.pushSubscription) {
      try {
        const subscription = typeof user.pushSubscription === 'string' 
          ? JSON.parse(user.pushSubscription) 
          : user.pushSubscription;
        
        const payload = JSON.stringify({
          title: `Sejas Fresh: ${title}`,
          body: body,
          icon: '/favicon.png',
          badge: '/favicon.png',
          data: {
            ...data,
            userId: userId.toString(),
            url: data.screen === 'orders' ? '/orders' : '/'
          }
        });

        await webpush.sendNotification(subscription, payload);
        console.log(`✅ Web push notification sent to user ${userId} (${user.firstName}): ${title}`);
        return { success: true, method: 'web-push' };
      } catch (error) {
        console.error(`Web push error for user ${userId}:`, error);
        // If subscription is invalid or VAPID key mismatch, remove it
        // 403 = VAPID key mismatch, 410 = subscription expired, 404 = not found
        if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 403) {
          console.log(`Removing invalid subscription for user ${userId} (status: ${error.statusCode})`);
          if (error.statusCode === 403) {
            console.log(`⚠️  VAPID key mismatch - user needs to re-subscribe with correct keys`);
          }
          user.pushSubscription = null;
          await user.save();
        }
        // Fall through to try Expo token
      }
    }

    // Fallback to Expo Push (for mobile apps)
    if (!user.pushToken) {
      console.log(`No push token or subscription for user ${userId}`);
      return { success: false, error: 'No push token or subscription' };
    }

    // Validate Expo push token
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.log(`Invalid Expo push token for user ${userId}: ${user.pushToken}`);
      return { success: false, error: 'Invalid push token' };
    }

    // Create the push message with app name in title
    // Format: "Sejas Fresh: [Original Title]" to ensure app name shows
    const notificationTitle = title.startsWith('Sejas Fresh') ? title : `Sejas Fresh: ${title}`;
    
    const messages = [{
      to: user.pushToken,
      sound: 'default',
      title: notificationTitle,
      subtitle: 'Sejas Fresh', // App name as subtitle
      body: body,
      data: {
        ...data,
        userId: userId.toString(),
        appName: 'Sejas Fresh' // Include app name in data
      },
      priority: 'high',
      channelId: 'order-updates', // Android notification channel
      // Ensure notification shows as system notification
      badge: 1,
      // Android-specific options for system-level notifications
      android: {
        priority: 'high',
        channelId: 'order-updates',
        sound: 'default',
        vibrate: [0, 250, 250, 250],
        sticky: false,
        visibility: 'public',
        channelName: 'Sejas Fresh - Order Updates', // App name for Android channel
        smallIcon: 'ic_notification', // Use app icon
        largeIcon: 'ic_notification', // Use app icon
        tag: 'sejas-fresh', // Tag for grouping notifications
      },
      // iOS-specific options
      ios: {
        sound: 'default',
        badge: 1,
        _displayInForeground: true,
        subtitle: 'Sejas Fresh', // App name as subtitle
        categoryId: 'ORDER_UPDATES', // Category for iOS
      }
    }];

    // Send the notification
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    // Check for errors in tickets
    const errors = [];
    tickets.forEach((ticket, index) => {
      if (ticket.status === 'error') {
        errors.push({
          token: messages[index].to,
          error: ticket.message
        });
      }
    });

    if (errors.length > 0) {
      console.error('Push notification errors:', errors);
      return { success: false, errors };
    }

    console.log(`✅ Expo push notification sent to user ${userId} (${user.firstName}): ${title}`);
    return { success: true, tickets, method: 'expo' };

  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple users
 * @param {Array<String>} userIds - Array of user IDs
 * @param {String} title - Notification title
 * @param {String} body - Notification message
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} - Result of sending notifications
 */
const sendPushNotificationToMultiple = async (userIds, title, body, data = {}) => {
  const results = [];
  
  for (const userId of userIds) {
    const result = await sendPushNotification(userId, title, body, data);
    results.push({ userId, ...result });
  }

  return results;
};

/**
 * Send push notification to all users with a specific role
 * @param {String} role - User role ('admin', 'delivery', 'customer')
 * @param {String} title - Notification title
 * @param {String} body - Notification message
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} - Result of sending notifications
 */
const sendPushNotificationToRole = async (role, title, body, data = {}) => {
  try {
    // Find users with either pushToken (mobile) or pushSubscription (web)
    const users = await User.find({ 
      role, 
      isActive: true,
      $or: [
        { pushToken: { $ne: null } },
        { pushSubscription: { $ne: null } }
      ]
    }).select('_id pushToken pushSubscription');
    
    if (users.length === 0) {
      console.log(`No users with role '${role}' and push tokens/subscriptions found`);
      return { success: false, error: 'No users found' };
    }

    const results = [];
    for (const user of users) {
      const result = await sendPushNotification(user._id, title, body, { ...data, role });
      results.push({ userId: user._id.toString(), ...result });
    }

    console.log(`✅ Push notifications sent to ${results.filter(r => r.success).length}/${users.length} ${role} users`);
    return { success: true, results, sent: results.filter(r => r.success).length, total: users.length };
  } catch (error) {
    console.error(`Error sending push notifications to role '${role}':`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToRole
};

