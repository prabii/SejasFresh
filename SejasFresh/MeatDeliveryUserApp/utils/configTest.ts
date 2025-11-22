/**
 * Configuration Test Script
 * Run this to verify your API configuration is working correctly
 */

import { API_CONFIG, ENV, getCurrentConfig } from '../config/api';

export const testConfiguration = () => {
  console.log('=== API Configuration Test ===');
  
  // Test current configuration
  const currentConfig = getCurrentConfig();
  console.log('Current Environment:', __DEV__ ? 'Development' : 'Production');
  console.log('API URL:', currentConfig.API_URL);
  console.log('Debug Mode:', currentConfig.DEBUG);
  
  // Test API_CONFIG
  console.log('\n=== API_CONFIG ===');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Timeout:', API_CONFIG.TIMEOUT);
  
  // Test ENV configurations
  console.log('\n=== Environment Configurations ===');
  console.log('Development API URL:', ENV.development.API_URL);
  console.log('Development Host:', ENV.development.HOST);
  console.log('Development Port:', ENV.development.PORT);
  
  console.log('Production API URL:', ENV.production.API_URL);
  console.log('Production Host:', ENV.production.HOST);
  console.log('Production Port:', ENV.production.PORT);
  
  // Test connectivity message
  console.log('\n=== Connection Instructions ===');
  if (__DEV__) {
    console.log('🔧 Development Mode:');
    console.log('1. Start your backend server: node server.js');
    console.log('2. Ensure server is running on port 5000');
    console.log('3. For Android emulator: adb reverse tcp:5000 tcp:5000');
    console.log('4. Test API at: http://localhost:5000/api (or https://meat-delivery-backend.onrender.com/api for production)');
  } else {
    console.log('🚀 Production Mode:');
    console.log('1. Update production API_HOST in config/api.ts');
    console.log('2. Ensure HTTPS is configured');
    console.log('3. Test API at your production URL');
  }
  
  console.log('\n=== Test Complete ===');
};

// Example usage in a component:
// import { testConfiguration } from '../utils/configTest';
// useEffect(() => {
//   testConfiguration();
// }, []);