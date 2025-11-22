import Constants from 'expo-constants';

// API Configuration
// Configuration for different environments
const CONFIG = {
  development: {
    API_HOST: Constants.expoConfig?.extra?.apiHost || '192.168.1.5',
    API_PORT: Constants.expoConfig?.extra?.apiPort || '5000',
  },
  production: {
    API_HOST: Constants.expoConfig?.extra?.productionApiHost || 'meat-delivery-backend.onrender.com',
    API_PORT: '443',
  },
};

// Get current environment (true for development, false for production)
// Use production backend by default (Render) - override with app.json extra.apiHost for local dev
const isDevelopment = __DEV__;
const useLocalBackend = Constants.expoConfig?.extra?.useLocalBackend === 'true';
const currentConfig = isDevelopment && useLocalBackend ? CONFIG.development : CONFIG.production;

// Build API URL - Use Render backend by default, allow override for local development
const API_URL = (isDevelopment && useLocalBackend)
  ? `http://${currentConfig.API_HOST}:${currentConfig.API_PORT}/api`
  : Constants.expoConfig?.extra?.productionApiUrl || 'https://meat-delivery-backend.onrender.com/api';

export const API_CONFIG = {
  // API Base URL based on environment
  BASE_URL: API_URL,
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    
    // Cart
    GET_CART: '/cart',
    ADD_TO_CART: '/cart/add',
    UPDATE_CART_ITEM: '/cart/update',
    REMOVE_FROM_CART: '/cart/remove',
    CLEAR_CART: '/cart/clear',
    GET_CART_SUMMARY: '/cart/summary',
    
    // Products
    GET_PRODUCTS: '/products',
    GET_PRODUCT_BY_ID: '/products',
    GET_PRODUCTS_BY_CATEGORY: '/products/category',
    GET_SUGGESTED_PRODUCTS: '/products/suggested',
    SEARCH_PRODUCTS: '/products/search',
    
    // Orders
    CREATE_ORDER: '/orders',
    GET_ORDERS: '/orders',
    GET_ORDER_BY_ID: '/orders',
    
    // User
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Request headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Environment-specific configuration
export const ENV = {
  development: {
    API_URL: `http://${CONFIG.development.API_HOST}:${CONFIG.development.API_PORT}/api`,
    DEBUG: true,
    PORT: CONFIG.development.API_PORT,
    HOST: CONFIG.development.API_HOST,
  },
  production: {
    API_URL: Constants.expoConfig?.extra?.productionApiUrl || 'https://meat-delivery-backend.onrender.com/api',
    DEBUG: false,
    PORT: CONFIG.production.API_PORT,
    HOST: CONFIG.production.API_HOST,
  },
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const isDevelopment = __DEV__; // React Native development flag
  const useLocalBackend = Constants.expoConfig?.extra?.useLocalBackend === 'true';
  
  // Use production (Render) backend by default, unless explicitly set to use local
  if (isDevelopment && useLocalBackend) {
    return ENV.development;
  }
  return ENV.production;
};