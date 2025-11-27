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
const PRIMARY_RED = '#D32F2F';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LIGHT_PINK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },

  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PRIMARY_RED,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 30,
    marginBottom: 16,
  },

  profileInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  initialsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },

  profilePictureText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  profilePictureSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Form Section
  formSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: DARK_GRAY,
    backgroundColor: 'white',
  },

  readOnlyInput: {
    backgroundColor: '#F8F8F8',
    color: '#999',
  },

  readOnlyText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },

  inputError: {
    borderColor: PRIMARY_RED,
  },

  errorText: {
    fontSize: 14,
    color: PRIMARY_RED,
    marginTop: 4,
  },

  // Info Section
  infoSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 8,
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