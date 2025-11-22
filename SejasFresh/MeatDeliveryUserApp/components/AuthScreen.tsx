import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';


const RED_COLOR = '#D13635';

const AuthScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Ensure only 10 digits max
  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, ''); // only numbers
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  // Request OTP from backend
  const handleGetOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      
      // Format phone number with country code
      const formattedPhone = `+91${phone}`;
      
      const response = await authService.requestOTP({ phone: formattedPhone });
      
      if (response.success) {
        // Navigate directly to OTP verification screen with phone number
        router.push({
          pathname: '/auth/otp',
          params: { phone: formattedPhone }
        });
      }
    } catch (error: any) {
      console.error('OTP request error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Section */}
      <Image
        source={require('../assets/images/sejas-logo.png')} // replace with your logo path
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Don’t have an account</Text>

      {/* Illustration */}
      <Image
        source={require('../assets/images/login-image.png')} // replace with your illustration
        style={styles.illustration}
        resizeMode="contain"
      />

{/* Register Button */}
<TouchableOpacity 
  style={styles.registerButton} 
  onPress={() => router.push('/auth/register')}
>
  <Text style={styles.registerText}>Register</Text>
</TouchableOpacity>


      {/* Divider with "or" */}
      <View style={styles.dividerWrapper}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* Login Section */}
      <Text style={styles.loginLabel}>Login using number</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Enter Number"
          value={phone}
          onChangeText={handlePhoneChange}
          maxLength={10} // extra safety
        />
      </View>

      {/* OTP Button */}
      <TouchableOpacity
        style={[
          styles.otpButton,
          (phone.length === 10 && !loading) ? styles.activeButton : styles.disabledButton,
        ]}
        disabled={phone.length !== 10 || loading}
        onPress={handleGetOTP}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.otpText}>Get OTP</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  illustration: {
    width: 120,
    height: 120,
    marginVertical: 25,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: RED_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 50,
    marginBottom: 25,
  },
  registerText: {
    color: RED_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#555',
    fontWeight: '600',
  },
  loginLabel: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 25,
    height: 50,
  },
  prefix: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  otpButton: {
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: RED_COLOR,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  otpText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
