import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Verify token and get user
      console.log('Verifying admin token on mount...');
      api.get('/auth/me')
        .then((response) => {
          console.log('Token verification response:', response.data);
          if (response.data.success && response.data.user.role === 'admin') {
            setUser(response.data.user);
            console.log('Admin token verified, user set');
          } else {
            console.warn('Token verification failed: User role is not admin or response unsuccessful');
            localStorage.removeItem('admin_token');
          }
        })
        .catch((error) => {
          console.error('Token verification error:', error.response?.data || error.message);
          localStorage.removeItem('admin_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Admin login attempt:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        if (response.data.user.role !== 'admin') {
          console.error('Login failed: User role is not admin:', response.data.user.role);
          throw new Error('Access denied. Admin role required.');
        }
        localStorage.setItem('admin_token', response.data.token);
        setUser(response.data.user);
        console.log('Admin login successful, token saved');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

