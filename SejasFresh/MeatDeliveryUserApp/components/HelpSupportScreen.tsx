import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color constants
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#666';
const LIGHT_GRAY = '#F5F5F5';
const SEPARATOR_COLOR = '#E8E8E8';

// Support option interface
interface SupportOption {
  id: string;
  leftIcon: string;
  iconType: 'feather' | 'antdesign' | 'materialicons';
  label: string;
  action: () => void;
}

const HelpSupportScreen: React.FC = () => {
  const router = useRouter();

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle report an issue
  const handleReportIssue = () => {
    Alert.alert(
      'Report an Issue',
      'You can report issues through:\n\n• Live chat with our support team\n• Email support\n• Phone support\n\nWhich method would you prefer?',
      [
        {
          text: 'Live Chat',
          onPress: () => Alert.alert('Live Chat', 'Starting live chat session...'),
        },
        {
          text: 'Email',
          onPress: () => Alert.alert('Email Support', 'Opening email support...'),
        },
        {
          text: 'Phone',
          onPress: () => Alert.alert('Phone Support', 'Calling support: +91 9704883731'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle FAQs & Self-Help Guides
  const handleFAQsGuides = () => {
    Alert.alert(
      'FAQs & Self-Help Guides',
      'Browse our comprehensive help resources:\n\n• Frequently Asked Questions\n• Step-by-step guides\n• Video tutorials\n• Troubleshooting tips',
      [
        {
          text: 'Browse FAQs',
          onPress: () => Alert.alert('FAQs', 'Opening FAQ section...'),
        },
        {
          text: 'Self-Help Guides',
          onPress: () => Alert.alert('Guides', 'Opening self-help guides...'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Support options data
  const supportOptions: SupportOption[] = [
    {
      id: '1',
      leftIcon: 'headset',
      iconType: 'materialicons',
      label: 'Report a issue',
      action: handleReportIssue,
    },
    {
      id: '2',
      leftIcon: 'help-circle',
      iconType: 'feather',
      label: 'FAQs & Self-Help Guides',
      action: handleFAQsGuides,
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

  // Render support option item
  const renderSupportItem = (option: SupportOption, index: number) => {
    const isLastItem = index === supportOptions.length - 1;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.supportItem, isLastItem && styles.lastSupportItem]}
        onPress={option.action}
        activeOpacity={0.7}
      >
        {/* Left Icon */}
        <View style={styles.leftIconContainer}>
          {renderIcon(option.leftIcon, option.iconType, MEDIUM_GRAY)}
        </View>

        {/* Text Label */}
        <Text style={styles.supportLabel}>{option.label}</Text>

        {/* Right Arrow Icon */}
        <View style={styles.rightIconContainer}>
          <AntDesign name="right" size={16} color={MEDIUM_GRAY} />
        </View>
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
        
        <Text style={styles.headerTitle}>Help & Support</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      {/* Support Options List */}
      <View style={styles.supportList}>
        {supportOptions.map((option, index) => renderSupportItem(option, index))}
      </View>

      {/* Contact Information Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Contact Information</Text>
        
        <View style={styles.contactDetails}>
          <View style={styles.contactItem}>
            <Feather name="phone" size={18} color={MEDIUM_GRAY} />
            <Text style={styles.contactText}>+91 9704883731</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Feather name="mail" size={18} color={MEDIUM_GRAY} />
            <Text style={styles.contactText}>sejasabsolutefresh@gmail.com</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Feather name="clock" size={18} color={MEDIUM_GRAY} />
            <Text style={styles.contactText}>Mon-Sat: 9:00 AM - 8:00 PM</Text>
          </View>
        </View>
      </View>

      {/* Quick Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Quick Tips</Text>
        <Text style={styles.tipText}>
          💡 Before contacting support, try checking our FAQs for instant answers
        </Text>
        <Text style={styles.tipText}>
          📱 For faster service, have your order number ready when contacting us
        </Text>
        <Text style={styles.tipText}>
          🕒 Response times: Live chat (instant), Email (2-4 hours), Phone (immediate)
        </Text>
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

  // Support List Styles
  supportList: {
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

  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: SEPARATOR_COLOR,
    minHeight: 60,
  },

  lastSupportItem: {
    borderBottomWidth: 0,
  },

  leftIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  supportLabel: {
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

  // Contact Information Styles
  contactSection: {
    backgroundColor: LIGHT_GRAY,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
  },

  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 16,
  },

  contactDetails: {
    gap: 12,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  contactText: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    flex: 1,
  },

  // Quick Tips Styles
  tipsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 0,
  },

  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 16,
  },

  tipText: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default HelpSupportScreen;