import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentConfig } from '../config/api';
import { authService } from './authService';
import { cartService } from './cartService';

const API_BASE_URL = getCurrentConfig().API_URL;

// Use authService token getter (uses in-memory cache)
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await authService.getToken();
  } catch (error) {
    console.error('Error getting auth token from authService:', error);
    return null;
  }
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract specific error message from backend response
      const errorMessage = data.message || data.error || 'Something went wrong';
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export interface OrderItem {
  product: string; // Product ID
  quantity: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  landmark?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  alternatePhone?: string;
}

export interface CreateOrderRequest {
  items?: OrderItem[]; // Optional - backend can get from cart
  deliveryAddress?: DeliveryAddress;
  savedAddressId?: string; // Use saved address instead
  contactInfo?: ContactInfo;
  paymentMethod: string;
  specialInstructions?: string;
  orderNumber?: string; // Order number - will be generated if not provided
}

export interface OrderItemResponse {
  product: {
    _id: string;
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    price: number;
    discountedPrice?: number;
    weight: {
      value: number;
      unit: string;
    };
    availability: {
      inStock: boolean;
      quantity: number;
    };
    discount: {
      percentage: number;
      validUntil?: string;
    };
    ratings: {
      average: number;
      count: number;
    };
    images: {
      url: string;
      alt: string;
      _id: string;
    }[];
    preparationMethod: string;
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  quantity: number;
  priceAtTime: number;
  subtotal: number;
  _id: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  updatedBy?: {
    firstName: string;
    lastName: string;
  };
  notes?: string;
}

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  customer: {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
  };
  items: OrderItemResponse[];
  deliveryAddress: DeliveryAddress;
  contactInfo: ContactInfo;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    discount: number;
  };
  paymentInfo: {
    method: string;
    status: string;
    paidAt?: string;
  };
  status: string;
  statusHistory: OrderStatusHistory[];
  specialInstructions?: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  formattedTotal: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: {
    data: Order[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface OrderStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalOrders: number;
    totalRevenue: number;
    statusBreakdown: {
      _id: string;
      count: number;
      totalRevenue: number;
    }[];
  };
}

class OrderService {
  // Generate a unique order number
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      console.log('API URL being called:', `${API_BASE_URL}/orders`);
      const response = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      
      // Handle different response structures
      if (response.success && response.data) {
        return response.data;
      } else if (response.success && response.order) {
        return response.order;
      } else if (response.data) {
        return response.data;
      }
      
      // If response is the order itself
      return response;
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Order data that failed:', JSON.stringify(orderData, null, 2));
      
      // Provide more helpful error messages
      if (error.message?.includes('Resource not found')) {
        throw new Error('Address not found. Please select a valid delivery address.');
      } else if (error.message?.includes('authorized') || error.message?.includes('authentication')) {
        throw new Error('Please login to place an order.');
      } else if (error.message) {
        throw error;
      }
      
      throw new Error('Failed to place order. Please try again.');
    }
  }

  // Get user's orders
  async getUserOrders(page: number = 1, limit: number = 10): Promise<OrdersListResponse> {
    try {
      // Check if user is authenticated before making request
      const token = await getAuthToken();
      if (!token) {
        // User not authenticated, return empty response
        return {
          success: true,
          message: 'Not authenticated',
          data: {
            data: [],
            pagination: {
              current: 1,
              pages: 1,
              total: 0,
              limit
            }
          }
        };
      }

      const response = await apiCall(`/orders?page=${page}&limit=${limit}`);
      return response;
    } catch (error: any) {
      // If error is about authentication, return empty response instead of throwing
      if (error.message?.includes('authorized') || error.message?.includes('authentication') || error.message?.includes('Not authorized')) {
        return {
          success: true,
          message: 'Not authenticated',
          data: {
            data: [],
            pagination: {
              current: 1,
              pages: 1,
              total: 0,
              limit
            }
          }
        };
      }
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get single order by ID
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiCall(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Get order by ID (alias for getOrder)
  async getOrderById(orderId: string): Promise<{ success: boolean; data: Order }> {
    try {
      const response = await apiCall(`/orders/${orderId}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await apiCall(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<Order> {
    try {
      const response = await apiCall(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Assign delivery (admin only)
  async assignDelivery(orderId: string, assignedTo: string, estimatedTime?: string, notes?: string): Promise<Order> {
    try {
      const response = await apiCall(`/orders/${orderId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTo, estimatedTime, notes }),
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning delivery:', error);
      throw error;
    }
  }

  // Get order statistics (admin only)
  async getOrderStats(): Promise<OrderStatsResponse['data']> {
    try {
      const response = await apiCall('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  // Helper method to create order from current cart with selected address
  async createOrderFromCart(savedAddressId: string, paymentMethod: string = 'cash-on-delivery', specialInstructions?: string): Promise<Order> {
    try {
      // First, get the current cart to extract items
      const cart = await cartService.getCart();
      
      console.log('Cart retrieved for order:', JSON.stringify(cart, null, 2));
      
      if (!cart || !cart.items || cart.items.length === 0) {
        console.log('Cart is empty or has no items');
        throw new Error('Your cart is empty. Please add items before placing an order.');
      }

      // Convert cart items to order items format
      const orderItems: OrderItem[] = cart.items
        .filter(item => {
          const isValid = item.product !== null && item.product?._id;
          console.log(`Item valid check: ${isValid}, product:`, item.product);
          return isValid;
        })
        .map(item => ({
          product: item.product!._id, // Use the product ID
          quantity: item.quantity
        }));

      console.log('Order items prepared:', JSON.stringify(orderItems, null, 2));

      if (orderItems.length === 0) {
        throw new Error('No valid items found in cart. Please add items before placing an order.');
      }

      // Get user info for contact details
      const userData = await AsyncStorage.getItem('userData');
      let contactInfo: ContactInfo = {};
      
      if (userData) {
        const user = JSON.parse(userData);
        contactInfo = {
          phone: user.phone,
          email: user.email,
        };
      }

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create order with explicit items - single request
      const orderData: CreateOrderRequest = {
        savedAddressId,
        contactInfo,
        paymentMethod,
        orderNumber,
        items: orderItems, // Always include cart items explicitly
        ...(specialInstructions && { specialInstructions }), // Only include if not empty
      };

      console.log('Creating order with payload:', JSON.stringify(orderData, null, 2));
      return await this.createOrder(orderData);
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();

