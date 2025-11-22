import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { reverseGeocode } from '../utils/locationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RED_COLOR = '#D13635';
const LOCATION_STORAGE_KEY = '@selected_location';

const LocationPickerScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setDetecting(true);

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings.',
          [
            { text: 'Open Settings', onPress: openDeviceSettings },
            { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
          ]
        );
        return;
      }

      // Check permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Please enable location permission to auto-detect your address.',
            [
              { text: 'Open Settings', onPress: openDeviceSettings },
              { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
            ]
          );
          return;
        }
      }

      // Get current location with balanced accuracy (faster)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Faster than High, still accurate
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);

      // Reverse geocode to get address
      const addressData = await reverseGeocode(coords);
      
      if (addressData) {
        setAddress({
          street: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          zipCode: addressData.zipCode?.substring(0, 6) || '',
        });
      }
    } catch (error: any) {
      console.error('Location error:', error);
      let errorMessage = 'Failed to detect location. Please try again.';
      
      if (error.message?.includes('permission')) {
        errorMessage = 'Location permission is required. Please enable it in settings.';
      } else if (error.message?.includes('disabled')) {
        errorMessage = 'Location services are disabled. Please enable them in settings.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      Alert.alert(
        'Location Error',
        errorMessage,
        [
          { text: 'Open Settings', onPress: openDeviceSettings },
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
        ]
      );
    } finally {
      setLoading(false);
      setDetecting(false);
    }
  };

  const handleUseLocation = async () => {
    if (address) {
      // Store address in AsyncStorage
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(address));
      // Navigate back
      router.back();
    }
  };

  const handleRetry = () => {
    getCurrentLocation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {loading || detecting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={RED_COLOR} />
            <Text style={styles.loadingText}>Detecting your location...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        ) : address ? (
          <View style={styles.addressContainer}>
            <Text style={styles.successTitle}>📍 Location Detected</Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Street Address:</Text>
              <Text style={styles.addressValue}>{address.street}</Text>
              
              <Text style={styles.addressLabel}>City:</Text>
              <Text style={styles.addressValue}>{address.city}</Text>
              
              <Text style={styles.addressLabel}>State:</Text>
              <Text style={styles.addressValue}>{address.state}</Text>
              
              <Text style={styles.addressLabel}>PIN Code:</Text>
              <Text style={styles.addressValue}>{address.zipCode}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.useButton}
                onPress={handleUseLocation}
              >
                <Text style={styles.useButtonText}>Use This Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Retry Detection</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to detect location</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LocationPickerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: RED_COLOR,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  addressContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  addressBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  useButton: {
    backgroundColor: RED_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: RED_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: RED_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

