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
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const RED_COLOR = '#D13635';

const SetPinScreen: React.FC = () => {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle set PIN
  const handleSetPin = async () => {
    if (!pin.trim() || !confirmPin.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      Alert.alert('Error', 'PIN must be 4-6 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PIN and confirm PIN do not match');
      return;
    }

    // Check if PIN contains only numbers
    if (!/^\d+$/.test(pin)) {
      Alert.alert('Error', 'PIN can only contain numbers');
      return;
    }

    try {
      setLoading(true);

      const setPinData = {
        pin,
        confirmPin
      };

      const response = await authService.setPin(setPinData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Your PIN has been set successfully! You can now use PIN to login.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to set PIN');
      }
    } catch (error: any) {
      console.error('Set PIN error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to set PIN. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Skip PIN setup (go to main app)
  const handleSkip = () => {
    Alert.alert(
      'Skip PIN Setup',
      'You can set up your PIN later in the settings. Continue to the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const isFormValid = pin.length >= 4 && confirmPin.length >= 4 && pin === confirmPin && /^\d+$/.test(pin);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Logo Section */}
      <Image
        source={require('../assets/images/sejas-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Set Up Your PIN</Text>
      <Text style={styles.subtitle}>
        Create a secure PIN for quick and easy login
      </Text>

      {/* User Info */}
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {user.firstName}!</Text>
          <Text style={styles.infoText}>Set up your PIN to secure your account</Text>
        </View>
      )}

      {/* PIN Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PIN (4-6 digits)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your PIN"
          placeholderTextColor="#888"
          value={pin}
          onChangeText={setPin}
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
          placeholder="Confirm your PIN"
          placeholderTextColor="#888"
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
        />
        {pin.length > 0 && confirmPin.length > 0 && pin !== confirmPin && (
          <Text style={styles.errorText}>PINs do not match</Text>
        )}
      </View>

      {/* PIN Guidelines */}
      <View style={styles.guidelinesContainer}>
        <Text style={styles.guidelinesTitle}>PIN Guidelines:</Text>
        <Text style={styles.guideline}>• Use 4-6 digits only</Text>
        <Text style={styles.guideline}>• Avoid simple patterns (1234, 1111)</Text>
        <Text style={styles.guideline}>• Keep your PIN secure and private</Text>
      </View>

      {/* Set PIN Button */}
      <TouchableOpacity
        style={[styles.setPinButton, !isFormValid && styles.disabledButton]}
        onPress={handleSetPin}
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.setPinText}>Set PIN</Text>
        )}
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  guidelinesContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  guideline: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  setPinButton: {
    backgroundColor: RED_COLOR,
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  setPinText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  skipButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SetPinScreen;