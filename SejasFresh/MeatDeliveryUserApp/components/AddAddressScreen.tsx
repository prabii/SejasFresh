import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddAddressRequest, addressService } from '../services/addressService';
import { validateAddressPincode } from '../utils/deliveryService';
import { getAddressFromCurrentLocation } from '../utils/locationService';

const RED_COLOR = '#D13635';
const LIGHT_GRAY = '#f5f5f5';
const DARK_GRAY = '#666';

interface AddAddressScreenProps {
  onAddressAdded?: () => void;
}

const AddAddressScreen: React.FC<AddAddressScreenProps> = ({ onAddressAdded }) => {
  const [formData, setFormData] = useState<AddAddressRequest>({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    isDefault: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Address label is required';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
    } else {
      // Check pincode serviceability
      const pincodeValidation = validateAddressPincode(formData.zipCode.trim());
      if (!pincodeValidation.isValid) {
        newErrors.zipCode = pincodeValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AddAddressRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      // Check if the error is related to pincode serviceability
      const pincodeValidation = validateAddressPincode(formData.zipCode.trim());
      if (formData.zipCode.trim() && !/^\d{6}$/.test(formData.zipCode.trim()) === false && !pincodeValidation.isValid) {
        Alert.alert('Service Area', pincodeValidation.message);
      }
      return;
    }

    try {
      setIsLoading(true);
      
      const addressData: AddAddressRequest = {
        ...formData,
        landmark: formData.landmark?.trim() || undefined,
      };

      await addressService.addAddress(addressData);
      
      // Show success message and navigate back
      Alert.alert('Success', 'Address added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
      // Call callback if provided
      if (onAddressAdded) {
        onAddressAdded();
      }
    } catch (error: any) {
      console.error('Error adding address:', error);
      Alert.alert('Error', error.message || 'Failed to add address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleAutoDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      
      // Show immediate feedback - start detecting
      // Use Promise.race to add a timeout fallback
      const locationPromise = getAddressFromCurrentLocation();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Location detection timeout')), 15000)
      );
      
      const addressData = await Promise.race([locationPromise, timeoutPromise]) as any;
      
      // Fill form fields with detected address
      setFormData(prev => ({
        ...prev,
        street: addressData.street || prev.street,
        city: addressData.city || prev.city,
        state: addressData.state || prev.state,
        zipCode: addressData.zipCode?.substring(0, 6) || prev.zipCode,
      }));
      
      // Clear any errors for these fields
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.street;
        delete newErrors.city;
        delete newErrors.state;
        delete newErrors.zipCode;
        return newErrors;
      });
      
    } catch (error: any) {
      console.error('Location detection error:', error);
      
      let errorMessage = 'Failed to detect location. Please try again.';
      let showSettingsButton = false;
      
      if (error.message?.includes('permission')) {
        errorMessage = 'Location permission is required. Please enable it in your device settings.';
        showSettingsButton = true;
      } else if (error.message?.includes('disabled')) {
        errorMessage = 'Location services are disabled. Please enable them in your device settings.';
        showSettingsButton = true;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Location detection timed out. Please try again or enter address manually.';
      }
      
      Alert.alert(
        'Location Detection',
        errorMessage,
        showSettingsButton ? [
          { text: 'Open Settings', onPress: openDeviceSettings },
          { text: 'Cancel', style: 'cancel' },
        ] : [{ text: 'OK' }]
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Address</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Auto Detect Location Button */}
          <TouchableOpacity 
            style={styles.autoDetectButton}
            onPress={handleAutoDetectLocation}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? (
              <>
                <ActivityIndicator size="small" color={RED_COLOR} style={{ marginRight: 8 }} />
                <Text style={styles.autoDetectText}>Detecting location...</Text>
              </>
            ) : (
              <>
                <Ionicons name="location" size={20} color={RED_COLOR} style={{ marginRight: 8 }} />
                <Text style={styles.autoDetectText}>Auto Detect Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Address Label */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Label *</Text>
            <TextInput
              style={[styles.input, errors.label && styles.inputError]}
              placeholder="e.g., Home, Work, Office"
              value={formData.label}
              onChangeText={(value) => handleInputChange('label', value)}
              maxLength={50}
            />
            {errors.label && <Text style={styles.errorText}>{errors.label}</Text>}
          </View>

          {/* Street Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, errors.street && styles.inputError]}
              placeholder="House/Flat number, Street name, Area"
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
          </View>

          {/* Landmark */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Landmark (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Near City Mall, Opposite Bank"
              value={formData.landmark}
              onChangeText={(value) => handleInputChange('landmark', value)}
              maxLength={100}
            />
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="Enter city"
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              maxLength={50}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          {/* State and ZIP Code Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                placeholder="Enter state"
                value={formData.state}
                onChangeText={(value) => handleInputChange('state', value)}
                maxLength={50}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={[styles.input, errors.zipCode && styles.inputError]}
                placeholder="6-digit code"
                value={formData.zipCode}
                onChangeText={(value) => handleInputChange('zipCode', value)}
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            </View>
          </View>

          {/* Set as Default */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('isDefault', !formData.isDefault)}
          >
            <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
              {formData.isDefault && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              * Required fields. This address will be saved to your account for future orders.
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]} 
            onPress={handleSaveAddress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  keyboardContainer: {
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },

  headerRight: {
    width: 34,
  },

  // Content Styles
  content: {
    flex: 1,
    padding: 20,
  },

  // Auto Detect Button
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GRAY,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: RED_COLOR,
    borderStyle: 'dashed',
  },

  autoDetectText: {
    fontSize: 16,
    fontWeight: '600',
    color: RED_COLOR,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'white',
  },

  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  inputError: {
    borderColor: RED_COLOR,
  },

  errorText: {
    fontSize: 14,
    color: RED_COLOR,
    marginTop: 5,
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  halfWidth: {
    flex: 0.48,
  },

  // Checkbox Styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: RED_COLOR,
    borderColor: RED_COLOR,
  },

  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },

  // Note Styles
  noteContainer: {
    backgroundColor: LIGHT_GRAY,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },

  noteText: {
    fontSize: 14,
    color: DARK_GRAY,
    lineHeight: 20,
  },

  // Bottom Section
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },

  saveButton: {
    backgroundColor: RED_COLOR,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },

  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddAddressScreen;