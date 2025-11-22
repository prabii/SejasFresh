import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const RED_COLOR = '#D13635';

const SimpleLoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle phone number input (only digits, max 10)
  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  // Direct login without OTP - just check if user exists and auto-login
  const handleLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Validate Indian phone number (starts with 6-9)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Invalid Phone Number', 'Phone number must start with 6, 7, 8, or 9');
      return;
    }

    try {
      setLoading(true);
      
      // Format phone number with country code
      const formattedPhone = `+91${phone}`;
      
      // Direct login - just verify phone exists and login
      const response = await authService.login({ phone: formattedPhone });
      
      if (response.success && response.token && response.user) {
        // Auto-login the user
        await login(response.user, response.token);
        
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', response.message || 'User not found. Please sign up first.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isPhoneValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/sejas-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputWrapper}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>
          {phone.length > 0 && phone.length < 10 && (
            <Text style={styles.helperText}>Enter 10-digit phone number</Text>
          )}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.otpButton, !isPhoneValid && styles.otpButtonDisabled]}
          onPress={handleLogin}
          disabled={!isPhoneValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.otpButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SimpleLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 100,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  otpButton: {
    backgroundColor: RED_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: RED_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  otpButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  otpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: RED_COLOR,
    fontWeight: '600',
  },
});

