/**
 * Backend Integration Usage Examples
 * 
 * This file demonstrates how to use the backend services
 * in your React Native components.
 */

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { authService, LoginData } from '../services/authService';
import { Cart, cartService } from '../services/cartService';
import { Product, productService } from '../services/productService';

// Example: Using Cart Service
const ExampleCartComponent = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  // Load cart data
  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return null; // Your JSX here
};

// Example: Using Product Service
const ExampleProductComponent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = async (query: string) => {
    try {
      const searchResults = await productService.searchProducts(query);
      setProducts(searchResults);
    } catch (error) {
      Alert.alert('Error', 'Search failed');
    }
  };

  // Get products by category
  const getProductsByCategory = async (category: string) => {
    try {
      const categoryProducts = await productService.getProductsByCategory(category);
      setProducts(categoryProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load category products');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return null; // Your JSX here
};

// Example: Using Auth Service
const ExampleAuthComponent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login user
  const loginUser = async (email: string, password: string) => {
    try {
      setLoading(true);
      const loginData: LoginData = { email, password };
      const response = await authService.login(loginData);
      
      if (response.success) {
        setIsAuthenticated(true);
        Alert.alert('Success', 'Logged in successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  // Logout user
  const logoutUser = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return null; // Your JSX here
};

/**
 * Backend Setup Instructions:
 * 
 * 1. Update API Configuration:
 *    - Edit `config/api.ts` file
 *    - Replace the BASE_URL with your actual backend URL
 *    - For local development: 'http://localhost:3000/api'
 *    - For production: 'https://your-domain.com/api'
 * 
 * 2. Authentication:
 *    - The services automatically handle JWT token storage
 *    - Tokens are stored in AsyncStorage
 *    - Include authorization headers in API calls
 * 
 * 3. Error Handling:
 *    - All services include try-catch blocks
 *    - Proper error messages are displayed to users
 *    - Network errors are handled gracefully
 * 
 * 4. Backend API Requirements:
 *    - Cart endpoints: GET, POST, PUT, DELETE /api/cart/*
 *    - Product endpoints: GET /api/products/*
 *    - Auth endpoints: POST /api/auth/*
 *    - All endpoints should return JSON responses
 *    - Include proper HTTP status codes
 * 
 * 5. Data Models:
 *    - Cart model with user reference and items array
 *    - Product model with price, availability, images
 *    - User model with authentication details
 * 
 * 6. Testing:
 *    - Test with local backend server first
 *    - Use tools like Postman to verify API endpoints
 *    - Check network connectivity on mobile device
 * 
 * 7. Production Deployment:
 *    - Update API_URL in config for production
 *    - Ensure HTTPS for production APIs
 *    - Configure CORS on backend for mobile app
 */