import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color constants
const PRIMARY_RED = '#D32F2F';
const LIGHT_GRAY = '#CCC';
const DARK_GRAY = '#333';
const PLACEHOLDER_GRAY = '#AAA';
const DISABLED_GRAY = '#D3D3D3';
const EDIT_ICON_BG = '#FFF5F5';

const PersonalInfoScreen: React.FC = () => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  });

  // Update form field
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if form is valid (required fields filled)
  const isFormValid = () => {
    return formData.firstName.trim() !== '' && 
           formData.lastName.trim() !== '' && 
           formData.dateOfBirth.trim() !== '' && 
           formData.phone.trim() !== '';
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle profile picture edit
  const handleProfileEdit = () => {
    Alert.alert('Edit Profile Picture', 'Profile picture edit functionality');
  };

  // Handle date picker (placeholder)
  const handleDatePress = () => {
    Alert.alert('Date Picker', 'Date picker functionality would open here');
  };

  // Handle save
  const handleSave = () => {
    if (isFormValid()) {
      Alert.alert('Success', 'Personal information saved successfully!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={20} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle}>Personal Info</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={require('../assets/images/sejas-logo.png')} 
              style={styles.profileImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.editIconContainer} onPress={handleProfileEdit}>
              <Feather name="edit-2" size={16} color={PRIMARY_RED} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Fields Section */}
        <View style={styles.formSection}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of birth*</Text>
            <TouchableOpacity onPress={handleDatePress}>
              <TextInput
                style={styles.input}
                placeholder="00/00/0001"
                placeholderTextColor={PLACEHOLDER_GRAY}
                value={formData.dateOfBirth}
                onChangeText={(value) => updateField('dateOfBirth', value)}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Email"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone*</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9347868290"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              isFormValid() ? styles.saveButtonActive : styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!isFormValid()}
          >
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // App Bar Styles
  appBar: {
    backgroundColor: PRIMARY_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    zIndex: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  // Profile Section Styles
  profileSection: {
    alignItems: 'center',
    marginTop: 10, // Overlap with header
    marginBottom: 40,
    zIndex: 10,
    position: 'relative',
  },

  profileImageContainer: {
    position: 'relative',
    zIndex: 10,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },

  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: EDIT_ICON_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 12,
    zIndex: 15,
  },

  // Form Section Styles
  formSection: {
    paddingHorizontal: 20,
  },

  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    color: DARK_GRAY,
    marginBottom: 6,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: DARK_GRAY,
    backgroundColor: 'white',
  },

  // Button Section Styles
  buttonSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  saveButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: DISABLED_GRAY,
  },

  saveButtonActive: {
    backgroundColor: PRIMARY_RED,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
});

export default PersonalInfoScreen;