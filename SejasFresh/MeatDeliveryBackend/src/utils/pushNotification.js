const { Expo } = require('expo-server-sdk');
const User = require('../models/User');

// Create a new Expo SDK client
const expo = new Expo();

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
    // Get user and their push token
    const user = await User.findById(userId).select('pushToken firstName');
    
    if (!user) {
      console.log(`User ${userId} not found`);
      return { success: false, error: 'User not found' };
    }

    if (!user.pushToken) {
      console.log(`No push token for user ${userId}`);
      return { success: false, error: 'No push token' };
    }

    // Validate Expo push token
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.log(`Invalid Expo push token for user ${userId}: ${user.pushToken}`);
      return { success: false, error: 'Invalid push token' };
    }

    // Create the push message
    const messages = [{
      to: user.pushToken,
      sound: 'default',
      title: title,
      subtitle: 'Sejas Fresh', // App name as subtitle
      body: body,
      data: {
        ...data,
        userId: userId.toString()
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
        channelName: 'Sejas Fresh', // App name for Android channel
        smallIcon: 'ic_notification', // Use app icon
        largeIcon: 'ic_notification' // Use app icon
      },
      // iOS-specific options
      ios: {
        sound: 'default',
        badge: 1,
        _displayInForeground: true,
        subtitle: 'Sejas Fresh' // App name as subtitle
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

    console.log(`✅ Push notification sent to user ${userId} (${user.firstName}): ${title}`);
    return { success: true, tickets };

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

module.exports = {
  sendPushNotification,
  sendPushNotificationToMultiple
};

