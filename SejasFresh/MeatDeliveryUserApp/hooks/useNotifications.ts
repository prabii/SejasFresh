import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationService } from '../services/notificationService';

export interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  permissionStatus: string | null;
  isRegistering: boolean;
  error: string | null;
}

export function useNotifications() {
  const router = useRouter();
  const [state, setState] = useState<NotificationState>({
    expoPushToken: null,
    notification: null,
    permissionStatus: null,
    isRegistering: false,
    error: null,
  });

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Handle notification response
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    console.log('Handling notification tap with data:', data);

    // Navigate based on notification data
    if (data?.screen) {
      switch (data.screen) {
        case 'order-details':
          if (data.orderNumber) {
            router.push(`/order-details?orderNumber=${data.orderNumber}` as any);
          } else {
            router.push('/orders');
          }
          break;
        case 'orders':
          router.push('/orders');
          break;
        case 'categories':
          router.push('/(tabs)/categories');
          break;
        case 'profile':
          router.push('/(tabs)/profile');
          break;
        case 'cart':
          router.push('/(tabs)/cart');
          break;
        default:
          router.push('/(tabs)'); // Home
          break;
      }
    } else {
      // Default navigation
      router.push('/(tabs)');
    }
  }, [router]);

  // Initialize notifications
  useEffect(() => {
    // Check permissions first, then register if granted
    const initializeNotifications = async () => {
      try {
        const permissions = await notificationService.getNotificationPermissions();
        setState((prev) => ({ ...prev, permissionStatus: permissions.status }));
        
        // Only register if permissions are already granted
        // Otherwise, wait for user to grant permissions via requestPermissions()
        if (permissions.status === 'granted') {
          registerForPushNotificationsAsync();
        }
      } catch (error) {
        console.debug('Error checking notification permissions:', error);
      }
    };

    initializeNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        setState((prev) => ({ ...prev, notification }));
      }
    );

    // Listen for notification responses (when user taps notification)
    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Cleanup listeners
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [handleNotificationResponse]);

  const registerForPushNotificationsAsync = async () => {
    setState((prev) => ({ ...prev, isRegistering: true, error: null }));

    try {
      // Get permission status first
      const permissions = await notificationService.getNotificationPermissions();
      setState((prev) => ({ ...prev, permissionStatus: permissions.status }));

      // Only try to register if permissions are granted
      if (permissions.status !== 'granted') {
        // Permissions not granted - this is expected, don't set error
        console.debug('Notification permissions not granted, skipping push token registration');
        setState((prev) => ({ ...prev, isRegistering: false }));
        return;
      }

      // Register for push notifications
      const token = await notificationService.registerForPushNotifications();
      
      if (token) {
        setState((prev) => ({ ...prev, expoPushToken: token }));
        
        // Send token to backend (only if user is authenticated)
        // Suppress warning if user is not authenticated - this is expected
        try {
          const success = await notificationService.sendPushTokenToBackend(token);
          if (!success) {
            // Only log if it's not an expected "not authenticated" case
            console.debug('Failed to send push token to backend (user may not be authenticated)');
          }
        } catch (error) {
          // Silently ignore - user might not be authenticated yet
          console.debug('Push token send failed (expected if not authenticated)');
        }
      } else {
        // Token is null - could be due to:
        // 1. Not a physical device (expected in simulator/emulator)
        // 2. Permissions denied (already handled above)
        // 3. Actual error getting token
        // Only set error if we have permissions but still can't get token
        if (permissions.status === 'granted') {
          // This is unexpected - we have permissions but no token
          console.debug('Failed to get push token despite granted permissions');
          // Don't set error - might be simulator/emulator which is expected
        }
      }
    } catch (error) {
      // Only log actual errors, not expected scenarios
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.debug('Error registering for push notifications:', errorMessage);
      // Only set error for unexpected errors
      if (!errorMessage.includes('permission') && !errorMessage.includes('device')) {
        setState((prev) => ({ 
          ...prev, 
          error: errorMessage 
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isRegistering: false }));
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    seconds: number = 0
  ) => {
    try {
      const id = await notificationService.scheduleLocalNotification(title, body, data, seconds);
      console.log('Local notification scheduled with ID:', id);
      return id;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      setState((prev) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to schedule notification' 
      }));
      return null;
    }
  };

  const requestPermissions = async () => {
    try {
      const permissions = await notificationService.requestNotificationPermissions();
      setState((prev) => ({ ...prev, permissionStatus: permissions.status }));
      
      if (permissions.status === 'granted') {
        await registerForPushNotificationsAsync();
      }
      
      return permissions;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setState((prev) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to request permissions' 
      }));
      return null;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const clearNotification = () => {
    setState((prev) => ({ ...prev, notification: null }));
  };

  return {
    // State
    expoPushToken: state.expoPushToken,
    notification: state.notification,
    permissionStatus: state.permissionStatus,
    isRegistering: state.isRegistering,
    error: state.error,
    
    // Actions
    registerForPushNotifications: registerForPushNotificationsAsync,
    scheduleLocalNotification,
    requestPermissions,
    clearError,
    clearNotification,
    
    // Utilities
    isPermissionGranted: state.permissionStatus === 'granted',
    hasToken: !!state.expoPushToken,
  };
}

// Sample notification data for testing
export const sampleNotifications = {
  orderConfirmed: (orderNumber: string) => ({
    title: 'Order Confirmed! 🎉',
    body: `Your order #${orderNumber} has been confirmed and is being prepared.`,
    data: { type: 'order', orderNumber, screen: 'order-details' },
  }),

  orderPreparing: (orderNumber: string) => ({
    title: 'Order Being Prepared 👨‍🍳',
    body: `Your order #${orderNumber} is being prepared by our chefs.`,
    data: { type: 'order', orderNumber, screen: 'order-details' },
  }),

  orderOutForDelivery: (orderNumber: string, estimatedTime: string) => ({
    title: 'Out for Delivery! 🚚',
    body: `Your order #${orderNumber} is out for delivery. Estimated arrival: ${estimatedTime}`,
    data: { type: 'order', orderNumber, screen: 'order-details' },
  }),

  orderDelivered: (orderNumber: string) => ({
    title: 'Order Delivered! ✅',
    body: `Your order #${orderNumber} has been delivered. Enjoy your meal!`,
    data: { type: 'order', orderNumber, screen: 'order-details' },
  }),

  newPromotion: (offer: string) => ({
    title: 'Special Offer! 🔥',
    body: offer,
    data: { type: 'promotion', screen: 'categories' },
  }),

  weeklySpecial: () => ({
    title: 'Weekly Special Available! 🥩',
    body: 'Check out this week\'s premium cuts at special prices.',
    data: { type: 'promotion', screen: 'categories' },
  }),
};