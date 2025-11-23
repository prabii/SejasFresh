import api from './api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'delivery' | 'product' | 'payment' | 'welcome' | 'system_announcement';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    screen?: string;
    action?: string;
    status?: string;
  };
}

class NotificationService {
  /**
   * Register for web push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // For web, generate a unique token
      const token = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Register token with backend
      try {
        await api.post('/users/push-token', {
          pushToken: token,
          platform: 'web'
        });
        console.log('Push token registered:', token);
        localStorage.setItem('delivery_push_token', token);
        return token;
      } catch (error) {
        console.error('Error registering push token:', error);
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  /**
   * Show browser notification
   */
  showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'sejas-delivery',
        requireInteraction: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate if URL is provided
        if (options?.data?.screen) {
          if (options.data.screen === 'orders') {
            window.location.href = '/orders';
          } else if (options.data.screen === 'dashboard') {
            window.location.href = '/';
          }
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  /**
   * Get all notifications
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data.data || { notifications: [], total: 0 };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await api.patch('/notifications/read-all');
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<boolean> {
    try {
      await api.delete('/notifications/clear-all');
      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

