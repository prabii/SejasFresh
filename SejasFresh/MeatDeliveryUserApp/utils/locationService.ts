import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface AddressFromLocation {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

/**
 * Request location permissions
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Check if location permission is granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Get current location coordinates
 */
export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  try {
    // Check if location services are enabled first
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      throw new Error('Location services are disabled');
    }

    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    // Get current position with low accuracy for speed (faster than Balanced)
    // Low accuracy is still accurate enough for city/state/zipcode
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low, // Fastest option, still accurate for address
      maximumAge: 300000, // Accept cached location up to 5 minutes old (much faster)
      timeout: 10000, // Timeout after 10 seconds instead of default 20
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error: any) {
    console.error('Error getting current location:', error);
    // Re-throw with more specific error message
    if (error.message.includes('permission')) {
      throw new Error('Location permission denied');
    } else if (error.message.includes('disabled')) {
      throw new Error('Location services are disabled');
    } else if (error.message.includes('timeout')) {
      throw new Error('Location request timeout');
    }
    throw error;
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(
  coordinates: LocationCoordinates
): Promise<AddressFromLocation | null> {
  try {
    // Use reverse geocoding with timeout for faster failure
    const addresses = await Promise.race([
      Location.reverseGeocodeAsync(coordinates),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Reverse geocoding timeout')), 8000)
      )
    ]) as any[];

    if (!addresses || addresses.length === 0) {
      throw new Error('No address found for this location');
    }

    const address = addresses[0];

    // Extract address components
    const street = [
      address.streetNumber,
      address.street,
    ]
      .filter(Boolean)
      .join(' ') || '';

    const city = address.city || address.subAdministrativeArea || address.administrativeArea || '';
    const state = address.region || address.administrativeArea || '';
    const zipCode = address.postalCode || '';
    const country = address.country || 'India';

    return {
      street: street || 'Address not available',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      country,
    };
  } catch (error: any) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
}

/**
 * Get address from current location (combines getCurrentLocation and reverseGeocode)
 */
export async function getAddressFromCurrentLocation(): Promise<AddressFromLocation> {
  try {
    // Get current location
    const coordinates = await getCurrentLocation();
    if (!coordinates) {
      throw new Error('Could not get location coordinates');
    }

    // Reverse geocode to get address
    const address = await reverseGeocode(coordinates);
    if (!address) {
      throw new Error('Could not get address from location');
    }

    return address;
  } catch (error: any) {
    console.error('Error getting address from location:', error);
    throw error;
  }
}

