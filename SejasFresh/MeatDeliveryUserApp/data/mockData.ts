// Mock data for offline/development use
// This replaces all API calls with local data

import { Product } from '../services/productService';
import { Cart, CartItem } from '../services/cartService';
import { Order } from '../services/orderService';
import { Address } from '../services/addressService';
import { Coupon } from '../services/couponService';
import { NotificationItem } from '../services/notificationService';

// Image mapping - maps product names to images from assets/images/uploads/
// Using actual product images from the uploads folder
// Note: React Native requires explicit require() statements - cannot use dynamic paths
export const getProductImage = (productName: string): any => {
  const lowerName = productName.toLowerCase();
  
  // Premium Cuts
  if (lowerName.includes('tenderloin') || lowerName.includes('tender')) {
    try {
      return require('../assets/images/uploads/Tenderloin.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/tender lion.webp');
      } catch {
        // Fall through
      }
    }
  }
  
  if (lowerName.includes('ribeye') || lowerName.includes('rib eye')) {
    try {
      return require('../assets/images/uploads/Ribeye.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/ribeye steak.jpeg');
      } catch {
        // Fall through
      }
    }
  }
  
  // Normal Products
  if (lowerName.includes('boti')) {
    try {
      return require('../assets/images/uploads/Boti.jpg');
    } catch {}
  }
  
  if (lowerName.includes('brisket')) {
    try {
      return require('../assets/images/uploads/Beef-brisket.jpg');
    } catch {}
  }
  
  if (lowerName.includes('short rib')) {
    try {
      return require('../assets/images/uploads/short ribs.jpeg');
    } catch {
      try {
        return require('../assets/images/uploads/short rib.webp');
      } catch {}
    }
  }
  
  if (lowerName === 'chuck' || (lowerName.includes('chuck') && !lowerName.includes('ground'))) {
    // Just "Chuck" - use ground chuck image
    try {
      return require('../assets/images/uploads/ground-chuck.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/ground chuck.avif');
      } catch {}
    }
  }
  
  if (lowerName.includes('ground chuck') || lowerName.includes('ground')) {
    try {
      return require('../assets/images/uploads/ground-chuck.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/ground chuck.avif');
      } catch {}
    }
  }
  
  if (lowerName.includes('flank')) {
    try {
      return require('../assets/images/uploads/Flank Steak.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('skirt')) {
    try {
      return require('../assets/images/uploads/Skirt steak.jpeg');
    } catch {}
  }
  
  // Additional products
  if (lowerName.includes('top round')) {
    try {
      return require('../assets/images/uploads/top round.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('bottom round')) {
    try {
      return require('../assets/images/uploads/bottom round.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('loin') && !lowerName.includes('short') && !lowerName.includes('long')) {
    // Just "Loin" - use short loin as default
    try {
      return require('../assets/images/uploads/short loin.jpeg');
    } catch {
      try {
        return require('../assets/images/uploads/long loin.jpeg');
      } catch {}
    }
  }
  
  if (lowerName.includes('short loin')) {
    try {
      return require('../assets/images/uploads/short loin.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('long loin')) {
    try {
      return require('../assets/images/uploads/long loin.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('rib roast')) {
    try {
      return require('../assets/images/uploads/rib roast.jpg');
    } catch {}
  }
  
  if (lowerName.includes('rump roast')) {
    try {
      return require('../assets/images/uploads/rump roast.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/rump roast.jpeg');
      } catch {}
    }
  }
  
  if (lowerName.includes('shoulder')) {
    try {
      return require('../assets/images/uploads/shoulder steak.jpeg');
    } catch {
      try {
        return require('../assets/images/uploads/raw-shoulder-steak.jpg');
      } catch {}
    }
  }
  
  if (lowerName.includes('shank')) {
    try {
      return require('../assets/images/uploads/shank.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('liver')) {
    try {
      return require('../assets/images/uploads/Liver.jpg');
    } catch {}
  }
  
  if (lowerName.includes('buffalo liver')) {
    try {
      return require('../assets/images/uploads/Liver.jpg');
    } catch {}
  }
  
  if (lowerName.includes('buffalo brain') || lowerName.includes('brain')) {
    try {
      return require('../assets/images/uploads/Liver.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/heart.jpg');
      } catch {}
    }
  }
  
  if (lowerName.includes('heart')) {
    try {
      return require('../assets/images/uploads/heart.jpg');
    } catch {}
  }
  
  if (lowerName.includes('kidney')) {
    try {
      return require('../assets/images/uploads/kidney.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('tripe')) {
    try {
      return require('../assets/images/uploads/Tripe.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('tongue')) {
    try {
      return require('../assets/images/uploads/Toungue.jpeg');
    } catch {}
  }
  
  if (lowerName.includes('back rib')) {
    try {
      return require('../assets/images/uploads/back ribs.jpg');
    } catch {}
  }
  
  // Beef products - use various beef images
  if (lowerName === 'beef') {
    try {
      return require('../assets/images/uploads/Beef-brisket.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/Boti.jpg');
      } catch {
        try {
          return require('../assets/images/uploads/Ribeye.jpg');
        } catch {}
      }
    }
  }
  
  // Category page specific products
  if (lowerName.includes('boneless')) {
    try {
      return require('../assets/images/uploads/Tenderloin.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/Ribeye.jpg');
      } catch {}
    }
  }
  
  if (lowerName.includes('with bone') || lowerName.includes('withbone')) {
    try {
      return require('../assets/images/uploads/short ribs.jpeg');
    } catch {
      try {
        return require('../assets/images/uploads/back ribs.jpg');
      } catch {}
    }
  }
  
  if (lowerName.includes('kappam')) {
    try {
      return require('../assets/images/uploads/Ribeye.jpg');
    } catch {
      try {
        return require('../assets/images/uploads/Beef-brisket.jpg');
      } catch {}
    }
  }
  
  if (lowerName.includes('flat iron')) {
    try {
      return require('../assets/images/uploads/Flank Steak.jpeg');
    } catch {
      try {
        return require('../assets/images/uploads/Ribeye.jpg');
      } catch {}
    }
  }
  
  if (lowerName.includes('sirloin') || lowerName.includes('strip')) {
    try {
      return require('../assets/images/uploads/short loin.jpeg');
    } catch {
      try {
        return require('../assets/images/uploads/long loin.jpeg');
      } catch {}
    }
  }
  
  // Fallback to placeholder
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

