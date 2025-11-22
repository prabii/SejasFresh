import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color constants
const PRIMARY_RED = '#D32F2F';
const DARK_GRAY = '#333';

const InviteFriendsScreen: React.FC = () => {
  const router = useRouter();

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle send invite link
  const handleSendInviteLink = () => {
    // TODO: Implement actual invite functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={24} color={DARK_GRAY} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Invite friends</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration Container */}
        <View style={styles.illustrationContainer}>
          {/* Using a placeholder for the invite illustration */}
          <View style={styles.illustrationPlaceholder}>
            {/* Large INVITE Envelope */}
            <View style={styles.envelope}>
              <Text style={styles.inviteText}>INVITE</Text>
            </View>
            
            {/* Person 1 - Dark skin tone, holding envelope */}
            <View style={[styles.person, styles.person1]}>
              <View style={[styles.personHead, styles.darkSkin]} />
              <View style={[styles.personBody, styles.blackShirt]} />
              <View style={[styles.personLegs, styles.greyPants]} />
            </View>
            
            {/* Person 2 - Light skin tone, standing next to */}
            <View style={[styles.person, styles.person2]}>
              <View style={[styles.personHead, styles.lightSkin]} />
              <View style={[styles.personBody, styles.whiteShirt]} />
              <View style={[styles.personLegs, styles.redPants]} />
            </View>
          </View>
        </View>

        {/* Promotional Text */}
        <Text style={styles.promotionalText}>
          Invite friends, Get upto ₹100 OFF !
        </Text>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleSendInviteLink}
          activeOpacity={0.7}
        >
          <Text style={styles.inviteButtonText}>Send invite link</Text>
        </TouchableOpacity>

        {/* Additional Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. Share your unique invite link with friends
          </Text>
          <Text style={styles.infoText}>
            2. Your friends sign up using your link
          </Text>
          <Text style={styles.infoText}>
            3. Both you and your friend get ₹50 OFF on your next order
          </Text>
          <Text style={styles.infoText}>
            4. Invite more friends to earn up to ₹100 OFF!
          </Text>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          *Terms and conditions apply. Offer valid for new users only.
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

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },

  // Illustration Container Styles
  illustrationContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 320,
  },

  illustrationPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Envelope Styles
  envelope: {
    width: 120,
    height: 80,
    backgroundColor: PRIMARY_RED,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  inviteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Person Styles
  person: {
    position: 'absolute',
    alignItems: 'center',
  },

  person1: {
    left: 20,
    bottom: 0,
  },

  person2: {
    right: 20,
    bottom: 0,
  },

  personHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 2,
  },

  personBody: {
    width: 20,
    height: 30,
    borderRadius: 4,
    marginBottom: 2,
  },

  personLegs: {
    width: 16,
    height: 25,
    borderRadius: 4,
  },

  // Skin tones
  darkSkin: {
    backgroundColor: '#8D5524',
  },

  lightSkin: {
    backgroundColor: '#FDBCB4',
  },

  // Clothing colors
  blackShirt: {
    backgroundColor: '#2C2C2C',
  },

  whiteShirt: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  greyPants: {
    backgroundColor: '#808080',
  },

  redPants: {
    backgroundColor: PRIMARY_RED,
  },

  // Promotional Text Styles
  promotionalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_GRAY,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },

  // Button Styles
  inviteButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: PRIMARY_RED,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 40,
    minWidth: 200,
    alignItems: 'center',
  },

  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_RED,
  },

  // Info Section Styles
  infoSection: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },

  // Terms Styles
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});

export default InviteFriendsScreen;