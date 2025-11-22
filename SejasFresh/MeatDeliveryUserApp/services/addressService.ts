import { authService } from './authService';
import { getCurrentConfig } from '../config/api';

// Set to false to use backend API
const USE_MOCK_DATA = false;

const API_BASE_URL = getCurrentConfig().API_URL;

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await authService.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || `API call failed: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('API call error:', error);
    throw error;
  }
};

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AddAddressRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AddressResponse {
  success: boolean;
  message?: string;
  addresses?: Address[];
  address?: Address;
  count?: number;
  errors?: any[];
}

class AddressService {

  // Get all saved addresses
  async getSavedAddresses(): Promise<Address[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    
    try {
      const token = await authService.getToken();
      if (!token) {
        return []; // Return empty if not authenticated
      }
      
      const response = await apiCall('/addresses');
      if (response.success && response.addresses) {
        return response.addresses;
      }
      return [];
    } catch (error: any) {
      // If not authorized, return empty array silently
      if (error.message?.includes('authorized') || error.message?.includes('authentication')) {
        return [];
      }
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  // Add new address
  async addAddress(addressData: AddAddressRequest): Promise<Address> {
    if (USE_MOCK_DATA) {
      throw new Error('Mock data disabled');
    }
    
    try {
      const response = await apiCall('/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
      
      if (response.success && response.address) {
        return response.address;
      }
      throw new Error(response.message || 'Failed to add address');
    } catch (error: any) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  // Update existing address
  async updateAddress(addressId: string, addressData: AddAddressRequest): Promise<Address> {
    if (USE_MOCK_DATA) {
      throw new Error('Mock data disabled');
    }
    
    try {
      const response = await apiCall(`/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
      
      if (response.success && response.address) {
        return response.address;
      }
      throw new Error(response.message || 'Failed to update address');
    } catch (error: any) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<Address[]> {
    if (USE_MOCK_DATA) {
      throw new Error('Mock data disabled');
    }
    
    try {
      const response = await apiCall(`/addresses/${addressId}`, {
        method: 'DELETE',
      });
      
      if (response.success && response.addresses) {
        return response.addresses;
      }
      throw new Error(response.message || 'Failed to delete address');
    } catch (error: any) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Set default address
  async setDefaultAddress(addressId: string): Promise<Address[]> {
    if (USE_MOCK_DATA) {
      throw new Error('Mock data disabled');
    }
    
    try {
      const response = await apiCall(`/addresses/${addressId}/default`, {
        method: 'PATCH',
      });
      
      if (response.success && response.addresses) {
        return response.addresses;
      }
      throw new Error(response.message || 'Failed to set default address');
    } catch (error: any) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  // Get default address
  async getDefaultAddress(): Promise<Address | null> {
    if (USE_MOCK_DATA) {
      return null;
    }
    
    try {
      const token = await authService.getToken();
      if (!token) {
        return null; // Return null if not authenticated
      }
      
      const response = await apiCall('/addresses/default');
      if (response.success && response.address) {
        return response.address;
      }
      return null;
    } catch (error: any) {
      // If not authorized or no default address, return null silently
      if (error.message?.includes('authorized') || error.message?.includes('authentication')) {
        return null;
      }
      console.error('Error fetching default address:', error);
      return null;
    }
  }
}

export const addressService = new AddressService();