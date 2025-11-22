/**
 * Session Management Utilities
 * Handles persistent authentication sessions and navigation
 */

import { router } from 'expo-router';
import { getAuthSession } from '../services/authService';

export interface SessionInfo {
  isAuthenticated: boolean;
  expiresAt: number | null;
  userId: string | null;
  daysRemaining: number | null;
}

/**
 * Get current session information
 */
export const getSessionInfo = async (): Promise<SessionInfo> => {
  try {
    const session = await getAuthSession();
    if (!session) {
      return {
        isAuthenticated: false,
        expiresAt: null,
        userId: null,
        daysRemaining: null
      };
    }
    const now = Date.now();
    const isValid = now <= session.expiresAt;
    const daysRemaining = isValid ? Math.ceil((session.expiresAt - now) / (24 * 60 * 60 * 1000)) : 0;

    return {
      isAuthenticated: isValid,
      expiresAt: session.expiresAt,
      userId: session.userId,
      daysRemaining: isValid ? daysRemaining : null
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return {
      isAuthenticated: false,
      expiresAt: null,
      userId: null,
      daysRemaining: null
    };
  }
};

/**
 * Navigate user to appropriate screen based on authentication status
 */
export const navigateBasedOnAuth = async () => {
  try {
    const sessionInfo = await getSessionInfo();
    
    if (sessionInfo.isAuthenticated) {
      console.log(`User authenticated, ${sessionInfo.daysRemaining} days remaining`);
      router.replace('/(tabs)');
    } else {
      console.log('User not authenticated, redirecting to login');
      router.replace('/auth/login');
    }
  } catch (error) {
    console.error('Error in navigateBasedOnAuth:', error);
    router.replace('/auth/login');
  }
};

/**
 * Clear expired sessions on app start
 */
export const cleanupExpiredSessions = async () => {
  try {
    const sessionInfo = await getSessionInfo();
    
    if (!sessionInfo.isAuthenticated && sessionInfo.expiresAt) {
      // Session has expired, clean up
      try {
        // Use dynamic import to avoid potential cycles
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.multiRemove(['authSession', 'userData']);
      } catch (e) {
        console.error('Failed to remove expired session data from storage:', e);
      }
      console.log('Cleaned up expired session');
    }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};

/**
 * Show session expiry warning when close to expiration
 */
export const checkSessionExpiry = async (): Promise<boolean> => {
  try {
    const sessionInfo = await getSessionInfo();
    
    if (sessionInfo.isAuthenticated && sessionInfo.daysRemaining) {
      // Warn if less than 2 days remaining
      if (sessionInfo.daysRemaining <= 2) {
        console.log(`Session expiring in ${sessionInfo.daysRemaining} days`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return false;
  }
};

/**
 * Extend session by logging in again
 */
export const refreshSession = async () => {
  try {
    // This would typically involve refreshing the token with the backend
    // For now, we'll just navigate to login
    router.push('/auth/login');
  } catch (error) {
    console.error('Error refreshing session:', error);
  }
};

export default {
  getSessionInfo,
  navigateBasedOnAuth,
  cleanupExpiredSessions,
  checkSessionExpiry,
  refreshSession,
};