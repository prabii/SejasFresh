import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Import the logo - adjust path as needed
const sejaLogo = require('../assets/images/sejas-logo.png');

const RED_COLOR = '#D13635';

const RegistrationSuccessScreen: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Auto redirect after 5 seconds if user is authenticated
    if (isAuthenticated) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.replace('/(tabs)');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAuthenticated, router]);
  
  const handleExploreNow = () => {
    // Navigate to the main app homepage (tabs)
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      // If not authenticated, go back to login
      router.replace('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image source={sejaLogo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Success Title */}
      <View style={styles.titleSection}>
        <Text style={styles.successTitle}>Welcome!</Text>
      </View>

      {/* Subtext */}
      <View style={styles.subtextSection}>
        <Text style={styles.subtextMessage}>
          Success! You&apos;re all set. Welcome aboard! 🎉
        </Text>
        {isAuthenticated && countdown > 0 && (
          <Text style={styles.countdownText}>
            Redirecting in {countdown} seconds...
          </Text>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.exploreButton} onPress={handleExploreNow}>
          <Text style={styles.exploreButtonText}>
            {countdown > 0 ? `Explore Now! (${countdown})` : 'Explore Now!'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },

  logo: {
    width: 300,
    height: 150,
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },

  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },

  subtextSection: {
    alignItems: 'center',
    marginBottom: 80,
    paddingHorizontal: 20,
  },

  subtextMessage: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },

  countdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: RED_COLOR,
    textAlign: 'center',
    marginTop: 10,
  },

  buttonSection: {
    alignItems: 'center',
    marginTop: 40,
  },

  exploreButton: {
    backgroundColor: RED_COLOR,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: RED_COLOR,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  exploreButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default RegistrationSuccessScreen;