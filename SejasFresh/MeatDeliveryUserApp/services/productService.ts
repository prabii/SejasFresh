// Product Service - Connected to Backend API
import { mockProducts, delay, getProductImageSource } from '../data/mockData';
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
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('API call error:', error);
    throw error;
  }
};

export interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  images?: {
    _id: string;
    url: string;
    alt: string;
  }[];
  category: string;
  subcategory?: string;
  rating?: number;
  ratings?: {
    average: number;
    count: number;
  };
  deliveryTime?: string;
  isActive: boolean;
  availability: {
    inStock: boolean;
    quantity: number;
  };
  weight?: {
    value: number;
    unit: string;
  };
  discount?: {
    percentage: number;
    validUntil?: string;
  };
  preparationMethod?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Products API functions - using mock data
export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return [...mockProducts];
    }
    
    try {
      const response = await apiCall('/products');
      if (response.success && response.data?.data) {
        // Map backend products to frontend format
        return response.data.data.map((p: any) => ({
          _id: p._id,
          id: p._id, // Use _id as id for compatibility
          name: p.name,
          description: p.description || '',
          price: p.price,
          discountedPrice: p.discountedPrice,
          image: p.image,
          images: p.images,
          category: p.category,
          subcategory: p.subcategory,
          rating: p.rating,
          ratings: p.ratings,
          deliveryTime: p.deliveryTime,
          isActive: p.isActive !== false,
          availability: p.availability || { inStock: true, quantity: 0 },
          weight: p.weight,
          discount: p.discount,
          preparationMethod: p.preparationMethod,
          tags: p.tags,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get product by ID
  getProductById: async (productId: string): Promise<Product> => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const product = mockProducts.find(p => p._id === productId || p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    }
    
    try {
      const response = await apiCall(`/products/${productId}`);
      if (response.success && response.data) {
        const p = response.data;
        return {
          _id: p._id,
          id: p._id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          discountedPrice: p.discountedPrice,
          image: p.image,
          images: p.images,
          category: p.category,
          subcategory: p.subcategory,
          rating: p.rating,
          ratings: p.ratings,
          deliveryTime: p.deliveryTime,
          isActive: p.isActive !== false,
          availability: p.availability || { inStock: true, quantity: 0 },
          weight: p.weight,
          discount: p.discount,
          preparationMethod: p.preparationMethod,
          tags: p.tags,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }
      throw new Error('Product not found');
    } catch (error: any) {
      console.error('Error fetching product:', error);
      throw new Error(error.message || 'Product not found');
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    try {
      const response = await apiCall(`/products?category=${encodeURIComponent(category)}`);
      if (response.success && response.data?.data) {
        return response.data.data.map((p: any) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          discountedPrice: p.discountedPrice,
          image: p.image,
          images: p.images,
          category: p.category,
          subcategory: p.subcategory,
          rating: p.rating,
          ratings: p.ratings,
          deliveryTime: p.deliveryTime,
          isActive: p.isActive !== false,
          availability: p.availability || { inStock: true, quantity: 0 },
          weight: p.weight,
          discount: p.discount,
          preparationMethod: p.preparationMethod,
          tags: p.tags,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Get suggested products (you might also like)
  getSuggestedProducts: async (limit: number = 10): Promise<Product[]> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      // Return random products as suggestions
      const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    }
    
    try {
      const response = await apiCall(`/products/suggested?limit=${limit}`);
      if (response.success && response.data) {
        return response.data.map((p: any) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          discountedPrice: p.discountedPrice,
          image: p.image,
          images: p.images,
          category: p.category,
          subcategory: p.subcategory,
          rating: p.rating,
          ratings: p.ratings,
          deliveryTime: p.deliveryTime,
          isActive: p.isActive !== false,
          availability: p.availability || { inStock: true, quantity: 0 },
          weight: p.weight,
          discount: p.discount,
          preparationMethod: p.preparationMethod,
          tags: p.tags,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching suggested products:', error);
      // Fallback: return random active products
      try {
        const allProducts = await productService.getAllProducts();
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error in fallback for suggested products:', fallbackError);
        return [];
      }
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const lowerQuery = query.toLowerCase();
      return mockProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(lowerQuery)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }
    
    try {
      const response = await apiCall(`/products?search=${encodeURIComponent(query)}`);
      if (response.success && response.data?.data) {
        return response.data.data.map((p: any) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          discountedPrice: p.discountedPrice,
          image: p.image,
          images: p.images,
          category: p.category,
          subcategory: p.subcategory,
          rating: p.rating,
          ratings: p.ratings,
          deliveryTime: p.deliveryTime,
          isActive: p.isActive !== false,
          availability: p.availability || { inStock: true, quantity: 0 },
          weight: p.weight,
          discount: p.discount,
          preparationMethod: p.preparationMethod,
          tags: p.tags,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },
};