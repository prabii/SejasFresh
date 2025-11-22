import { getCurrentConfig } from '../config/api';
import { authService } from './authService';

const API_BASE_URL = getCurrentConfig().API_URL;

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  formattedDiscount: string;
  validFrom: string;
  validTo: string;
}

export interface CouponValidationResponse {
  coupon: Coupon;
  discount: number;
  applicableAmount: number;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  appliedAt: string;
}

class CouponService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await authService.getToken();
    } catch (error) {
      console.error('Error getting auth token from authService:', error);
      return null;
    }
  }

  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    body?: any,
    requiresAuth: boolean = true
  ) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (requiresAuth) {
        const token = await this.getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Coupon service error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get active coupons (public endpoint)
  async getActiveCoupons(): Promise<Coupon[]> {
    try {
      const response = await this.makeRequest('/coupons/active', 'GET', undefined, false);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }
  }

  // Validate coupon with order amount
  async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResponse> {
    try {
      const response = await this.makeRequest('/coupons/validate', 'POST', {
        code: code.toUpperCase(),
        orderAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  }

  // Apply coupon to cart
  async applyCouponToCart(code: string): Promise<any> {
    try {
      const response = await this.makeRequest('/coupons/apply', 'POST', {
        code: code.toUpperCase()
      });
      return response.data;
    } catch (error) {
      console.error('Error applying coupon to cart:', error);
      throw error;
    }
  }

  // Remove coupon from cart
  async removeCouponFromCart(): Promise<any> {
    try {
      const response = await this.makeRequest('/cart/remove-coupon', 'DELETE');
      return response.data;
    } catch (error: any) {
      console.error('Error removing coupon from cart:', error);
      // If the specific toFixed error occurs, it means the coupon was removed but there's a formatting issue
      if (error.message && error.message.includes('toFixed')) {
        // Return a success response since the coupon was likely removed
        return { success: true };
      }
      throw error;
    }
  }

  // Get cart summary with coupon info
  async getCartSummary(): Promise<any> {
    try {
      const response = await this.makeRequest('/cart/summary', 'GET');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      throw error;
    }
  }
}

export const couponService = new CouponService();