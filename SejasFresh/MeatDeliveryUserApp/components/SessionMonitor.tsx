/**
 * Session Monitor Component
 * Monitors authentication session and shows warnings when close to expiry
 */

import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { checkSessionExpiry, getSessionInfo, refreshSession } from '../utils/sessionManager';

const PRIMARY_RED = '#D13635';

const SessionMonitor: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkExpiry();
      
      // Check every hour
      const interval = setInterval(checkExpiry, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkExpiry = async () => {
    try {
      const isExpiring = await checkSessionExpiry();
      const sessionInfo = await getSessionInfo();
      
      setIsExpiringSoon(isExpiring);
      setDaysRemaining(sessionInfo.daysRemaining);
      
      // Show alert for very urgent cases (< 1 day)
      if (sessionInfo.daysRemaining && sessionInfo.daysRemaining < 1) {
        Alert.alert(
          'Session Expiring Soon',
          'Your session will expire in less than 24 hours. Please login again to continue using the app.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Login Now', onPress: refreshSession }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking session expiry:', error);
    }
  };

  const handleRefreshSession = () => {
    Alert.alert(
      'Refresh Session',
      `Your session will expire in ${daysRemaining} day(s). Would you like to login again to extend your session?`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Login Now', onPress: refreshSession }
      ]
    );
  };

  // Don't show if not authenticated or not expiring soon
  if (!isAuthenticated || !isExpiringSoon || !daysRemaining) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather name="clock" size={16} color={PRIMARY_RED} />
        <Text style={styles.message}>
          Session expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity onPress={handleRefreshSession} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Extend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_RED,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },

  message: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  refreshButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  refreshText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SessionMonitor;