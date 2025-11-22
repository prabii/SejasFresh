import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://meat-delivery-backend.onrender.com/api';

// Log API URL for debugging
console.log('🔗 Delivery Boy API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('delivery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No delivery token found for request:', config.url);
  }
  console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        message: error.response.data?.message || error.message,
      });
    } else if (error.request) {
      console.error('❌ API Request Error (No Response):', {
        url: error.config?.url,
        message: 'Network error - backend may be down or unreachable',
      });
    }

    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - removing token and redirecting to login');
      localStorage.removeItem('delivery_token');
      // Only redirect if not already on login page to prevent reload loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

