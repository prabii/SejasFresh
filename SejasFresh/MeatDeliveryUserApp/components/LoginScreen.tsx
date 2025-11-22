import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { authService, getAuthSession } from '../services/authService';

const RED_COLOR = '#D13635';


const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // On mount, check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
  const sessionData = await getAuthSession();
        if (sessionData && sessionData.token) {
          // If session is valid, go to home
          router.replace('/(tabs)');
        }
      } catch {
        // Ignore and show login
      }
    };
    checkSession();
  }, []);

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

  // Handle login
  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const inputType = getInputType();
    if (inputType === 'invalid') {
      Alert.alert('Error', 'Please enter a valid email address or 10-digit phone number');
      return;
    }

    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    try {
      setLoading(true);

      // Use PIN-based login with identifier (email or phone)
      const loginPinData = {
        identifier: inputType === 'phone' ? `+91${emailOrPhone}` : emailOrPhone,
        pin: pin
      };

      const response = await authService.loginWithPin(loginPinData);

      if (response.success) {
        const user = response.user;
        const token = response.token;

        if (user && token) {
          // Update auth context
          await login(user, token);
          
          // Navigate to main app
          router.replace('/(tabs)');
        } else {
          Alert.alert('Error', 'Invalid response from server');
        }
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed', 
        error.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigate to registration
  const navigateToRegister = () => {
    router.push('/auth/register');
  };


  // Navigate to forgot password
  const navigateToForgotPassword = () => {
    router.push('/auth/forgot-password' as any);
  };

  const isFormValid = emailOrPhone.trim().length > 0 && pin.length === 6 && getInputType() !== 'invalid';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Logo Section */}
      <Image
        source={require('../assets/images/sejas-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

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
        />
        {emailOrPhone.length > 0 && getInputType() === 'invalid' && (
          <Text style={styles.errorText}>Please enter a valid email or 10-digit phone number</Text>
        )}
      </View>

      {/* PIN Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PIN</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter your PIN"
            placeholderTextColor="#888"
            value={pin}
            onChangeText={setPin}
            secureTextEntry={!showPin}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity
            onPress={() => setShowPin((prev) => !prev)}
            style={{ marginLeft: 8, padding: 4 }}
            accessibilityLabel={showPin ? 'Hide PIN' : 'Show PIN'}
          >
            <Text style={{ fontSize: 18 }}>
              {showPin ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, !isFormValid && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Alternative Login Options */}
      <View style={styles.alternativeContainer}>
        <TouchableOpacity onPress={navigateToForgotPassword} style={styles.forgotPinButton}>
          <Text style={styles.linkText}>Forgot PIN?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.signUpLink}>Sign Up</Text>
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
  loginButton: {
    backgroundColor: RED_COLOR,
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  alternativeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  linkText: {
    color: RED_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPinButton: {
    marginTop: 5,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: '#555',
  },
  signUpLink: {
    color: RED_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LoginScreen;