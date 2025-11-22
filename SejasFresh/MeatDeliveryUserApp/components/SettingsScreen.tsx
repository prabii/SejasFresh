import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationContext } from '../contexts/NotificationContext';

// Color constants
const PRIMARY_RED = '#D32F2F';
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#666';
const LIGHT_GRAY = '#F5F5F5';
const SEPARATOR_COLOR = '#E8E8E8';

// Setting types
type SettingType = 'toggle' | 'navigation';

// Setting interface
interface Setting {
  id: string;
  leftIcon: string;
  iconType: 'feather' | 'antdesign' | 'materialicons';
  label: string;
  type: SettingType;
  toggleValue?: boolean;
  action: () => void;
}

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { 
    hasNotificationPermission, 
    pushToken, 
    requestPermissions, 
    scheduleTestNotification,
    isRegistering
  } = useNotificationContext();  // State for toggle switches
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);

  };

  // Handle app language
  const handleAppLanguage = () => {
    
  };

  // Handle accessibility features
  const handleAccessibilityFeatures = () => {
    
  };

  // Handle notification settings
  const handleNotificationSettings = () => {
    const permissionStatus = hasNotificationPermission ? 'Enabled' : 'Disabled';
    const tokenStatus = pushToken ? 'Connected' : 'Not Connected';
    
    Alert.alert(
      'Notification Settings',
      `Permission: ${permissionStatus}\nPush Token: ${tokenStatus}\n\nWhat would you like to do?`,
      [
        {
          text: 'Request Permissions',
          onPress: requestPermissions,
          style: 'default',
        },
        {
          text: 'Test Notification',
          onPress: scheduleTestNotification,
          style: 'default',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle auto-update toggle
  const handleAutoUpdateToggle = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);

  };

  // Settings data
  const settings: Setting[] = [
    {
      id: '1',
      leftIcon: 'settings',
      iconType: 'feather',
      label: 'Dark Mode / Light Mode Toggle',
      type: 'toggle',
      toggleValue: darkModeEnabled,
      action: handleDarkModeToggle,
    },
    {
      id: '2',
      leftIcon: 'language',
      iconType: 'materialicons',
      label: 'App Language',
      type: 'navigation',
      action: handleAppLanguage,
    },
    {
      id: '3',
      leftIcon: 'accessibility',
      iconType: 'materialicons',
      label: 'Accessibility Features',
      type: 'navigation',
      action: handleAccessibilityFeatures,
    },
    {
      id: '4',
      leftIcon: 'bell',
      iconType: 'feather',
      label: 'Notification Sounds & Vibration',
      type: 'navigation',
      action: handleNotificationSettings,
    },
    {
      id: '5',
      leftIcon: 'refresh-cw',
      iconType: 'feather',
      label: 'Auto-Update App Settings',
      type: 'toggle',
      toggleValue: autoUpdateEnabled,
      action: handleAutoUpdateToggle,
    },
  ];

  // Render icon based on type
  const renderIcon = (iconName: string, iconType: string, color: string) => {
    const iconProps = {
      name: iconName as any,
      size: 22,
      color: color,
    };

    switch (iconType) {
      case 'feather':
        return <Feather {...iconProps} />;
      case 'antdesign':
        return <AntDesign {...iconProps} />;
      case 'materialicons':
        return <MaterialIcons {...iconProps} />;
      default:
        return <Feather {...iconProps} />;
    }
  };

  // Render right control (toggle or arrow)
  const renderRightControl = (setting: Setting) => {
    if (setting.type === 'toggle') {
      const toggleValue = setting.id === '1' ? darkModeEnabled : autoUpdateEnabled;
      return (
        <Switch
          value={toggleValue}
          onValueChange={setting.action}
          trackColor={{ false: '#E0E0E0', true: PRIMARY_RED }}
          thumbColor={toggleValue ? '#FFFFFF' : '#F4F3F4'}
          ios_backgroundColor="#E0E0E0"
        />
      );
    } else {
      return (
        <View style={styles.rightIconContainer}>
          <AntDesign name="right" size={16} color={MEDIUM_GRAY} />
        </View>
      );
    }
  };

  // Render setting item
  const renderSettingItem = (setting: Setting, index: number) => {
    const isLastItem = index === settings.length - 1;
    
    return (
      <TouchableOpacity
        key={setting.id}
        style={[styles.settingItem, isLastItem && styles.lastSettingItem]}
        onPress={setting.type === 'navigation' ? setting.action : undefined}
        activeOpacity={setting.type === 'navigation' ? 0.7 : 1}
        disabled={setting.type === 'toggle'}
      >
        {/* Left Icon */}
        <View style={styles.leftIconContainer}>
          {renderIcon(setting.leftIcon, setting.iconType, MEDIUM_GRAY)}
        </View>

        {/* Text Label */}
        <Text style={styles.settingLabel}>{setting.label}</Text>

        {/* Right Control */}
        {renderRightControl(setting)}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={24} color={DARK_GRAY} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Settings</Text>
        
        {/* Notification Status Indicator */}
        <TouchableOpacity style={styles.notificationStatus} onPress={handleNotificationSettings}>
          <Feather 
            name="bell" 
            size={20} 
            color={hasNotificationPermission ? PRIMARY_RED : MEDIUM_GRAY} 
          />
          {isRegistering && (
            <View style={styles.loadingDot} />
          )}
        </TouchableOpacity>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {settings.map((setting, index) => renderSettingItem(setting, index))}
      </View>

      {/* Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>App Information</Text>
        <Text style={styles.infoText}>
          Customize your app experience with these settings. Changes will be applied immediately.
        </Text>
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.buildText}>Build 2025.10.09</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Styles
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_GRAY,
    textAlign: 'center',
  },

  // Settings List Styles
  settingsList: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: SEPARATOR_COLOR,
    minHeight: 60,
  },

  lastSettingItem: {
    borderBottomWidth: 0,
  },

  leftIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: DARK_GRAY,
    lineHeight: 20,
  },

  rightIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Information Section Styles
  infoSection: {
    backgroundColor: LIGHT_GRAY,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    lineHeight: 20,
    marginBottom: 16,
  },

  versionInfo: {
    borderTopWidth: 1,
    borderTopColor: SEPARATOR_COLOR,
    paddingTop: 16,
    alignItems: 'center',
  },

  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  buildText: {
    fontSize: 12,
    color: MEDIUM_GRAY,
  },

  notificationStatus: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  loadingDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_RED,
  },
});

export default SettingsScreen;