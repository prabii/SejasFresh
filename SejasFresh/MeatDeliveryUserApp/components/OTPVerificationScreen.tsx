import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { addressService } from '../services/addressService';

// Import the logo - adjust path as needed
const sejaLogo = require('../assets/images/sejas-logo.png');

const RED_COLOR = '#D13635';
const GREY_COLOR = '#888888';

const OTPVerificationScreen: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  
  // Get phone number and signup data from navigation params
  const phoneNumber = params.phone as string || '+911234567890';
  const isSignup = params.isSignup === 'true';
  const signupData = isSignup ? {
    name: params.name as string,
    email: params.email as string,
    street: params.street as string,
    city: params.city as string,
    state: params.state as string,
    zipCode: params.zipCode as string,
  } : null;

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: string | undefined): { title: string; message: string } => {
    if (!error) {
      return { title: 'Error', message: 'Something went wrong. Please try again.' };
    }

    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('expired')) {
      return { title: 'OTP Expired', message: 'Your OTP has expired. Please request a new one.' };
    } else if (lowerError.includes('invalid') || lowerError.includes('incorrect')) {
      return { title: 'Invalid OTP', message: 'The OTP you entered is incorrect. Please check and try again.' };
    } else if (lowerError.includes('attempts') || lowerError.includes('too many')) {
      return { title: 'Too Many Attempts', message: 'Too many failed attempts. Please request a new OTP.' };
    } else if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return { title: 'Network Error', message: 'Please check your internet connection and try again.' };
    } else if (lowerError.includes('timeout')) {
      return { title: 'Request Timeout', message: 'The request timed out. Please try again.' };
    } else if (lowerError.includes('rate limit')) {
      return { title: 'Rate Limited', message: 'Too many requests. Please wait a moment before trying again.' };
    } else {
      return { title: 'Verification Failed', message: error };
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Clear error and success states when user starts typing
      if (hasError || successMessage) {
        setHasError(false);
        setErrorMessage('');
        setSuccessMessage('');
      }

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace to go to previous input
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      
      const response = await authService.requestOTP({ phone: phoneNumber });
      
      if (response.success) {
        // Show success message inline instead of alert
        setSuccessMessage('New verification code sent successfully!');
        setHasError(false);
        setErrorMessage('');
        
        // Clear current OTP
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      const { message } = getErrorMessage(error.message);
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('Current OTP:', otp);
    
    // Clear any previous error/success state
    setHasError(false);
    setErrorMessage('');
    setSuccessMessage('');
    
    const otpValue = otp.join('');
    console.log('OTP Value:', otpValue, 'Length:', otpValue.length);
    
    if (otpValue.length === 6) {
      console.log('OTP length is valid, proceeding with verification');
      try {
        setLoading(true);
        console.log('Loading state set to true');
        
        console.log('Calling authService.verifyOTP with:', { phone: phoneNumber, otp: otpValue });
        
        const response = await authService.verifyOTP({
          phone: phoneNumber,
          otp: otpValue
        });
        
        console.log('OTP verification response:', response);
        
        if (response.success) {
          console.log('OTP verification successful');
          
          // If signup, register user with address
          if (isSignup && signupData) {
            try {
              // Split name into first and last name
              const nameParts = signupData.name.trim().split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              
              // Register user
              const registerResponse = await authService.register({
                firstName,
                lastName,
                phone: phoneNumber,
                email: signupData.email || undefined,
                address: {
                  street: signupData.street,
                  city: signupData.city,
                  state: signupData.state,
                  zipCode: signupData.zipCode,
                  country: 'India'
                }
              });
              
              if (registerResponse.success && registerResponse.user && registerResponse.token) {
                // Save address as default
                try {
                  await addressService.addAddress({
                    label: 'Home',
                    street: signupData.street,
                    city: signupData.city,
                    state: signupData.state,
                    zipCode: signupData.zipCode,
                    isDefault: true,
                  });
                } catch (addrError) {
                  console.log('Address save error (non-critical):', addrError);
                }
                
                await login(registerResponse.user, registerResponse.token);
                router.replace('/(tabs)');
                return;
              }
            } catch (regError: any) {
              console.error('Registration error:', regError);
              Alert.alert('Registration Error', regError.message || 'Failed to complete registration');
              return;
            }
          }
          
          // Get user and token from response (for login)
          const user = response.user;
          const token = response.token;
          
          if (user && token) {
            console.log('User and token found, updating auth context');
            
            // Update auth context with user data  
            await login(user, token);
            
            // Navigate to main app
            router.replace('/(tabs)');
          } else {
            console.log('Missing user or token in response');
            Alert.alert('Error', 'Login data missing. Please try again.');
          }
        } else {
          // Handle unsuccessful response with specific error messages
          console.log('OTP verification failed:', response.message);
          
          const { title, message } = getErrorMessage(response.message);
          setHasError(true);
          setErrorMessage(message);
          
          // Also show alert for critical errors
          if (title === 'OTP Expired' || title === 'Too Many Attempts') {
            Alert.alert(
              title,
              message,
              [
                {
                  text: 'Try Again',
                  onPress: () => {
                    // Clear OTP and focus first input
                    setOtp(['', '', '', '', '', '']);
                    setHasError(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                    inputRefs.current[0]?.focus();
                  }
                },
                {
                  text: 'Resend OTP',
                  onPress: handleResend
                }
              ]
            );
          }
        }
      } catch (error: any) {
        console.error('OTP verification error:', error);
        
        const { title, message } = getErrorMessage(error.message);
        setHasError(true);
        setErrorMessage(message);
        
        // Show alert for network errors or critical issues
        if (title.includes('Network') || title.includes('Timeout')) {
          Alert.alert(
            title,
            message,
            [
              {
                text: 'Try Again',
                onPress: () => {
                  // Clear OTP and focus first input
                  setOtp(['', '', '', '', '', '']);
                  setHasError(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                  inputRefs.current[0]?.focus();
                }
              },
              {
                text: 'Resend OTP',
                onPress: handleResend
              }
            ]
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log('OTP incomplete - Length:', otpValue.length);
      Alert.alert('Incomplete OTP', `Please enter all 6 digits. Current: ${otpValue.length}/6`);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image source={sejaLogo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Instruction Text */}
      <View style={styles.instructionSection}>
        <Text style={styles.instructionText}>
          Verification code is sent to {phoneNumber.replace(/(\+\d{2})(\d+)(\d{4})/, '$1****$3')}
        </Text>
      </View>

      {/* OTP Input Boxes */}
      <View style={styles.otpSection}>
        <View style={styles.otpInputContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit !== '' && styles.otpInputFilled,
                hasError && styles.otpInputError
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {/* Message Display */}
        {hasError && errorMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        )}
        
        {successMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.successMessageText}>{successMessage}</Text>
          </View>
        )}

        {/* Resend Option */}
        <View style={styles.resendSection}>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            {resending ? (
              <View style={styles.resendContainer}>
                <ActivityIndicator size="small" color={RED_COLOR} />
                <Text style={[styles.resendText, { marginLeft: 8 }]}>Resending...</Text>
              </View>
            ) : (
              <Text style={styles.resendText}>Resend</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (isOtpComplete && !loading) && styles.submitButtonActive
          ]} 
          onPress={handleSubmit}
          disabled={!isOtpComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 40,
  },

  logoSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },

  logo: {
    width: 280,
    height: 140,
  },

  instructionSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },

  instructionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },

  otpSection: {
    alignItems: 'center',
    marginBottom: 50,
  },

  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    maxWidth: 320,
    alignSelf: 'center',
  },

  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 4,
    backgroundColor: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  otpInputFilled: {
    backgroundColor: RED_COLOR,
    borderColor: RED_COLOR,
    color: 'white',
  },

  otpInputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFE5E5',
  },

  errorMessageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },

  messageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },

  errorMessageText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

  successMessageText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

  resendSection: {
    alignSelf: 'flex-end',
    paddingRight: 20,
  },

  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resendText: {
    fontSize: 16,
    color: RED_COLOR,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  submitSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 40,
  },

  submitButton: {
    backgroundColor: GREY_COLOR,
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 30,
    width: '85%',
    alignItems: 'center',
  },

  submitButtonActive: {
    backgroundColor: RED_COLOR,
  },

  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OTPVerificationScreen;