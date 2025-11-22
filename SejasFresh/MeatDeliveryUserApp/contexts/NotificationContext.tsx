import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from './AuthContext';
import { notificationService, NotificationItem } from '../services/notificationService';

interface NotificationContextType {
  hasNotificationPermission: boolean;
  pushToken: string | null;
  requestPermissions: () => Promise<void>;
  scheduleTestNotification: () => Promise<void>;
  isRegistering: boolean;
  error: string | null;
  unreadCount: number;
  notifications: NotificationItem[];
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    expoPushToken,
    permissionStatus,
    isRegistering,
    error,
    requestPermissions,
    scheduleLocalNotification,
    clearError,
  } = useNotifications();

  // Safely get auth status - handle case where AuthProvider might not be ready
  let isAuthenticated = false;
  try {
    const authContext = useAuth();
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    // AuthProvider not available yet, default to false
    console.debug('AuthProvider not available in NotificationContext');
  }
  const [hasShownPermissionRequest, setHasShownPermissionRequest] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handlePermissionRequest = useCallback(async () => {
    try {
      const result = await requestPermissions();
      if (result?.status === 'granted') {
        console.log('Notification permissions granted');
      } else if (result?.status === 'denied') {
        // Show explanation about notification benefits
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications in your device settings to receive order updates and special offers.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  }, [requestPermissions]);

  // Auto-request permissions on first app load
  useEffect(() => {
    if (!hasShownPermissionRequest && permissionStatus === 'undetermined') {
      setHasShownPermissionRequest(true);
      handlePermissionRequest();
    }
  }, [permissionStatus, hasShownPermissionRequest, handlePermissionRequest]);

  const scheduleTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        'Test Notification 🧪',
        'This is a test notification from your Meat Delivery app!',
        { type: 'test', screen: 'categories' },
        5 // 5 seconds delay
      );
      
      Alert.alert(
        'Test Notification Scheduled',
        'You should receive a test notification in 5 seconds.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      Alert.alert(
        'Error',
        'Failed to schedule test notification. Please check permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  // Real-time notification polling
  const refreshNotifications = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      const response = await notificationService.getNotifications({ limit: 50 });
      if (response.success && response.data?.data) {
        const allNotifications = response.data.data;
        setNotifications(allNotifications);
        const unread = allNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      // Silently handle errors - user might not be authenticated
      console.debug('Error refreshing notifications:', error);
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Poll for new notifications every 15 seconds (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Initial fetch
    refreshNotifications();

    // Set up polling interval - faster polling for better real-time updates
    const interval = setInterval(() => {
      refreshNotifications();
    }, 10000); // Poll every 10 seconds for faster updates

    return () => clearInterval(interval);
  }, [refreshNotifications, isAuthenticated]);

  // Also refresh when app comes to foreground (for immediate updates after order placement)
  useEffect(() => {
    if (!isAuthenticated) return;

    let subscription: any = null;

    import('react-native').then(({ AppState }) => {
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          refreshNotifications();
        }
      };

      subscription = AppState.addEventListener('change', handleAppStateChange);
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isAuthenticated, refreshNotifications]);

  // Clear errors after showing them (only log actual errors, not expected scenarios)
  useEffect(() => {
    if (error) {
      // Only log if it's not an expected scenario (permissions, device, etc.)
      const isExpectedError = 
        error.includes('permission') || 
        error.includes('device') || 
        error.includes('Failed to get push notification token');
      
      if (!isExpectedError) {
        console.error('Notification error:', error);
      } else {
        console.debug('Notification (expected):', error);
      }
      
      // Auto-clear error after 5 seconds (faster for expected errors)
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const contextValue: NotificationContextType = {
    hasNotificationPermission: permissionStatus === 'granted',
    pushToken: expoPushToken,
    requestPermissions: handlePermissionRequest,
    scheduleTestNotification,
    isRegistering,
    error,
    unreadCount,
    notifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}