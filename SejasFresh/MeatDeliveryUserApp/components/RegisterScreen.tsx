import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { validateAddressPincode } from '../utils/deliveryService';
import { getAddressFromCurrentLocation } from '../utils/locationService';

const RED_COLOR = '#D13635';

const RegisterScreen: React.FC = () => {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Check if pincode is serviceable
  const pincodeValidation = validateAddressPincode(zipCode);

  const isFormValid = 
    firstName.length >= 2 && firstName.length <= 50 && 
    lastName.length >= 2 && lastName.length <= 50 &&
    phone.length === 10 && 
    email.length > 0 &&
    pin.length === 6 &&
    pin === confirmPin &&
    /^\d+$/.test(pin) && // PIN should contain only numbers
    street.length >= 5 &&
    city.length >= 2 &&
    state.length >= 2 &&
    zipCode.length === 6 && // Backend expects 6-digit PIN code
    /^\d+$/.test(zipCode) && // ZIP code should be numeric
    pincodeValidation.isValid; // Pincode must be serviceable

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  const handleZipCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setZipCode(numericText);
    }
  };

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPin(numericText);
    }
  };

  const handleConfirmPinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setConfirmPin(numericText);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Indian phone number validation (10 digits, starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string) => {
    // Name should contain only letters and spaces, and be trimmed
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2;
  };

  // Open device settings
  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Handle auto-detect location
  const handleAutoDetectLocation = async () => {
    try {
      setLocationLoading(true);
      
      const address = await getAddressFromCurrentLocation();
      
      // Fill address fields
      if (address.street) {
        setStreet(address.street);
      }
      if (address.city) {
        setCity(address.city);
      }
      if (address.state) {
        setState(address.state);
      }
      if (address.zipCode) {
        // Ensure PIN code is 6 digits (take first 6 if longer)
        const pinCode = address.zipCode.substring(0, 6);
        if (pinCode.length === 6) {
          setZipCode(pinCode);
        } else if (address.zipCode.length > 0) {
          // If PIN code is shorter, still set it (user can edit)
          setZipCode(address.zipCode);
        }
      }
      
      Alert.alert(
        'Location Detected',
        'Your address has been auto-filled. Please review and make any necessary changes.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error detecting location:', error);
      
      let errorTitle = 'Location Services Disabled';
      let errorMessage = '';
      let showSettingsButton = false;
      
      if (error.message) {
        if (error.message.includes('permission')) {
          errorTitle = 'Location Permission Required';
          errorMessage = 'To auto-fill your address, please enable location permission:\n\n' +
            '1. Tap "Open Settings" below\n' +
            '2. Find "Sejas Fresh" app\n' +
            '3. Tap on "Location"\n' +
            '4. Select "Allow While Using App"\n' +
            '5. Return to the app and try again';
          showSettingsButton = true;
        } else if (error.message.includes('disabled')) {
          errorTitle = 'Location Services Disabled';
          errorMessage = 'Location services are disabled on your device. Please enable them:\n\n' +
            '1. Tap "Open Settings" below\n' +
            '2. Go to "Location" or "Privacy & Security" → "Location Services"\n' +
            '3. Turn ON "Location Services"\n' +
            '4. Return to the app and try again';
          showSettingsButton = true;
        } else if (error.message.includes('timeout')) {
          errorTitle = 'Location Request Timeout';
          errorMessage = 'Location request timed out. Please try again or enter your address manually.';
        } else {
          errorTitle = 'Location Error';
          errorMessage = error.message || 'Failed to detect your location. Please enter your address manually.';
        }
      } else {
        errorMessage = 'Failed to detect your location. Please enter your address manually.';
      }
      
      // Show alert with settings button if needed
      if (showSettingsButton) {
        Alert.alert(
          errorTitle,
          errorMessage,
          [
            {
              text: 'Open Settings',
              onPress: openDeviceSettings,
              style: 'default',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(errorTitle, errorMessage);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validateName(firstName)) {
      Alert.alert('Error', 'First name must contain only letters and be at least 2 characters');
      return;
    }

    if (!validateName(lastName)) {
      Alert.alert('Error', 'Last name must contain only letters and be at least 2 characters');
      return;
    }

    if (firstName.length < 2 || firstName.length > 50) {
      Alert.alert('Error', 'First name must be between 2 and 50 characters');
      return;
    }

    if (lastName.length < 2 || lastName.length > 50) {
      Alert.alert('Error', 'Last name must be between 2 and 50 characters');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Phone number must be 10 digits and start with 6, 7, 8, or 9');
      return;
    }

    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      Alert.alert('Error', 'PIN can only contain numbers');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    if (street.length < 5) {
      Alert.alert('Error', 'Street address must be at least 5 characters');
      return;
    }

    if (city.length < 2) {
      Alert.alert('Error', 'City must be at least 2 characters');
      return;
    }

    if (state.length < 2) {
      Alert.alert('Error', 'State must be at least 2 characters');
      return;
    }

    if (zipCode.length !== 6 || !/^\d+$/.test(zipCode)) {
      Alert.alert('Error', 'ZIP code must be exactly 6 digits');
      return;
    }

    // Check pincode serviceability
    if (!pincodeValidation.isValid) {
      Alert.alert('Service Area', pincodeValidation.message);
      return;
    }

    try {
      setLoading(true);
      
      const registerData = {
        firstName,
        lastName,
        email,
        pin, // Backend expects 'pin' field
        phone: `+91${phone}`,
        address: {
          street,
          city,
          state,
          zipCode,
          country: 'India' // Default country as per backend
        }
      };

      const response = await authService.register(registerData);
      
      if (response.success) {
        // Auto login the user after successful registration
        if (response.token && response.user) {
          await login(response.user, response.token);
        }
        
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully! You are now logged in.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to main app since user is now authenticated
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed', 
          response.message || 'Failed to create account. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      // Handle specific error messages from backend
      if (error.message) {
        if (error.message.includes('email')) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        } else if (error.message.includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different number or try logging in.';
        } else if (error.message.includes('PIN')) {
          errorMessage = 'Invalid PIN format. Please ensure PIN is exactly 6 digits.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Logo Section */}
      <Image
        source={require('../assets/images/sejas-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Create your account</Text>

      {/* First Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      {/* Last Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneWrapper}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.phoneInput}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={handlePhoneChange}
            maxLength={10}
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      {/* PIN */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PIN (6 digits)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your 6-digit PIN"
          placeholderTextColor="#888"
          value={pin}
          onChangeText={handlePinChange}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      {/* Confirm PIN */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your 6-digit PIN"
          placeholderTextColor="#888"
          value={confirmPin}
          onChangeText={handleConfirmPinChange}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
        />
        {pin.length > 0 && confirmPin.length > 0 && pin !== confirmPin && (
          <Text style={styles.errorText}>PINs do not match</Text>
        )}
        {pin.length > 0 && pin.length < 6 && (
          <Text style={styles.errorText}>PIN must be exactly 6 digits</Text>
        )}
      </View>

      {/* PIN Guidelines */}
      <View style={styles.pinGuidelines}>
        <Text style={styles.guidelinesText}>
          • PIN must be exactly 6 digits{'\n'}
          • Use only numbers{'\n'}
          • Avoid simple patterns (123456, 111111)
        </Text>
      </View>

      {/* Address Section Header */}
      <View style={styles.addressHeaderContainer}>
        <Text style={styles.sectionHeader}>Address Information</Text>
        <TouchableOpacity
          style={styles.autoDetectButton}
          onPress={handleAutoDetectLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color={RED_COLOR} size="small" />
          ) : (
            <>
              <Text style={styles.autoDetectIcon}>📍</Text>
              <Text style={styles.autoDetectText}>Auto-detect Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Street Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your street address"
          placeholderTextColor="#888"
          value={street}
          onChangeText={setStreet}
          autoCapitalize="words"
        />
      </View>

      {/* City */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your city"
          placeholderTextColor="#888"
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
        />
      </View>

      {/* State and Zip Code in a row */}
      <View style={styles.rowContainer}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#888"
            value={state}
            onChangeText={setState}
            autoCapitalize="words"
          />
        </View>
        
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>PIN Code (6 digits)</Text>
          <TextInput
            style={styles.input}
            placeholder="PIN Code"
            placeholderTextColor="#888"
            value={zipCode}
            onChangeText={handleZipCodeChange}
            keyboardType="numeric"
            maxLength={6}
          />
          {zipCode.length === 6 && !pincodeValidation.isValid && (
            <Text style={[styles.errorText, { fontSize: 11, marginTop: 2 }]}>
              {pincodeValidation.message}
            </Text>
          )}
        </View>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerButton, (!isFormValid || loading) && styles.disabledButton]}
        disabled={!isFormValid || loading}
        onPress={handleRegister}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.registerText}>Register</Text>
        )}
      </TouchableOpacity>

      {/* Sign In Redirect */}
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.signInText}>
          Already have an account? <Text style={styles.signInLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 25,
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 120,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 12,
    height: 50,
    fontSize: 16,
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 12,
    height: 50,
  },
  prefix: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: RED_COLOR,
    fontSize: 12,
    marginTop: 4,
  },
  pinGuidelines: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  guidelinesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  registerButton: {
    backgroundColor: RED_COLOR,
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  addressHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RED_COLOR,
    backgroundColor: '#fff',
  },
  autoDetectIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  autoDetectText: {
    color: RED_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
  signInText: {
    fontSize: 14,
    color: '#555',
  },
  signInLink: {
    color: RED_COLOR,
    fontWeight: '600',
  },
});
