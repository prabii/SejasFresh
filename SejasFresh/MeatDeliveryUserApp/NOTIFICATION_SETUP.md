# 🔔 Push Notifications Setup Guide

This guide explains how to use and test the complete notification system in your Meat Delivery App.

## 📋 Overview

The app now includes a comprehensive notification system with:
- **Push Notifications** for order updates and promotions
- **Local Notifications** for reminders and alerts
- **Notification Channels** for categorized notifications
- **Deep Linking** to navigate users to specific screens
- **Context-based State Management** across the app

## 🚀 Features

### 1. Push Notifications
- **Order Status Updates**: Confirmation, preparation, out for delivery, delivered
- **Promotional Offers**: New deals, discounts, and special offers
- **General Alerts**: App updates, maintenance notices

### 2. Local Notifications
- **Order Reminders**: Scheduled notifications for pending orders
- **Promotional Campaigns**: Time-based promotional alerts
- **Custom Notifications**: Admin-triggered notifications

### 3. Notification Channels (Android)
- **Orders**: High priority for order-related notifications
- **Promotions**: Medium priority for marketing notifications
- **General**: Low priority for informational notifications

## 🔧 Setup & Configuration

### 1. Required Packages
```bash
npx expo install expo-notifications expo-device
```

### 2. App Configuration (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#D13635",
          "defaultChannel": "orders"
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
        "com.android.alarm.permission.SET_ALARM"
      ]
    },
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#D13635",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    }
  }
}
```

## 🧪 Testing Notifications

### 1. Using the NotificationTester Component

The app includes a built-in notification tester in the Profile screen:

```tsx
import { NotificationTester } from '../components/NotificationTester';

// In your component
<NotificationTester title="Push Notifications" showStatus={true} />
```

### 2. Testing Steps

1. **Open the app** and navigate to the Profile screen
2. **Check Notification Status**:
   - View permission status (Enabled/Disabled)
   - Check push token registration (Connected/Disconnected)
3. **Test Local Notifications**:
   - Tap "Test Order" to simulate order notifications
   - Tap "Test Promo" to simulate promotional notifications
4. **Check Notification Navigation**:
   - Tap on received notifications
   - Verify proper screen navigation

### 3. Manual Testing Commands

For advanced testing, you can use the notification service directly:

```tsx
import { notificationService } from '../services/notificationService';

// Schedule a test notification
await notificationService.scheduleLocalNotification(
  'Test Title',
  'Test message',
  { orderId: '12345' }
);

// Send push token to backend
await notificationService.sendPushTokenToBackend();
```

## 📱 Usage Examples

### 1. Order Notifications
```tsx
// When an order is placed
const orderData = {
  orderId: 'ORD-12345',
  status: 'confirmed',
  message: 'Your order has been confirmed and is being prepared!'
};

await notificationService.scheduleLocalNotification(
  'Order Confirmed! 🎉',
  orderData.message,
  { screen: 'order-details', orderId: orderData.orderId }
);
```

### 2. Promotional Notifications
```tsx
// For promotional campaigns
const promoData = {
  title: '50% Off Premium Cuts! 🥩',
  message: 'Limited time offer on all premium cuts. Order now!',
  promoCode: 'PREMIUM50'
};

await notificationService.scheduleLocalNotification(
  promoData.title,
  promoData.message,
  { screen: 'categories', category: 'premium-cuts' }
);
```

### 3. Reminder Notifications
```tsx
// Set reminders for cart abandonment
const reminderData = {
  title: 'Don\'t forget your order! 🛒',
  message: 'You have items in your cart. Complete your order now!',
  scheduledTime: Date.now() + (2 * 60 * 60 * 1000) // 2 hours later
};

await notificationService.scheduleLocalNotification(
  reminderData.title,
  reminderData.message,
  { screen: 'cart' },
  reminderData.scheduledTime
);
```

## 🔗 Navigation Integration

### Notification Data Structure
```tsx
interface NotificationData {
  screen?: string;          // Target screen to navigate to
  orderId?: string;         // Order ID for order-related notifications
  category?: string;        // Product category for category-related notifications
  productId?: string;       // Specific product ID
  promoCode?: string;       // Promotional code
  [key: string]: any;       // Additional custom data
}
```

### Navigation Mapping
- `screen: 'order-details'` → Order Details Screen
- `screen: 'categories'` → Categories Screen  
- `screen: 'cart'` → Cart Screen
- `screen: 'profile'` → Profile Screen
- No screen specified → Home Screen

## 🛠 Components & Services

### 1. Core Files
- **`services/notificationService.ts`**: Main notification management
- **`hooks/useNotifications.ts`**: React hook for notification state
- **`contexts/NotificationContext.tsx`**: App-wide notification context
- **`components/NotificationTester.tsx`**: Testing component

### 2. Integration Points
- **App Root**: Wrapped with NotificationContext
- **Profile Screen**: Includes NotificationTester component
- **Settings Screen**: Notification status and management
- **Order Screens**: Auto-notification triggers

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not appearing**:
   - Check device notification permissions
   - Verify Expo Go app has notification permissions
   - Ensure proper app.json configuration

2. **Push token not registering**:
   - Check network connectivity
   - Verify backend endpoint is accessible
   - Check device capability (physical device required)

3. **Navigation not working**:
   - Verify expo-router setup
   - Check notification data structure
   - Ensure screen routes exist

### Debug Commands
```tsx
// Check notification permissions
import * as Notifications from 'expo-notifications';
const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission:', status);

// Check device push capabilities
import * as Device from 'expo-device';
console.log('Is device:', Device.isDevice);
console.log('Device type:', Device.deviceType);

// Test notification scheduling
const notificationId = await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Debug Test',
    body: 'This is a debug notification',
  },
  trigger: { seconds: 1 },
});
console.log('Scheduled notification:', notificationId);
```

## 📈 Performance Considerations

1. **Permission Requests**: Only request permissions when needed
2. **Token Updates**: Handle token refresh automatically
3. **Background Notifications**: Optimize for battery usage
4. **Notification Limits**: Respect system notification limits

## 🔐 Security Notes

1. **Push Tokens**: Treat as sensitive data
2. **Backend Integration**: Use secure HTTPS endpoints
3. **User Privacy**: Respect notification preferences
4. **Data Validation**: Validate notification payloads

## 🚢 Production Deployment

### Before Publishing:
1. **Test on Physical Devices**: Notifications work best on real devices
2. **Configure Production Tokens**: Set up production push notification service
3. **Update Backend URLs**: Change from localhost to production URLs
4. **Test Deep Linking**: Verify all navigation routes work
5. **Optimize Notification Content**: Ensure messages are user-friendly

### EAS Build Configuration:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_NOTIFICATIONS_CHANNEL": "production"
      }
    }
  }
}
```

---

## 📞 Support

For additional help with notifications:
1. Check Expo Notifications documentation: https://docs.expo.dev/versions/latest/sdk/notifications/
2. Review React Navigation integration: https://reactnavigation.org/docs/deep-linking/
3. Test with Expo Go app on a physical device

**Happy coding! 🚀**