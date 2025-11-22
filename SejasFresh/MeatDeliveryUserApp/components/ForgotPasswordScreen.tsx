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
import { authService } from '../services/authService';

const RED_COLOR = '#D13635';

const ForgotPasswordScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request'); // Track current step
  const [otpSent, setOtpSent] = useState(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone format (10 digits)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Determine if input is email or phone
  const getInputType = (): 'email' | 'phone' | 'invalid' => {
    if (isValidEmail(emailOrPhone)) return 'email';
    if (isValidPhone(emailOrPhone)) return 'phone';
    return 'invalid';
  };

  // Handle forgot PIN - Request OTP
  const handleRequestOTP = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }

    const inputType = getInputType();
    if (inputType === 'invalid') {
      Alert.alert('Error', 'Please enter a valid email address or 10-digit phone number');
      return;
    }

    try {
      setLoading(true);

      const identifier = inputType === 'phone' ? `+91${emailOrPhone}` : emailOrPhone;
      const response = await authService.forgotPin({ identifier });

      if (response.success) {
        setOtpSent(true);
        setStep('verify');
        Alert.alert(
          'OTP Sent',
          'Please check your phone for the verification code.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Forgot PIN error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle PIN reset with OTP
  const handleResetPin = async () => {
    if (!otp.trim() || !newPin.trim() || !confirmPin.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }

    if (newPin.length < 4 || newPin.length > 6) {
      Alert.alert('Error', 'PIN must be 4-6 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PIN and confirm PIN do not match');
      return;
    }

    try {
      setLoading(true);

      const inputType = getInputType();
      const identifier = inputType === 'phone' ? `+91${emailOrPhone}` : emailOrPhone;

      const resetData = {
        identifier,
        otp,
        newPin,
        confirmPin
      };

      const response = await authService.resetPin(resetData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Your PIN has been reset successfully. You can now login with your new PIN.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/auth/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to reset PIN');
      }
    } catch (error: any) {
      console.error('Reset PIN error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to reset PIN. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigate back to login
  const navigateToLogin = () => {
    router.replace('/auth/login');
  };

  const isRequestFormValid = emailOrPhone.trim().length > 0 && getInputType() !== 'invalid';
  const isResetFormValid = otp.length === 6 && newPin.length >= 4 && confirmPin.length >= 4 && newPin === confirmPin;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Logo Section */}
      <Image
        source={require('../assets/images/sejas-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>
        {step === 'request' ? 'Forgot PIN?' : 'Reset PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'request' 
          ? 'Enter your email or phone number to receive OTP'
          : 'Enter the OTP and set your new PIN'
        }
      </Text>

      {step === 'request' ? (
        <>
          {/* Email or Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email or phone number"
              placeholderTextColor="#888"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpSent}
            />
            {emailOrPhone.length > 0 && getInputType() === 'invalid' && (
              <Text style={styles.errorText}>Please enter a valid email or 10-digit phone number</Text>
            )}
          </View>

          {/* Request OTP Button */}
          <TouchableOpacity
            style={[styles.primaryButton, !isRequestFormValid && styles.disabledButton]}
            onPress={handleRequestOTP}
            disabled={!isRequestFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* OTP Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#888"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* New PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new PIN (4-6 digits)"
              placeholderTextColor="#888"
              value={newPin}
              onChangeText={setNewPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Confirm PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your new PIN"
              placeholderTextColor="#888"
              value={confirmPin}
              onChangeText={setConfirmPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
            {newPin.length > 0 && confirmPin.length > 0 && newPin !== confirmPin && (
              <Text style={styles.errorText}>PINs do not match</Text>
            )}
          </View>

          {/* Reset PIN Button */}
          <TouchableOpacity
            style={[styles.primaryButton, !isResetFormValid && styles.disabledButton]}
            onPress={handleResetPin}
            disabled={!isResetFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Reset PIN</Text>
            )}
          </TouchableOpacity>

          {/* Request New OTP */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setStep('request');
              setOtp('');
              setNewPin('');
              setConfirmPin('');
              setOtpSent(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>Request New OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Back to Login */}
      <View style={styles.backToLoginContainer}>
        <Text style={styles.backToLoginText}>Remember your PIN? </Text>
        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={styles.backToLoginLink}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 100,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 30,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
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
    backgroundColor: '#fff',
  },
  errorText: {
    color: RED_COLOR,
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: RED_COLOR,
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: RED_COLOR,
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: RED_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#555',
  },
  backToLoginLink: {
    color: RED_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;