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
    deliveryAgent?: {
      name: string;
      phone: string;
    };
  };
}

class NotificationService {
  private VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

  /**
   * Register for web push notifications using Web Push API
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      console.log('🔔 Starting push notification registration...');
      
      // Check if browser supports service workers and push
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.error('❌ Browser does not support service workers or push notifications');
        console.log('Supported:', {
          serviceWorker: 'serviceWorker' in navigator,
          PushManager: 'PushManager' in window
        });
        return null;
      }

      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.error('❌ Browser does not support notifications');
        return null;
      }

      // Check current permission status
      const currentPermission = Notification.permission;
      console.log('Current notification permission:', currentPermission);
      
      // Request permission if not already granted
      let permission = currentPermission;
      if (currentPermission === 'default') {
        console.log('Requesting notification permission...');
        permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
      }
      
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission not granted:', permission);
        console.log('User needs to allow notifications in browser settings');
        return null;
      }
      
      console.log('✅ Notification permission granted');

      // Register service worker
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service worker registered:', registration.scope);
      } catch (error) {
        console.error('Service worker registration failed:', error);
        return null;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        if (!this.VAPID_PUBLIC_KEY) {
          console.error('VAPID_PUBLIC_KEY not configured. Please set VITE_VAPID_PUBLIC_KEY in .env');
          return null;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY) as BufferSource
        });
        console.log('Push subscription created');
      } else {
        // Check if subscription matches current VAPID key
        // If VAPID keys changed, we need to re-subscribe
        const currentKey = this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);
        try {
          // Try to get subscription details to verify it's still valid
          const subscriptionKey = subscription.getKey('p256dh');
          if (!subscriptionKey) {
            // Re-subscribe if key is missing
            console.log('Re-subscribing due to missing subscription key');
            await subscription.unsubscribe();
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: currentKey as BufferSource
            });
            console.log('Push subscription recreated');
          } else {
            console.log('Already subscribed to push notifications');
          }
        } catch (error) {
          // If subscription is invalid, re-subscribe
          console.log('Re-subscribing due to invalid subscription:', error);
          try {
            await subscription.unsubscribe();
          } catch (e) {
            // Ignore unsubscribe errors
          }
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: currentKey as BufferSource
          });
          console.log('Push subscription recreated');
        }
      }

      // Send subscription to backend
      try {
        const subscriptionJson = subscription.toJSON();
        console.log('📤 Sending subscription to backend...', {
          endpoint: subscriptionJson.endpoint?.substring(0, 50) + '...',
          hasKeys: !!(subscriptionJson.keys?.p256dh && subscriptionJson.keys?.auth)
        });
        
        const response = await api.post('/users/push-subscription', {
          subscription: subscriptionJson,
          platform: 'web'
        });
        
        if (response.data.success) {
          console.log('✅ Push subscription registered with backend successfully!');
          console.log('Subscription saved for user');
          localStorage.setItem('admin_push_subscription', JSON.stringify(subscriptionJson));
          return JSON.stringify(subscriptionJson);
        } else {
          console.error('❌ Failed to register push subscription:', response.data.message);
          return null;
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.response?.status === 401) {
          console.error('❌ Authentication required. Please log in again.');
          console.error('Response:', error.response?.data);
          // Clear any stale subscription
          localStorage.removeItem('admin_push_subscription');
        } else if (error.response?.status === 403) {
          console.error('❌ Permission denied. Please check your account permissions.');
          console.error('Response:', error.response?.data);
        } else {
          console.error('❌ Error registering push subscription:', error.response?.data || error.message);
          console.error('Full error:', error);
        }
        return null;
      }
    } catch (error: any) {
      console.error('Error requesting push notifications:', error);
      return null;
    }
  }

  /**
   * Convert VAPID public key from base64 URL to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show browser notification
   */
  showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'sejas-admin',
        requireInteraction: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate if URL is provided
        if (options?.data?.screen) {
          window.location.href = options.data.screen === 'orders' ? '/orders' : '/';
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
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
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

