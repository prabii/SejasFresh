import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color constants
const PRIMARY_RED = '#D32F2F';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
const LIGHT_PINK = '#FFF1F1';
const GREEN_COLOR = '#2E7D32';

// Support options data
const supportOptions = [
  {
    id: '1',
    title: 'Call Us',
    description: 'Speak directly with our support team',
    icon: 'phone',
    iconType: 'feather',
    action: 'call',
    value: '+91 9704883731',
    color: GREEN_COLOR,
  },
  {
    id: '2',
    title: 'WhatsApp',
    description: 'Chat with us on WhatsApp',
    icon: 'message-circle',
    iconType: 'feather',
    action: 'whatsapp',
    value: '+919704883731',
    color: '#25D366',
  },
  {
    id: '3',
    title: 'Email Us',
    description: 'Send us an email for detailed queries',
    icon: 'mail',
    iconType: 'feather',
    action: 'email',
    value: 'sejasabsolutefresh@gmail.com',
    color: '#1976D2',
  },
];

// Operating hours data
const operatingHours = [
  { day: 'Everyday', hours: '7:00 AM - 7:00 PM' },
];

interface SupportOptionProps {
  title: string;
  description: string;
  icon: string;
  iconType: string;
  action: string;
  value: string;
  color: string;
}

const SupportOption: React.FC<SupportOptionProps> = ({
  title,
  description,
  icon,
  iconType,
  action,
  value,
  color,
}) => {
  const handlePress = () => {
    switch (action) {
      case 'call':
        Linking.openURL(`tel:${value}`);
        break;
      case 'whatsapp':
        Linking.openURL(`whatsapp://send?phone=${value}&text=Hello, I need support with my order.`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}?subject=Customer Support Request`);
        break;
      default:
        console.log(`Contact option: ${title}`);
    }
  };

  const renderIcon = () => {
    if (iconType === 'material') {
      return <MaterialIcons name={icon as any} size={24} color={color} />;
    }
    return <Feather name={icon as any} size={24} color={color} />;
  };

  return (
    <TouchableOpacity style={styles.supportOption} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        {renderIcon()}
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
        {value ? <Text style={styles.optionValue}>{value}</Text> : null}
      </View>
      <AntDesign name="right" size={16} color="#CCC" />
    </TouchableOpacity>
  );
};

const CustomerSupportScreen: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Customer Support</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro Section */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>We&apos;re Here to Help!</Text>
          <Text style={styles.introText}>
            Our customer support team is available to assist you with any questions 
            or concerns about your orders, delivery, or our services.
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <View style={styles.supportOptionsList}>
            {supportOptions.map((option) => (
              <SupportOption
                key={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                iconType={option.iconType}
                action={option.action}
                value={option.value}
                color={option.color}
              />
            ))}
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Hours</Text>
          <View style={styles.hoursContainer}>
            {operatingHours.map((schedule, index) => (
              <View key={index} style={styles.hoursRow}>
                <Text style={styles.dayText}>{schedule.day}</Text>
                <Text style={styles.hoursText}>{schedule.hours}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Emergency Contact</Text>
          <Text style={styles.emergencyText}>
            For urgent delivery issues or complaints
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+919704883731')}
          >
            <Feather name="phone" size={20} color="white" />
            <Text style={styles.emergencyButtonText}>Call Now: +91 9704883731</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    borderRadius: 8,
    backgroundColor: LIGHT_PINK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },

  introSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },

  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 12,
  },

  introText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },

  // Section Styles
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 16,
  },

  // Support Options Styles
  supportOptionsList: {
    gap: 1,
  },

  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  optionValue: {
    fontSize: 14,
    color: PRIMARY_RED,
    fontWeight: '500',
  },

  // Operating Hours Styles
  hoursContainer: {
    gap: 12,
  },

  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dayText: {
    fontSize: 16,
    color: DARK_GRAY,
    fontWeight: '500',
  },

  hoursText: {
    fontSize: 16,
    color: '#666',
  },

  // Quick Help Styles
  quickHelpContainer: {
    gap: 12,
  },

  quickHelpItem: {
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
  },

  quickHelpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  quickHelpDesc: {
    fontSize: 14,
    color: '#666',
  },

  // Emergency Section Styles
  emergencySection: {
    backgroundColor: PRIMARY_RED,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },

  emergencyText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },

  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 20,
  },
});

export default CustomerSupportScreen;