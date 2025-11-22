// Cart Service - Connected to Backend API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProducts, delay, getMockCart } from '../data/mockData';
import { Product } from './productService';
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
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('API call error:', error);
    throw error;
  }
};

const CART_STORAGE_KEY = 'mock_cart';

export interface CartItem {
  _id: string;
  product: Product | null;
  quantity: number;
  priceAtTime: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  appliedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  finalAmount?: number;
  formattedTotal: string;
  appliedCoupon?: AppliedCoupon;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  totalAmount: number;
  formattedTotal: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    priceAtTime: number;
    subtotal: number;
  }[];
}

// Helper to load cart from storage
const loadCart = async (): Promise<Cart> => {
  try {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
  return getMockCart();
};

// Helper to save cart to storage
const saveCart = async (cart: Cart): Promise<void> => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// Helper to calculate cart totals
const calculateCartTotals = (items: CartItem[], appliedCoupon?: AppliedCoupon): {
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  formattedTotal: string;
} => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  const discountAmount = appliedCoupon?.discount || 0;
  const finalAmount = Math.max(0, subtotal - discountAmount);
  
  return {
    totalItems,
    subtotal,
    discountAmount,
    finalAmount,
    formattedTotal: `₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  };
};

// Cart API functions - using mock data
export const cartService = {
  // Get user's cart
  getCart: async (): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const cart = await loadCart();
      const totals = calculateCartTotals(cart.items, cart.appliedCoupon);
      return {
        ...cart,
        ...totals,
        updatedAt: new Date().toISOString()
      };
    }
    
    try {
      const token = await authService.getToken();
      if (!token) {
        // Not authenticated, return empty cart silently
        return getMockCart();
      }
      
      const response = await apiCall('/cart');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to get cart');
    } catch (error: any) {
      // If not authorized, return empty cart silently (user not logged in)
      if (error.message?.includes('authorized') || error.message?.includes('Not authorized')) {
        return getMockCart();
      }
      // Only log unexpected errors
      console.error('Error getting cart:', error);
      // For other errors, also return empty cart
      return getMockCart();
    }
  },

  // Add item to cart
  addToCart: async (productId: string, quantity: number): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const cart = await loadCart();
      const product = mockProducts.find(p => p._id === productId || p.id === productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.product && (item.product._id === productId || item.product.id === productId)
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].updatedAt = new Date().toISOString();
      } else {
        // Add new item
        const newItem: CartItem = {
          _id: `item_${Date.now()}`,
          product: product,
          quantity: quantity,
          priceAtTime: product.discountedPrice || product.price,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        cart.items.push(newItem);
      }

      const totals = calculateCartTotals(cart.items, cart.appliedCoupon);
      const updatedCart = {
        ...cart,
        ...totals,
        updatedAt: new Date().toISOString()
      };

      await saveCart(updatedCart);
      return updatedCart;
    }
    
    try {
      const response = await apiCall('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to add to cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update item quantity in cart
  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const cart = await loadCart();
      const itemIndex = cart.items.findIndex(item => item._id === itemId);
      
      if (itemIndex < 0) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].updatedAt = new Date().toISOString();
      }

      const totals = calculateCartTotals(cart.items, cart.appliedCoupon);
      const updatedCart = {
        ...cart,
        ...totals,
        updatedAt: new Date().toISOString()
      };

      await saveCart(updatedCart);
      return updatedCart;
    }
    
    try {
      const response = await apiCall(`/cart/update/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update cart item');
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const cart = await loadCart();
      cart.items = cart.items.filter(item => item._id !== itemId);

      const totals = calculateCartTotals(cart.items, cart.appliedCoupon);
      const updatedCart = {
        ...cart,
        ...totals,
        updatedAt: new Date().toISOString()
      };

      await saveCart(updatedCart);
      return updatedCart;
    }
    
    try {
      const response = await apiCall(`/cart/remove/${itemId}`, {
        method: 'DELETE',
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to remove from cart');
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const emptyCart = getMockCart();
      await saveCart(emptyCart);
      return emptyCart;
    }
    
    try {
      const response = await apiCall('/cart/clear', {
        method: 'DELETE',
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to clear cart');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Apply coupon to cart
  applyCoupon: async (code: string): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      // Coupon logic would be handled by coupon service
      // For now, just return cart without coupon
      const cart = await loadCart();
      return cart;
    }
    
    try {
      const response = await apiCall('/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to apply coupon');
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },

  // Remove coupon from cart
  removeCoupon: async (): Promise<Cart> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const cart = await loadCart();
      cart.appliedCoupon = undefined;
      const totals = calculateCartTotals(cart.items);
      const updatedCart = {
        ...cart,
        ...totals,
        updatedAt: new Date().toISOString()
      };
      await saveCart(updatedCart);
      return updatedCart;
    }
    
    try {
      const response = await apiCall('/cart/remove-coupon', {
        method: 'DELETE',
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to remove coupon');
    } catch (error: any) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  },

  // Get cart summary
  getCartSummary: async (): Promise<CartSummary> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const cart = await loadCart();
      const totals = calculateCartTotals(cart.items, cart.appliedCoupon);
      
      return {
        itemCount: totals.totalItems,
        totalAmount: totals.finalAmount,
        formattedTotal: totals.formattedTotal,
        items: cart.items.map(item => ({
          productId: item.product?._id || item.product?.id || '',
          name: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
          subtotal: item.priceAtTime * item.quantity
        }))
      };
    }
    
    try {
      const response = await apiCall('/cart/summary');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get cart summary');
    } catch (error: any) {
      console.error('Error getting cart summary:', error);
      // Return empty summary on error
      return {
        itemCount: 0,
        totalAmount: 0,
        formattedTotal: '₹0',
        items: []
      };
    }
  },
};

// Error handling types
export interface ApiError {
  message: string;
  status?: number;
}
