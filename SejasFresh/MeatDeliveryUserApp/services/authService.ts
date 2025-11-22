
import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from '../data/mockData';

// Set to false when backend is ready
const USE_MOCK_DATA = false;

// Helper to get the full auth session (for login screen session check)
export const getAuthSession = async (): Promise<SessionData | null> => {
  try {
    const sessionData = await AsyncStorage.getItem('authSession');
    if (!sessionData) return null;
    const session: SessionData = JSON.parse(sessionData);
    const now = Date.now();
    if (now > session.expiresAt) {
      await removeAuthSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

// API_BASE_URL not needed for mock data

// Session constants
const SESSION_DURATION = 20 * 24 * 60 * 60 * 1000; // 20 days in milliseconds

// Interface for session data
interface SessionData {
  token: string;
  expiresAt: number;
  userId: string;
}

// In-memory cache for session to avoid repeated AsyncStorage reads
let cachedSession: SessionData | null = null;

const getAuthToken = async (): Promise<string | null> => {
  try {
    const now = Date.now();

    // If we have a cached session that's still valid, return it
    if (cachedSession && now <= cachedSession.expiresAt) {
      return cachedSession.token;
    }

    // Fallback to AsyncStorage if cache is empty or expired
    const sessionData = await AsyncStorage.getItem('authSession');
    if (!sessionData) {
      cachedSession = null;
      return null;
    }

    const session: SessionData = JSON.parse(sessionData);

    if (now > session.expiresAt) {
      // Session expired -> clear
      console.log('Session expired, clearing auth data');
      await removeAuthSession();
      cachedSession = null;
      return null;
    }

    // Update cache and return token
    cachedSession = session;
    return session.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to set auth token with expiration
const setAuthToken = async (token: string, userId: string): Promise<void> => {
  try {
    // Validate inputs
    if (!token || !userId) {
      console.error('setAuthToken called with invalid arguments:', { token: !!token, userId: !!userId });
      throw new Error('Token and userId are required');
    }
    
    const expiresAt = Date.now() + SESSION_DURATION;
    const sessionData: SessionData = {
      token,
      expiresAt,
      userId: String(userId) // Ensure userId is a string
    };
    
    await AsyncStorage.setItem('authSession', JSON.stringify(sessionData));
    // Update in-memory cache immediately
    cachedSession = sessionData;
    console.log(`Session set for user ${userId}, expires at ${new Date(expiresAt).toISOString()}`);
  } catch (error) {
    console.error('Error setting auth token:', error);
    throw error; // Re-throw to surface the error
  }
};

// Helper function to remove auth session
const removeAuthSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authSession');
    await AsyncStorage.removeItem('authToken'); // Remove legacy token if exists
    // Clear in-memory cache
    cachedSession = null;
  } catch (error) {
    console.error('Error removing auth session:', error);
  }
};

// Helper function to check if session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const now = Date.now();

    if (cachedSession) {
      return now <= cachedSession.expiresAt;
    }

    const sessionData = await AsyncStorage.getItem('authSession');
    if (!sessionData) return false;
    const session: SessionData = JSON.parse(sessionData);
    // Populate cache
    cachedSession = session;
    return now <= session.expiresAt;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Mock user data
const mockUser = {
  _id: 'user_1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'customer',
  isActive: true,
  phoneVerified: false,
  emailVerified: false,
  fullName: 'User',
  savedAddresses: []
};

// Get API URL from config
import Constants from 'expo-constants';

const getApiUrl = () => {
  const extra = Constants.expoConfig?.extra;
  
  // Use Render backend by default - only use local if explicitly enabled
  const useLocalBackend = extra?.useLocalBackend === 'true';
  
  if (__DEV__ && useLocalBackend) {
    // Development mode - use local server (only if explicitly enabled)
    // For mobile devices, use your computer's IP address instead of localhost
    // Example: http://192.168.1.100:5000/api
    // Or use the configured host from app.json
    const apiHost = extra?.apiHost || 'localhost';
    const apiPort = extra?.apiPort || '5000';
    
    // If using Expo Go on physical device, localhost won't work
    // Use your computer's local IP address (e.g., 192.168.1.100)
    // You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    return `http://${apiHost}:${apiPort}/api`;
  } else {
    // Production mode - use Render backend by default
    return extra?.productionApiUrl || 'https://meat-delivery-backend.onrender.com/api';
  }
};

const API_BASE_URL = getApiUrl();

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  if (USE_MOCK_DATA) {
    throw new Error('API calls disabled - using mock data');
  }

  try {
    const token = await getAuthToken();
    
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    };

    console.log('API Call:', url, options.method || 'GET');
    if (options.body) {
      console.log('Request Body:', options.body);
    }
    
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || `API error: ${response.status}`;
      console.error('API Error Response:', data);
      throw new Error(errorMessage);
    }

    // Return data as-is (backend returns { success, token, user } directly)
    return data;
  } catch (error: any) {
    console.error('API call error:', error);
    throw error;
  }
};

// Auth interfaces
export interface LoginData {
  email: string;
  password: string;
  phone?: string; // Optional phone field for phone-based login
}

export interface LoginPinData {
  identifier: string; // email or phone
  pin: string;
}

export interface SetPinData {
  pin: string;
  confirmPin: string;
}

export interface ForgotPinData {
  identifier: string; // email or phone
}

export interface ResetPinData {
  identifier: string;
  otp: string;
  newPin: string;
  confirmPin: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    landmark?: string;
  };
  role?: string;
}

export interface OTPRequestData {
  phone: string;
}

export interface OTPVerifyData {
  phone: string;
  otp: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    savedAddresses?: {
      label: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      landmark?: string;
      isDefault: boolean;
      _id: string;
    }[];
    role: string;
    isActive: boolean;
    otpIsVerified: boolean;
    otpAttempts: number;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    expiresIn: string;
  };
}

// Auth API functions
export const authService = {
  // Login with phone (no password required)
  login: async (loginData: { phone: string }): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      // Mock login - accept any email/password
      const mockToken = `mock_token_${Date.now()}`;
      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        token: mockToken,
        user: mockUser as any
      };
      await setAuthToken(mockToken, mockUser._id);
      return response;
    }
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    if (response.success && response.token) {
      // Handle different response structures
      const user = response.user || response.data?.user;
      const userId = user?._id || user?.id || response.data?.user?._id;
      
      if (userId) {
        await setAuthToken(response.token, String(userId));
      } else {
        console.error('No user ID in login response:', response);
      }
    }
    
    return response;
  },

  // Register new user
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      const mockToken = `mock_token_${Date.now()}`;
      const newUser = {
        ...mockUser,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        savedAddresses: registerData.address ? [{
          label: 'Home',
          street: registerData.address.street,
          city: registerData.address.city,
          state: registerData.address.state,
          zipCode: registerData.address.zipCode,
          country: registerData.address.country || 'India',
          landmark: registerData.address.landmark,
          isDefault: true
        }] : []
      };
      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        token: mockToken,
        user: newUser as any
      };
      await setAuthToken(mockToken, newUser._id);
      return response;
    }
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
    
    if (response.success && response.token) {
      // Backend returns { success, token, user: { _id, ... } }
      const user = response.user;
      
      if (!user) {
        console.error('No user object in register response:', JSON.stringify(response, null, 2));
        return response;
      }
      
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('No user ID in register response. User object:', JSON.stringify(user, null, 2));
        return response;
      }
      
      try {
        await setAuthToken(response.token, String(userId));
      } catch (error: any) {
        console.error('Error setting auth token:', error);
        // Don't throw - registration succeeded, just token save failed
      }
    }
    
    return response;
  },

  // Request OTP for phone login
  requestOTP: async (otpRequestData: OTPRequestData): Promise<OTPResponse> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return {
        success: true,
        message: 'OTP sent successfully (Mock: Use 123456)',
        data: {
          phone: otpRequestData.phone,
          expiresIn: '5 minutes'
        }
      };
    }
    
    // Validate phone is provided
    if (!otpRequestData.phone) {
      throw new Error('Phone number is required');
    }
    
    console.log('Requesting OTP for phone:', otpRequestData.phone);
    
    try {
      const requestBody = { phone: otpRequestData.phone };
      console.log('Sending OTP request with body:', JSON.stringify(requestBody));
      console.log('API URL will be:', `${API_BASE_URL}/auth/request-otp`);
      
      const response = await apiCall('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      console.log('OTP request response:', response);
      return response;
    } catch (error: any) {
      console.error('OTP request error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // Check if error message contains the specific error
      if (error.message && error.message.includes('Email or phone number is required')) {
        // This shouldn't happen for request-otp endpoint, but handle it
        throw new Error('Phone number is required. Please check your request.');
      }
      throw error;
    }
  },

  // Verify OTP and login
  verifyOTP: async (otpVerifyData: OTPVerifyData): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      // Accept any OTP in mock mode
      const mockToken = `mock_token_${Date.now()}`;
      const response: AuthResponse = {
        success: true,
        message: 'OTP verified successfully',
        token: mockToken,
        user: mockUser as any
      };
      await setAuthToken(mockToken, mockUser._id);
      return response;
    }
    const response = await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpVerifyData),
    });
    
    // Handle both response structures - nested data or direct properties
    const token = response.data?.token || (response as any).token;
    const user = response.data?.user || (response as any).user;
    
    if (response.success && token && user) {
      await setAuthToken(token, user._id);
    }
    
    return response;
  },

  // Get current user profile
  getMe: async (): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const token = await getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
          token: '',
          user: null as any
        };
      }
      return {
        success: true,
        message: 'Profile retrieved',
        token: token,
        user: mockUser as any
      };
    }
    
    // Check if authenticated before making API call
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Not authenticated',
        token: '',
        user: null as any
      };
    }
    
    try {
      const response = await apiCall('/auth/me');
      return response;
    } catch (error: any) {
      // If not authorized, return failure without logging error
      if (error.message?.includes('authorized') || error.message?.includes('Not authorized')) {
        return {
          success: false,
          message: 'Not authenticated',
          token: '',
          user: null as any
        };
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileData): Promise<AuthResponse> => {
    const response = await apiCall('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response;
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    return response;
  },

  // Login with PIN
  loginWithPin: async (loginPinData: LoginPinData): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      // Accept any PIN in mock mode
      const mockToken = `mock_token_${Date.now()}`;
      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        token: mockToken,
        user: mockUser as any
      };
      await setAuthToken(mockToken, mockUser._id);
      return response;
    }
    const response = await apiCall('/auth/login-pin', {
      method: 'POST',
      body: JSON.stringify(loginPinData),
    });
    
    if (response.success && response.token && response.user) {
      await setAuthToken(response.token, response.user._id);
    }
    
    return response;
  },

  // Set PIN
  setPin: async (pinData: SetPinData): Promise<{ success: boolean; message: string }> => {
    const response = await apiCall('/auth/set-pin', {
      method: 'POST',
      body: JSON.stringify(pinData),
    });
    return response;
  },

  // Forgot PIN - Request OTP
  forgotPin: async (forgotPinData: ForgotPinData): Promise<{ success: boolean; message: string; data?: any }> => {
    const response = await apiCall('/auth/forgot-pin', {
      method: 'POST',
      body: JSON.stringify(forgotPinData),
    });
    return response;
  },

  // Reset PIN with OTP
  resetPin: async (resetPinData: ResetPinData): Promise<{ success: boolean; message: string }> => {
    const response = await apiCall('/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify(resetPinData),
    });
    return response;
  },

  // Logout
  logout: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      await removeAuthSession();
      return;
    }
    try {
      const token = await getAuthToken();
      // Only call API if we have a token
      if (token) {
        try {
          await apiCall('/auth/logout', {
            method: 'POST',
          });
        } catch (error: any) {
          // Ignore logout API errors - we'll clear local session anyway
          // Don't log "Not authorized" errors as they're expected when already logged out
          if (!error.message?.includes('authorized') && !error.message?.includes('Not authorized')) {
            console.debug('Logout API error (ignored):', error);
          }
        }
      }
    } catch (error: any) {
      // Ignore all logout errors
      if (!error.message?.includes('authorized') && !error.message?.includes('Not authorized')) {
        console.debug('Logout error (ignored):', error);
      }
    } finally {
      // Always clear local session
      await removeAuthSession();
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    return await isSessionValid();
  },

  // Get current user token
  getToken: getAuthToken,

  // Set auth token (for manual token setting if needed)
  setToken: (token: string, userId: string) => setAuthToken(token, userId),

  // Check session validity
  isSessionValid: isSessionValid,
};