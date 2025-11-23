import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, Notification as NotificationType } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  loading: boolean;
  registerPushNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Register for push notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      registerPushNotifications();
      refreshNotifications();
      
      // Poll for notifications every 30 seconds
      const interval = setInterval(() => {
        refreshNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Listen for push notifications from backend
  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up a listener for browser notifications
    const handleFocus = () => {
      refreshNotifications();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  const registerPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        console.log('Push notifications registered');
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const [notificationsData, count] = await Promise.all([
        notificationService.getNotifications(1, 20),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData.notifications || []);
      setUnreadCount(count);
      
      // Show browser notification for new unread notifications
      if (count > 0 && 'Notification' in window && Notification.permission === 'granted') {
        const unreadNotifications = (notificationsData.notifications || []).filter(n => !n.isRead);
        if (unreadNotifications.length > 0) {
          const latest = unreadNotifications[0];
          notificationService.showNotification(latest.title, {
            body: latest.message,
            data: latest.metadata
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        registerPushNotifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

