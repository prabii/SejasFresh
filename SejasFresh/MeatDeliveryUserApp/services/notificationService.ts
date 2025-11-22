import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Get API URL from app configuration
const getApiUrl = () => {
  const extra = Constants.expoConfig?.extra;
  
  if (__DEV__) {
    // Development mode - use local server
    const apiHost = extra?.apiHost || '192.168.1.5';
    const apiPort = extra?.apiPort || '5000';
    return `http://${apiHost}:${apiPort}/api`;
  } else {
    // Production mode - use production URL
    return extra?.productionApiUrl || 'https://meat-delivery-backend.onrender.com/api';
  }
};

const API_BASE_URL = getApiUrl();

// Configure how notifications are handled when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationItem {
  _id: string;
  id: string; // Backend also returns this
  title: string;
  message: string;
  type: 'order' | 'offer' | 'delivery' | 'product' | 'payment' | 'welcome' | 'system_announcement';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isRead: boolean;
  isActive: boolean;
  isRecent?: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  recipient?: string;
  channels?: {
    push?: { sent: boolean; sentAt?: string };
    email?: { sent: boolean; sentAt?: string };
    sms?: { sent: boolean; sentAt?: string };
    inApp?: { sent: boolean; sentAt?: string };
  };
  metadata?: {
    // Backend sends orderId as string, orderNumber as string, screen as string
    orderId?: string | {
      orderNumber: string;
      status: string;
    };
    orderNumber?: string;
    screen?: string;
    productId?: string | {
      name: string;
      price: number;
    };
    couponId?: {
      code: string;
      discount: number;
    };
    [key: string]: any; // Allow any additional metadata fields
  };
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    data: NotificationItem[]; // Backend returns notifications in data.data
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

class NotificationService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Use authService token cache to avoid reading AsyncStorage every time
    try {
      const token = await import('./authService').then(m => m.authService.getToken());
      if (!token) {
        // Return headers without auth token instead of throwing
        return {
          'Content-Type': 'application/json',
        };
      }
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      // Return basic headers if token fetch fails
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  private async handleResponse(response: Response) {
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  // ===== EXPO PUSH NOTIFICATIONS METHODS =====

  /**
   * Register for push notifications and get push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D13635',
        sound: 'default',
      });

      // Create channels for different notification types
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D13635',
        sound: 'default',
        description: 'Notifications about your order status',
      });

      await Notifications.setNotificationChannelAsync('promotions', {
        name: 'Promotions & Offers',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#D13635',
        sound: 'default',
        description: 'Special offers and promotional notifications',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const projectId = '2ba16e37-acef-4bf5-a74b-ab54e880e43e'; // Your EAS project ID
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
      } catch (error: any) {
        // Fail gracefully - Firebase might not be configured yet
        // This is expected if Firebase credentials aren't set up
        if (error?.message?.includes('Firebase') || error?.message?.includes('FCM')) {
          console.debug('Push notifications not configured (Firebase setup required):', error.message);
        } else {
          console.debug('Error getting push token:', error);
        }
        // Return null instead of throwing - app can work without push notifications
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * Send push token to backend
   */
  async sendPushTokenToBackend(token: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      // Check if we have auth token - if not, don't try to send
      const authHeader = Array.isArray(headers) 
        ? headers.find(([key]) => key.toLowerCase() === 'authorization')?.[1]
        : (headers as Record<string, string>)['Authorization'];
      if (!authHeader) {
        // User not authenticated, skip sending push token
        return false;
      }
      
      const response = await fetch(`${API_BASE_URL}/users/push-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pushToken: token,
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        console.log('Push token sent to backend successfully');
        return true;
      } else {
        // Don't log error if it's just "not authorized" - user might not be logged in
        const data = await response.json().catch(() => ({}));
        if (!data.message?.includes('authorized') && !data.message?.includes('Not authorized')) {
          console.debug('Failed to send push token to backend');
        }
        return false;
      }
    } catch (error: any) {
      // Don't log error if it's just "not authorized"
      if (!error.message?.includes('authorized') && !error.message?.includes('Not authorized')) {
        console.debug('Error sending push token to backend:', error);
      }
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    seconds: number = 0
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: seconds > 0 ? { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
      });
      return id;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get notification permissions status
   */
  async getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }

  /**
   * Add listener for notifications received while app is in foreground
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add listener for notification responses (when user taps notification)
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // ===== EXISTING BACKEND NOTIFICATION METHODS =====

  /**
   * Get user notifications with pagination and filtering
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    category?: string;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationResponse> {
    try {
      // Check if user is authenticated before making request
      const token = await import('./authService').then(m => m.authService.getToken());
      if (!token) {
        // User not authenticated, return empty response silently
        return {
          success: true,
          message: 'Not authenticated',
          data: {
            data: [],
            pagination: {
              current: 1,
              pages: 1,
              total: 0,
              limit: params?.limit || 20
            }
          }
        };
      }

      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.type) queryParams.append('type', params.type);

      const response = await fetch(
        `${API_BASE_URL}/notifications?${queryParams.toString()}`,
        {
          method: 'GET',
          headers,
        }
      );

      return await this.handleResponse(response);
    } catch (error: any) {
      // If error is about authentication, return empty response instead of throwing
      if (error.message?.includes('authorized') || error.message?.includes('authentication')) {
        return {
          success: true,
          message: 'Not authenticated',
          data: {
            data: [],
            pagination: {
              current: 1,
              pages: 1,
              total: 0,
              limit: params?.limit || 20
            }
          }
        };
      }
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get a specific notification by ID
   */
  async getNotification(id: string): Promise<{ success: boolean; message: string; data: NotificationItem }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<{ success: boolean; message: string; data: NotificationItem }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string; data: { modifiedCount: number } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<{ success: boolean; message: string; data: { modifiedCount: number } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/clear-all`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: any): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Send welcome notification (called during registration)
   */
  async sendWelcomeNotification(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/welcome`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      throw error;
    }
  }

  /**
   * Test connection to notification service
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Testing notification service connection...');
      console.log('API Base URL:', API_BASE_URL);
      
      const headers = await this.getAuthHeaders();
      console.log('Auth headers:', headers);
      
      // First test the unread count endpoint
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers,
      });

      console.log('Test response status:', response.status);
      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test failed with error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Test connection successful:', result);
      
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  /**
   * Test fetching notifications directly
   */
  async testGetNotifications(): Promise<NotificationResponse> {
    try {
      console.log('Testing getNotifications...');
      
      const response = await fetch(`${API_BASE_URL}/notifications?page=1&limit=5`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      console.log('Get notifications response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get notifications failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Get notifications result:', JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('Test getNotifications failed:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();