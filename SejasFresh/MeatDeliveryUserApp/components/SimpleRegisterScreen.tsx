import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { getAddressFromCurrentLocation } from '../utils/locationService';
import { addressService } from '../services/addressService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RED_COLOR = '#D13635';

const SimpleRegisterScreen: React.FC = () => {
  const { login } = useAuth();
  const params = useLocalSearchParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [requestingOTP, setRequestingOTP] = useState(false);
  
  // Address fields (auto-filled from location)
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Check for location data from picker screen
  useEffect(() => {
    if (params.selectedStreet) {
      setStreet(params.selectedStreet as string);
    }
    if (params.selectedCity) {
      setCity(params.selectedCity as string);
    }
    if (params.selectedState) {
      setState(params.selectedState as string);
    }
    if (params.selectedZipCode) {
      setZipCode(params.selectedZipCode as string);
    }
  }, [params]);

  // Auto-detect location on mount (with delay to let screen render)
  useEffect(() => {
    // Delay auto-detection slightly to ensure screen is ready
    const timer = setTimeout(() => {
      requestLocationPermissionAndDetect();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Request location permission and auto-detect
  const requestLocationPermissionAndDetect = async () => {
    try {
      setLocationLoading(true);
      
      // Add a small delay to let the screen render first
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📍 Starting auto-location detection...');
      
      const address = await getAddressFromCurrentLocation();
      
      console.log('📍 Location detected:', address);
      
      if (address.street) setStreet(address.street);
      if (address.city) setCity(address.city);
      if (address.state) setState(address.state);
      if (address.zipCode) {
        const pinCode = address.zipCode.substring(0, 6);
        setZipCode(pinCode);
      }
      
      console.log('✅ Location auto-detected successfully');
    } catch (error: any) {
      // Silently fail on auto-detect - user can manually detect later
      console.log('⚠️ Auto-location detection failed:', error.message);
      // Don't show alert on auto-detect failure - let user manually trigger if needed
      // The manual button will show proper error messages
    } finally {
      setLocationLoading(false);
    }
  };

  // Open device settings
  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Open location picker screen
  const handleAutoDetectLocation = () => {
    router.push({
      pathname: '/auth/location-picker',
      params: {
        returnTo: 'register',
      }
    });
  };

  // Check for location data from picker screen (stored in AsyncStorage)
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const locationData = await AsyncStorage.getItem('@selected_location');
        if (locationData) {
          const address = JSON.parse(locationData);
          setStreet(address.street || '');
          setCity(address.city || '');
          setState(address.state || '');
          setZipCode(address.zipCode || '');
          // Clear the stored location after using it
          await AsyncStorage.removeItem('@selected_location');
        }
      } catch (error) {
        console.error('Error loading location data:', error);
      }
    };

    // Check on mount and when screen is focused
    loadLocationData();
    
    // Set up interval to check for location data (when returning from picker)
    const interval = setInterval(loadLocationData, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Handle phone number input
  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  // Handle ZIP code input
  const handleZipCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setZipCode(numericText);
    }
  };

  // Validate form
  const isFormValid = 
    name.trim().length >= 2 &&
    phone.length === 10 &&
    /^[6-9]\d{9}$/.test(phone) &&
    (email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) &&
    street.length >= 5 &&
    city.length >= 2 &&
    state.length >= 2 &&
    zipCode.length === 6;

  // Direct signup without OTP
  const handleSignup = async () => {
    if (!isFormValid) {
      Alert.alert('Incomplete Form', 'Please fill all required fields correctly');
      return;
    }

    try {
      setRequestingOTP(true);
      const formattedPhone = `+91${phone}`;
      
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('Registering user with phone:', formattedPhone);
      
      // Direct registration without OTP
      const registerData: any = {
        firstName,
        lastName,
        phone: formattedPhone,
        address: {
          street,
          city,
          state,
          zipCode,
          country: 'India'
        }
      };
      
      // Add email only if provided
      if (email.trim().length > 0) {
        registerData.email = email.trim();
      }
      
      const response = await authService.register(registerData);
      
      if (response.success && response.token && response.user) {
        // Auto-login the user after successful registration
        await login(response.user, response.token);
        
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', response.message || 'Failed to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setRequestingOTP(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/sejas-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Enter your details to get started</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number *</Text>
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
            />
          </View>
          {phone.length > 0 && phone.length < 10 && (
            <Text style={styles.helperText}>Enter 10-digit phone number</Text>
          )}
        </View>

        {/* Email Input (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text style={styles.sectionTitle}>Delivery Address *</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleAutoDetectLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator color={RED_COLOR} size="small" />
              ) : (
                <>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>Auto-detect</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Street Address */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor="#999"
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
            />
          </View>

          {/* City and State Row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#999"
                value={state}
                onChangeText={setState}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* PIN Code */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="PIN Code (6 digits)"
              placeholderTextColor="#999"
              value={zipCode}
              onChangeText={handleZipCodeChange}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.otpButton, !isFormValid && styles.otpButtonDisabled]}
          onPress={handleSignup}
          disabled={!isFormValid || requestingOTP}
        >
          {requestingOTP ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.otpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SimpleRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 90,
  },
  headerContainer: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
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
    paddingVertical: 14,
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
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  addressSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RED_COLOR,
    backgroundColor: '#fff',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    color: RED_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: RED_COLOR,
    fontWeight: '600',
  },
});

