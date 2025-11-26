// Mock data for offline/development use
// This replaces all API calls with local data

import { Product } from '../services/productService';
import { Cart, CartItem } from '../services/cartService';
import { Order } from '../services/orderService';
import { Address } from '../services/addressService';
import { Coupon } from '../services/couponService';
import { NotificationItem } from '../services/notificationService';

// Image mapping - maps product names to placeholder image
// NOTE: Product images should come from backend API, not bundled in app
// This function is only used as a fallback when backend images are unavailable
export const getProductImage = (productName: string): any => {
  // Always return placeholder - product images should come from backend
  // This reduces app size significantly (30-40 MB saved)
  return require('../assets/images/instant-pic.png');
};

// Mock Products Data - Matching Figma Design
export const mockProducts: Product[] = [
  // Premium Cuts (as shown in Figma: Loin, Shank, Brisket, Chuck)
  {
    _id: '1',
    id: '1',
    name: 'Loin',
    description: 'Premium loin cut, tender and flavorful. Perfect for special occasions.',
    price: 1500,
    discountedPrice: 1200,
    image: undefined,
    images: [{
      _id: 'img1',
      url: 'loin',
      alt: 'Loin'
    }],
    category: 'premium',
    subcategory: 'steak',
    rating: 4.8,
    ratings: {
      average: 4.8,
      count: 150
    },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 25
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 20,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['premium', 'fresh', 'organic', 'tender'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    id: '2',
    name: 'Shank',
    description: 'Premium shank cut, perfect for slow cooking and braising.',
    price: 1400,
    discountedPrice: 1100,
    image: undefined,
    images: [{
      _id: 'img2',
      url: 'shank',
      alt: 'Shank'
    }],
    category: 'premium',
    subcategory: 'roast',
    rating: 4.7,
    ratings: {
      average: 4.7,
      count: 120
    },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 30
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 21,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['premium', 'braising', 'slow-cook'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    id: '3',
    name: 'Brisket',
    description: 'Premium brisket cut, ideal for smoking and BBQ.',
    price: 1300,
    discountedPrice: 1050,
    image: undefined,
    images: [{
      _id: 'img3',
      url: 'brisket',
      alt: 'Brisket'
    }],
    category: 'premium',
    subcategory: 'roast',
    rating: 4.6,
    ratings: {
      average: 4.6,
      count: 180
    },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 20
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 19,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['premium', 'bbq', 'smoking'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '4',
    id: '4',
    name: 'Chuck',
    description: 'Premium chuck cut, great for pot roasts and stews.',
    price: 1200,
    discountedPrice: 1000,
    image: undefined,
    images: [{
      _id: 'img4',
      url: 'chuck',
      alt: 'Chuck'
    }],
    category: 'premium',
    subcategory: 'roast',
    rating: 4.5,
    ratings: {
      average: 4.5,
      count: 160
    },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 35
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 17,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['premium', 'stew', 'pot-roast'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '5',
    id: '5',
    name: 'Tenderloin',
    description: 'Premium tenderloin cut, the most tender part of beef. Perfect for special occasions.',
    price: 1500,
    discountedPrice: 1200,
    image: undefined,
    images: [{
      _id: 'img5',
      url: 'tenderloin',
      alt: 'Tenderloin'
    }],
    category: 'premium',
    subcategory: 'steak',
    rating: 4.8,
    ratings: {
      average: 4.8,
      count: 150
    },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 25
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 20,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['premium', 'fresh', 'organic', 'tender'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '6',
    id: '6',
    name: 'Ribeye Steak',
    description: 'Well-marbled ribeye steak with rich flavor. Great for grilling.',
    price: 1400,
    discountedPrice: 1100,
    image: undefined,
    images: [{
      _id: 'img6',
      url: 'ribeye',
      alt: 'Ribeye Steak'
    }],
    category: 'premium',
    subcategory: 'steak',
    rating: 4.7,
    ratings: {
      average: 4.7,
      count: 120
    },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 30
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 21,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['premium', 'marbled', 'grilling'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // Instant Deliverables - Normal category products
  {
    _id: '9',
    id: '9',
    name: 'Beef',
    description: 'Fresh premium beef, perfect for any recipe. Delivered within 30 minutes.',
    price: 400,
    discountedPrice: 400,
    image: undefined,
    images: [{
      _id: 'img9',
      url: 'beef',
      alt: 'Beef'
    }],
    category: 'normal',
    subcategory: 'beef',
    rating: 4.8,
    ratings: {
      average: 4.8,
      count: 250
    },
    deliveryTime: '30 min',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 100
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'beef'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '10',
    id: '10',
    name: 'Beef',
    description: 'Premium quality beef, cut fresh daily. Fast delivery available.',
    price: 400,
    discountedPrice: 400,
    image: undefined,
    images: [{
      _id: 'img10',
      url: 'beef2',
      alt: 'Beef'
    }],
    category: 'normal',
    subcategory: 'beef',
    rating: 4.8,
    ratings: {
      average: 4.8,
      count: 200
    },
    deliveryTime: '30 min',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 80
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'beef'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '11',
    id: '11',
    name: 'Buffalo Liver',
    description: 'Fresh buffalo liver, rich in nutrients. Delivered within 30 minutes.',
    price: 400,
    discountedPrice: 400,
    image: undefined,
    images: [{
      _id: 'img11',
      url: 'buffalo-liver',
      alt: 'Buffalo Liver'
    }],
    category: 'normal',
    subcategory: 'organ',
    rating: 4.8,
    ratings: {
      average: 4.8,
      count: 150
    },
    deliveryTime: '30 min',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 60
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'organ', 'liver'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '12',
    id: '12',
    name: 'Buffalo Brain',
    description: 'Fresh buffalo brain, delicacy meat. Delivered within 30 minutes.',
    price: 400,
    discountedPrice: 400,
    image: undefined,
    images: [{
      _id: 'img12',
      url: 'buffalo-brain',
      alt: 'Buffalo Brain'
    }],
    category: 'normal',
    subcategory: 'organ',
    rating: 4.8,
    ratings: {
      average: 4.8,
      count: 120
    },
    deliveryTime: '30 min',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 40
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'organ', 'brain'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    id: '3',
    name: 'Boti',
    description: 'Traditional boti cut, perfect for kebabs and curries.',
    price: 800,
    discountedPrice: 650,
    image: undefined,
    images: [{
      _id: 'img3',
      url: 'boti',
      alt: 'Boti'
    }],
    category: 'normal',
    subcategory: 'curry',
    rating: 4.5,
    ratings: {
      average: 4.5,
      count: 200
    },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 50
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 19,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['traditional', 'curry', 'kebab'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '4',
    id: '4',
    name: 'Beef Brisket',
    description: 'Slow-cooked brisket, tender and flavorful. Perfect for BBQ.',
    price: 900,
    discountedPrice: 750,
    image: undefined,
    images: [{
      _id: 'img4',
      url: 'beef-brisket',
      alt: 'Beef Brisket'
    }],
    category: 'normal',
    subcategory: 'roast',
    rating: 4.6,
    ratings: {
      average: 4.6,
      count: 180
    },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 40
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 17,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['bbq', 'slow-cooked', 'tender'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '5',
    id: '5',
    name: 'Short Ribs',
    description: 'Meaty short ribs, great for braising and slow cooking.',
    price: 850,
    discountedPrice: 700,
    image: undefined,
    images: [{
      _id: 'img5',
      url: 'short-ribs',
      alt: 'Short Ribs'
    }],
    category: 'normal',
    subcategory: 'ribs',
    rating: 4.4,
    ratings: {
      average: 4.4,
      count: 160
    },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 35
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 18,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['ribs', 'braising', 'meaty'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '6',
    id: '6',
    name: 'Ground Chuck',
    description: 'Fresh ground chuck, perfect for burgers and meatballs.',
    price: 600,
    discountedPrice: 500,
    image: undefined,
    images: [{
      _id: 'img6',
      url: 'ground-chuck',
      alt: 'Ground Chuck'
    }],
    category: 'normal',
    subcategory: 'ground',
    rating: 4.3,
    ratings: {
      average: 4.3,
      count: 250
    },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 60
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 17,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['ground', 'burgers', 'versatile'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '7',
    id: '7',
    name: 'Flank Steak',
    description: 'Lean flank steak, great for stir-fries and fajitas.',
    price: 950,
    discountedPrice: 800,
    image: undefined,
    images: [{
      _id: 'img7',
      url: 'flank-steak',
      alt: 'Flank Steak'
    }],
    category: 'normal',
    subcategory: 'steak',
    rating: 4.2,
    ratings: {
      average: 4.2,
      count: 140
    },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 28
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 16,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['lean', 'stir-fry', 'fajitas'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '8',
    id: '8',
    name: 'Skirt Steak',
    description: 'Flavorful skirt steak, perfect for grilling and marinating.',
    price: 880,
    discountedPrice: 720,
    image: undefined,
    images: [{
      _id: 'img8',
      url: 'skirt-steak',
      alt: 'Skirt Steak'
    }],
    category: 'normal',
    subcategory: 'steak',
    rating: 4.1,
    ratings: {
      average: 4.1,
      count: 130
    },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: {
      inStock: true,
      quantity: 32
    },
    weight: {
      value: 1,
      unit: 'kg'
    },
    discount: {
      percentage: 18,
      validUntil: '2024-12-31'
    },
    preparationMethod: 'Fresh',
    tags: ['flavorful', 'grilling', 'marinating'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Mock Cart Data (stored in AsyncStorage)
export const getMockCart = (): Cart => ({
  _id: 'cart_1',
  user: 'user_1',
  items: [],
  totalItems: 0,
  totalAmount: 0,
  subtotal: 0,
  discountAmount: 0,
  finalAmount: 0,
  formattedTotal: '₹0.00',
  appliedCoupon: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    _id: 'addr_1',
    label: 'Home',
    street: '123 Main Street',
    city: 'Kochi',
    state: 'Kerala',
    zipCode: '682030',
    landmark: 'Near Metro Station',
    isDefault: true,
    coordinates: {
      latitude: 9.9312,
      longitude: 76.2673
    }
  }
];

// Mock Coupons
export const mockCoupons: Coupon[] = [
  {
    _id: 'coupon_1',
    code: 'SAVE20',
    description: 'Save 20% on your order',
    type: 'percentage',
    value: 20,
    minimumOrderValue: 1000,
    maximumDiscount: 500,
    formattedDiscount: '20% off',
    validFrom: '2024-01-01T00:00:00.000Z',
    validTo: '2024-12-31T23:59:59.000Z'
  },
  {
    _id: 'coupon_2',
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹2000',
    type: 'fixed',
    value: 500,
    minimumOrderValue: 2000,
    maximumDiscount: 500,
    formattedDiscount: '₹500 off',
    validFrom: '2024-01-01T00:00:00.000Z',
    validTo: '2024-12-31T23:59:59.000Z'
  }
];

// Mock Notifications
export const mockNotifications: NotificationItem[] = [
  {
    _id: 'notif_1',
    id: 'notif_1',
    title: 'Welcome!',
    message: 'Welcome to Sejas Fresh Meat Delivery',
    type: 'welcome',
    category: 'welcome',
    priority: 'high',
    isRead: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'notif_2',
    id: 'notif_2',
    title: 'Special Offer',
    message: 'Get 20% off on all premium cuts this week!',
    type: 'offer',
    category: 'promotion',
    priority: 'medium',
    isRead: false,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Helper function to get product image source
export const getProductImageSource = (product: Product): any => {
  let imageUrl: string | null = null;
  
  // Try images array first (from backend)
  if (product.images && product.images.length > 0) {
    imageUrl = product.images[0]?.url || null;
  }
  
  // Fallback to single image field
  if (!imageUrl && product.image) {
    imageUrl = product.image;
  }
  
  if (imageUrl) {
    // Check if it's already a full URL (from backend)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Ensure HTTPS for Render backend
      const normalizedUrl = imageUrl.replace('http://meat-delivery-backend.onrender.com', 'https://meat-delivery-backend.onrender.com');
      return { uri: normalizedUrl };
    }
    
    // Construct full URL from backend
    try {
      const { getCurrentConfig } = require('../config/api');
      const config = getCurrentConfig();
      const baseUrl = config.API_URL.replace('/api', '');
      
      // Ensure baseUrl uses HTTPS for Render
      const httpsBaseUrl = baseUrl.replace('http://meat-delivery-backend.onrender.com', 'https://meat-delivery-backend.onrender.com');
      
      // Handle different URL formats
      if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
        const cleanPath = imageUrl.replace(/^\/?uploads\//, '');
        return { uri: `${httpsBaseUrl}/uploads/${cleanPath}` };
      } else if (imageUrl.startsWith('/')) {
        return { uri: `${httpsBaseUrl}${imageUrl}` };
      } else {
        return { uri: `${httpsBaseUrl}/uploads/${imageUrl}` };
      }
    } catch (error) {
      // If config fails, fall back to mock image
      console.warn('Failed to get API config, using fallback image:', error);
    }
  }
  
  // Fallback to mock image based on product name
  if (product.name) {
    return getProductImage(product.name);
  }
  
  // Final fallback
  return require('../assets/images/instant-pic.png');
};

// Helper to simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

