import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

// Address interface for structured address
interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// User interface
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | Address;
  city?: string;
  zipCode?: string;
  role: string;
  isActive: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  // Optional fields from backend
  fullName?: string;
  emailVerified?: boolean;
  otpIsVerified?: boolean;
  savedAddresses?: any[];
  [key: string]: any;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateUserProfile: (userData: any) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // First, try to load cached user data for immediate UI display
      // This prevents blank screens while fetching from backend
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          const parsedUser = JSON.parse(cachedUserData);
          // Set cached user immediately for better UX
          setUser(parsedUser);
        }
      } catch (e) {
        console.log('No cached user data found');
      }
      
      // First check if we have a valid token
      const isAuth = await authService.isAuthenticated();
      
      if (!isAuth) {
        // No valid token - clear everything and show login
        console.log('No valid token found - showing login screen');
        await AsyncStorage.removeItem('userData');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // We have a valid token - try to get fresh user data from backend
      // Cached user is already set above, so UI won't be blank
      try {
        const response = await authService.getMe();
        if (response.success && response.user) {
          // Got fresh user data - use it (replaces cached data)
          const fetchedUser = response.user;
          setUser(fetchedUser);
          // Persist updated user data
          AsyncStorage.setItem('userData', JSON.stringify(fetchedUser)).catch((e: any) =>
            console.error('Failed to persist userData:', e)
          );
        } else {
          // API call succeeded but no user data - token might be invalid
          console.log('No user data in response - clearing auth');
          await authService.logout();
          await AsyncStorage.removeItem('userData');
          setUser(null);
        }
      } catch (error: any) {
        // If getMe fails, check if it's an auth error
        const isAuthError = error.message?.includes('authorized') || error.message?.includes('Not authenticated');
        
        if (isAuthError) {
          // Token is invalid - clear everything
          console.log('Token validation failed - clearing auth');
          await authService.logout();
          await AsyncStorage.removeItem('userData');
          setUser(null);
        } else {
          // Network error or other issue - keep cached user if available
          console.error('Failed to validate token (network error):', error);
          // Don't clear user on network errors - keep cached data
          // User will be updated on next successful fetch
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On any error, try to keep cached user if available
      // Only clear if it's a critical error
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (!cachedUserData) {
          // No cached data and error occurred - clear auth
          await authService.logout();
          setUser(null);
        }
        // If cached data exists, keep it
      } catch (e) {
        console.error('Error during error handling:', e);
        setUser(null);
      }
    } finally {
      // Always stop loading
      setIsLoading(false);
    }
  };

  const login = async (userData: User, token: string) => {
    try {
      // Optimistic: set user in context immediately so UI can navigate fast
      setUser(userData);

      // Persist user data to AsyncStorage but don't block UI navigation
      AsyncStorage.setItem('userData', JSON.stringify(userData)).catch((e: any) =>
        console.error('Error saving user data:', e)
      );

      // Note: token/session should already be saved by authService methods
    } catch (error) {
      console.error('Error saving user data (unexpected):', error);
      // Ensure user is set even if persistence failed
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    // If userData looks like a full user object, replace
    if (userData && userData._id && userData.email && userData.firstName && userData.lastName) {
      setUser(userData as User);
    } else if (user) {
      setUser({ ...user, ...userData });
    } else if (userData) {
      setUser(userData as User);
    }
  };

  const updateUserProfile = async (userData: any) => {
    try {
      // Update the user profile on the backend
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        // Get the updated user data from response
        const updatedUserData = response.user;
        
        if (updatedUserData) {
          setUser(updatedUserData);
          // Save updated user data to AsyncStorage
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        } else {
          // If no user data in response, update local state with provided data
          const updatedUser = { ...user, ...userData } as User;
          setUser(updatedUser);
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        }
      } else {
        // Extract error message from response
        const errorMessage = response.message || 'Failed to update profile';
        const error = new Error(errorMessage);
        // Preserve the original error details
        (error as any).response = response;
        throw error;
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      // Re-throw with better error message if available
      if (error?.response?.message) {
        throw new Error(error.response.message);
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user, // User is only set if there's a valid token (see checkAuthStatus)
    isLoading,
    login,
    logout,
    updateUser,
    updateUserProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      // You can return a loading screen here
      return null;
    }

    if (!isAuthenticated) {
      // Redirect to login or return null
      return null;
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};