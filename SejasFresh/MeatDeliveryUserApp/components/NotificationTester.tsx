import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotificationContext } from '../contexts/NotificationContext';

const PRIMARY_RED = '#D13635';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#666';

interface NotificationTesterProps {
  title?: string;
  showStatus?: boolean;
}

export const NotificationTester: React.FC<NotificationTesterProps> = ({ 
  title = 'Notification Testing',
  showStatus = true 
}) => {
  const { 
    hasNotificationPermission, 
    pushToken, 
    requestPermissions, 
    scheduleTestNotification,
    isRegistering,
    error 
  } = useNotificationContext();

  const testOrderNotifications = async () => {
    Alert.alert(
      'Test Order Notifications',
      'This will schedule multiple order status notifications with delays.',
      [
        {
          text: 'Start Test',
          onPress: async () => {
            // Schedule order confirmation notification (immediate)
            await scheduleTestNotification();
            
            // You can also use the notification service directly for more complex scenarios
            // For now, just show one test notification
            Alert.alert('Test Started', 'You should receive a test notification shortly!');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const testPromotionNotification = async () => {
    Alert.alert(
      'Test Promotion',
      'Schedule a promotional notification?',
      [
        {
          text: 'Send Now',
          onPress: () => scheduleTestNotification()
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showNotificationInfo = () => {
    const status = hasNotificationPermission ? 'Enabled ✅' : 'Disabled ❌';
    const tokenStatus = pushToken ? 'Available ✅' : 'Not Available ❌';
    const registrationStatus = isRegistering ? 'Registering...' : 'Ready';
    
    Alert.alert(
      'Notification Status',
      `Permission: ${status}\nPush Token: ${tokenStatus}\nRegistration: ${registrationStatus}${error ? `\nError: ${error}` : ''}`,
      [
        {
          text: 'Request Permissions',
          onPress: requestPermissions,
          style: !hasNotificationPermission ? 'default' : 'cancel'
        },
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {showStatus && (
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Feather 
              name="bell" 
              size={16} 
              color={hasNotificationPermission ? PRIMARY_RED : MEDIUM_GRAY} 
            />
            <Text style={[styles.statusText, !hasNotificationPermission && styles.disabledText]}>
              {hasNotificationPermission ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Feather 
              name="wifi" 
              size={16} 
              color={pushToken ? PRIMARY_RED : MEDIUM_GRAY} 
            />
            <Text style={[styles.statusText, !pushToken && styles.disabledText]}>
              {pushToken ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          {isRegistering && (
            <View style={styles.statusItem}>
              <Feather name="loader" size={16} color={PRIMARY_RED} />
              <Text style={styles.statusText}>Registering...</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={showNotificationInfo}
        >
          <Feather name="info" size={16} color="white" />
          <Text style={styles.primaryButtonText}>Status Info</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testOrderNotifications}
          disabled={!hasNotificationPermission}
        >
          <Feather name="package" size={16} color={hasNotificationPermission ? PRIMARY_RED : MEDIUM_GRAY} />
          <Text style={[styles.secondaryButtonText, !hasNotificationPermission && styles.disabledText]}>
            Test Order
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testPromotionNotification}
          disabled={!hasNotificationPermission}
        >
          <Feather name="tag" size={16} color={hasNotificationPermission ? PRIMARY_RED : MEDIUM_GRAY} />
          <Text style={[styles.secondaryButtonText, !hasNotificationPermission && styles.disabledText]}>
            Test Promo
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-triangle" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_GRAY,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 12,
    textAlign: 'center',
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusText: {
    fontSize: 12,
    color: DARK_GRAY,
    fontWeight: '500',
  },

  disabledText: {
    color: MEDIUM_GRAY,
  },

  buttonContainer: {
    gap: 8,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },

  primaryButton: {
    backgroundColor: PRIMARY_RED,
  },

  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: PRIMARY_RED,
  },

  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  secondaryButtonText: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontWeight: '600',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFE6E6',
    borderRadius: 6,
  },

  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    flex: 1,
  },
});

export default NotificationTester;