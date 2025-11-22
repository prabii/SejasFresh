// Delivery service utilities and pincode validation

// Allowed pincodes for delivery
export const ALLOWED_PINCODES = [
  '682030',
  '682304', 
  '682013',
  '682028'
];

// Product categories and their delivery details
export enum ProductCategory {
  NORMAL = 'normal',
  PREMIUM = 'premium'
}

export interface DeliveryInfo {
  category: ProductCategory;
  estimatedTime: string;
  description: string;
  nextAvailableSlot?: string;
}

/**
 * Check if a pincode is in the serviceable area
 */
export const isServiceablePincode = (pincode: string): boolean => {
  const cleanPincode = pincode.replace(/\s+/g, '').trim();
  return ALLOWED_PINCODES.includes(cleanPincode);
};

/**
 * Get delivery information for a product category
 */
export const getDeliveryInfo = (category: ProductCategory): DeliveryInfo => {
  const now = new Date();
  
  switch (category) {
    case ProductCategory.NORMAL:
      return {
        category: ProductCategory.NORMAL,
        estimatedTime: '60-90 minutes',
        description: 'Same day delivery within 60-90 minutes'
      };
    
    case ProductCategory.PREMIUM:
      // Calculate next day 6 AM
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(6, 0, 0, 0);
      
      return {
        category: ProductCategory.PREMIUM,
        estimatedTime: 'Next day by 6:00 AM',
        description: 'Premium cuts delivered fresh next morning',
        nextAvailableSlot: nextDay.toISOString()
      };
    
    default:
      return {
        category: ProductCategory.NORMAL,
        estimatedTime: '60-90 minutes',
        description: 'Standard delivery'
      };
  }
};

/**
 * Validate address pincode for serviceability
 */
export const validateAddressPincode = (pincode: string): {
  isValid: boolean;
  message: string;
} => {
  if (!pincode) {
    return {
      isValid: false,
      message: 'Pincode is required'
    };
  }

  const cleanPincode = pincode.replace(/\s+/g, '').trim();
  
  if (cleanPincode.length !== 6) {
    return {
      isValid: false,
      message: 'Pincode must be exactly 6 digits'
    };
  }

  if (!/^\d{6}$/.test(cleanPincode)) {
    return {
      isValid: false,
      message: 'Pincode must contain only numbers'
    };
  }

  if (!isServiceablePincode(cleanPincode)) {
    return {
      isValid: false,
      message: `Sorry, we currently don't deliver to pincode ${cleanPincode}. We serve: ${ALLOWED_PINCODES.join(', ')}`
    };
  }

  return {
    isValid: true,
    message: 'Pincode is serviceable'
  };
};

/**
 * Get formatted delivery message for cart/checkout
 */
export const getDeliveryMessage = (category: ProductCategory, pincode?: string): string => {
  const deliveryInfo = getDeliveryInfo(category);
  
  if (pincode && !isServiceablePincode(pincode)) {
    return `Sorry, we don't deliver to pincode ${pincode}`;
  }

  switch (category) {
    case ProductCategory.NORMAL:
      return `🚚 Fast delivery in ${deliveryInfo.estimatedTime}`;
    
    case ProductCategory.PREMIUM:
      return `🥩 Premium delivery ${deliveryInfo.estimatedTime}`;
    
    default:
      return `📦 Delivery in ${deliveryInfo.estimatedTime}`;
  }
};

/**
 * Check if current time allows for same-day normal delivery
 */
export const canDeliverSameDay = (): boolean => {
  const now = new Date();
  const cutoffHour = 22; // 10 PM cutoff for same day delivery
  
  return now.getHours() < cutoffHour;
};

/**
 * Get next available delivery slot for a category
 */
export const getNextDeliverySlot = (category: ProductCategory): Date => {
  const now = new Date();
  
  switch (category) {
    case ProductCategory.NORMAL:
      if (canDeliverSameDay()) {
        // Add 60-90 minutes to current time
        const deliveryTime = new Date(now);
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 75); // Average of 60-90
        return deliveryTime;
      } else {
        // Next day morning
        const nextDay = new Date(now);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(9, 0, 0, 0);
        return nextDay;
      }
    
    case ProductCategory.PREMIUM:
      // Always next day 6 AM
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(6, 0, 0, 0);
      return nextDay;
    
    default:
      return new Date(now.getTime() + 75 * 60 * 1000); // 75 minutes from now
  }
};