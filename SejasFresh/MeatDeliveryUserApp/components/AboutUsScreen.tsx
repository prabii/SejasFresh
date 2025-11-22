import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
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

// Company values data
const companyValues = [
  {
    id: '1',
    title: 'Fresh Quality',
    description: 'We source the freshest meat daily from certified suppliers.',
    icon: 'award',
  },
  {
    id: '2',
    title: 'Fast Delivery',
    description: 'Quick and reliable delivery to your doorstep.',
    icon: 'truck',
  },
  {
    id: '3',
    title: 'Customer First',
    description: 'Your satisfaction is our top priority.',
    icon: 'heart',
  },
  {
    id: '4',
    title: 'Hygiene Standards',
    description: 'Maintaining the highest hygiene and safety standards.',
    icon: 'shield',
  },
];

// Team members data


interface ValueItemProps {
  title: string;
  description: string;
  icon: string;
}

const ValueItem: React.FC<ValueItemProps> = ({ title, description, icon }) => {
  return (
    <View style={styles.valueItem}>
      <View style={styles.valueIconContainer}>
        <Feather name={icon as any} size={24} color={PRIMARY_RED} />
      </View>
      <View style={styles.valueContent}>
        <Text style={styles.valueTitle}>{title}</Text>
        <Text style={styles.valueDescription}>{description}</Text>
      </View>
    </View>
  );
};





const AboutUsScreen: React.FC = () => {
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
        
        <Text style={styles.headerTitle}>About Us</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../assets/images/sejas-logo.png')} 
            style={styles.companyLogo}
            resizeMode="contain"
          />
          <Text style={styles.companyName}>Seja&apos;s Absolute Fresh</Text>
          <Text style={styles.tagline}>Your trusted partner for fresh, quality meat delivery</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.aboutText}>
            Founded in 2020, Seja&apos;s Absolute Fresh has been serving the community with 
            the highest quality meat products. We believe that everyone deserves access 
            to fresh, premium meat at affordable prices.
          </Text>
          <Text style={styles.aboutText}>
            Our journey started with a simple mission: to bridge the gap between 
            traditional meat shops and modern convenience. Today, we serve thousands 
            of satisfied customers across the city.
          </Text>
        </View>

        {/* Mission & Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission & Vision</Text>
          
          <View style={styles.missionVisionContainer}>
            <View style={styles.missionItem}>
              <Text style={styles.missionTitle}>Our Mission</Text>
              <Text style={styles.missionText}>
                To provide fresh, high-quality meat products with exceptional service, 
                making healthy eating accessible to everyone.
              </Text>
            </View>
            
            <View style={styles.missionItem}>
              <Text style={styles.missionTitle}>Our Vision</Text>
              <Text style={styles.missionText}>
                To become the most trusted and preferred meat delivery service, 
                setting new standards in quality and customer satisfaction.
              </Text>
            </View>
          </View>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesList}>
            {companyValues.map((value) => (
              <ValueItem
                key={value.id}
                title={value.title}
                description={value.description}
                icon={value.icon}
              />
            ))}
          </View>
        </View>


        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10,000+</Text>
              <Text style={styles.statLabel}>Happy Customers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50,000+</Text>
              <Text style={styles.statLabel}>Orders Delivered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5+</Text>
              <Text style={styles.statLabel}>Years of Trust</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactText}>
            Have questions or feedback? We&apos;d love to hear from you!
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>📧 sejasabsolutefresh@gmail.com</Text>
            <Text style={styles.contactItem}>📞 +91 9704883731</Text>
            <Text style={styles.contactItem}>📍 Kochi, Kerala, India</Text>
          </View>
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

  // Hero Section
  heroSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    marginBottom: 16,
  },

  companyLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },

  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 16,
  },

  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },

  // Mission & Vision Styles
  missionVisionContainer: {
    gap: 20,
  },

  missionItem: {
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
  },

  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_RED,
    marginBottom: 8,
  },

  missionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Values Styles
  valuesList: {
    gap: 16,
  },

  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  valueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${PRIMARY_RED}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  valueContent: {
    flex: 1,
  },

  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  valueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Team Styles
  teamList: {
    gap: 16,
  },

  teamMember: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  memberInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 2,
  },

  memberPosition: {
    fontSize: 14,
    color: PRIMARY_RED,
    fontWeight: '500',
    marginBottom: 4,
  },

  memberDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },

  // Statistics Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_RED,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Contact Section
  contactSection: {
    backgroundColor: DARK_GRAY,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },

  contactText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },

  contactInfo: {
    alignItems: 'center',
    gap: 8,
  },

  contactItem: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },

  bottomSpacing: {
    height: 20,
  },
});

export default AboutUsScreen;