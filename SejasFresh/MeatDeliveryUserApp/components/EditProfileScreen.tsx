import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

// Color constants
const PRIMARY_RED = '#D13635';
const RED_LIGHT = '#FFEBEE';
const LIGHT_GRAY = '#F8F9FA';
const MEDIUM_GRAY = '#E9ECEF';
const DARK_GRAY = '#212529';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6C757D';
const LIGHT_PINK = '#FFF1F1';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FormErrors {
  firstName?: string;
  phone?: string;
}

const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize form data with current user data
  const [formData, setFormData] = useState<FormData>(() => {
    // Extract address fields from user object
    let addressData = { street: '', city: '', state: '', zipCode: '' };
    
    if (user?.address) {
      if (typeof user.address === 'string') {
        // If address is a string, put it in street field
        addressData.street = user.address;
      } else {
        // If address is an object, extract individual fields
        addressData = {
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.zipCode || '',
        };
      }
    }
    
    // Strip '+91' or '91' from phone number for display
    let phone = user?.phone || '';
    phone = phone.replace(/^\+91/, '');
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone,
      ...addressData,
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleBack = () => {
    router.back();
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Check if any changes were made (exclude phone since it's read-only)
      const currentPhone = user?.phone?.replace(/^\+91/, '') || '';
      const hasChanges = 
        formData.firstName !== user?.firstName ||
        formData.lastName !== user?.lastName ||
        formData.street !== (typeof user?.address === 'object' ? user?.address?.street : user?.address || '') ||
        formData.city !== (typeof user?.address === 'object' ? user?.address?.city : '') ||
        formData.state !== (typeof user?.address === 'object' ? user?.address?.state : '') ||
        formData.zipCode !== (typeof user?.address === 'object' ? user?.address?.zipCode : '');

      if (!hasChanges) {
        Alert.alert('No Changes', 'No changes were made to your profile.');
        return;
      }

      // Prepare data for API call
      // Don't send phone number since it's read-only and can't be changed
      const profileData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
        },
      };

      // Update user profile using AuthContext
      await updateUserProfile(profileData);

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to update your profile. Please try again.';
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
          errorMessage = 'This information is already in use by another account. Please use different details.';
        } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
          errorMessage = 'Please check your information and try again.';
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={PRIMARY_RED} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profileInitials}>
            <Text style={styles.initialsText}>
              {formData.firstName.charAt(0).toUpperCase()}{formData.lastName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profilePictureText}>Profile Picture</Text>
          <Text style={styles.profilePictureSubtext}>
            Your initials will be displayed based on your name
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={[styles.textInput, errors.firstName && styles.inputError]}
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              editable={!loading}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput]}
              value={formData.email}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
            />
            <Text style={styles.readOnlyText}>Email cannot be changed</Text>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput]}
              value={formData.phone}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              editable={false}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>
        </View>

        {/* Address Section */}
        {/* Address Section removed as requested */}

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Note</Text>
          <Text style={styles.infoText}>
            • Fields marked with * are required{'\n'}
            • Changes will be reflected across the app{'\n'}
            • Your profile picture will show your initials{'\n'}
            • Email address cannot be modified
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header Styles
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: RED_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: PRIMARY_RED,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },

  // Profile Picture Section
  profilePictureSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 32,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  profileInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: PRIMARY_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  initialsText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },

  profilePictureText: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  profilePictureSubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Form Section
  formSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  inputGroup: {
    marginBottom: 20,
  },

  rowInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  halfInputGroup: {
    flex: 1,
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
    backgroundColor: 'white',
    fontWeight: '500',
  },

  readOnlyInput: {
    backgroundColor: LIGHT_GRAY,
    color: TEXT_SECONDARY,
    borderColor: MEDIUM_GRAY,
  },

  readOnlyText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },

  inputError: {
    borderColor: PRIMARY_RED,
    borderWidth: 2,
  },

  errorText: {
    fontSize: 14,
    color: PRIMARY_RED,
    marginTop: 4,
  },

  // Info Section
  infoSection: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 20,
  },
});

export default EditProfileScreen;