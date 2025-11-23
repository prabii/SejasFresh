import { getCurrentConfig } from '../config/api';
import { Product } from '../services/productService';

/**
 * Normalize image URL to ensure HTTPS for Render backend
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // If already a full HTTPS URL, return as is
  if (imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Convert HTTP to HTTPS for Render backend
  if (imageUrl.startsWith('http://meat-delivery-backend.onrender.com')) {
    return imageUrl.replace('http://', 'https://');
  }
  
  // If already a full HTTP URL, convert to HTTPS
  if (imageUrl.startsWith('http://')) {
    // Check if it's Render backend
    if (imageUrl.includes('meat-delivery-backend.onrender.com')) {
      return imageUrl.replace('http://', 'https://');
    }
    return imageUrl;
  }
  
  // Construct full URL from backend config
  try {
    const config = getCurrentConfig();
    const baseUrl = config.API_URL.replace('/api', '');
    
    // Ensure baseUrl uses HTTPS for Render
    const httpsBaseUrl = baseUrl.replace('http://meat-delivery-backend.onrender.com', 'https://meat-delivery-backend.onrender.com');
    
    // Handle different URL formats
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
      const cleanPath = imageUrl.replace(/^\/?uploads\//, '');
      return `${httpsBaseUrl}/uploads/${cleanPath}`;
    } else if (imageUrl.startsWith('/')) {
      return `${httpsBaseUrl}${imageUrl}`;
    } else {
      return `${httpsBaseUrl}/uploads/${imageUrl}`;
    }
  } catch (error) {
    console.warn('Failed to normalize image URL:', error);
    return null;
  }
};

/**
 * Get product image source with proper URL handling
 */
export const getProductImageSource = (product?: Product, productName?: string, fallbackImage?: any): any => {
  let imageUrl: string | null = null;
  
  // Try images array first (from backend)
  if (product?.images && product.images.length > 0) {
    imageUrl = product.images[0]?.url || null;
  }
  
  // Fallback to single image field
  if (!imageUrl && product?.image) {
    imageUrl = product.image;
  }
  
  // Normalize and return image URL
  if (imageUrl) {
    const normalizedUrl = normalizeImageUrl(imageUrl);
    if (normalizedUrl) {
      return { uri: normalizedUrl };
    }
  }
  
  // Return fallback image if provided
  if (fallbackImage) {
    return fallbackImage;
  }
  
  // Final fallback
  return require('../assets/images/instant-pic.png');
};

/**
 * Get product images array with proper URL handling
 */
export const getProductImages = (product?: Product): any[] => {
  if (!product) {
    return [require('../assets/images/instant-pic.png')];
  }
  
  const images: any[] = [];
  
  // Try images array first
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      const normalizedUrl = normalizeImageUrl(img.url);
      if (normalizedUrl) {
        images.push({ uri: normalizedUrl });
      }
    });
  }
  
  // Fallback to single image field
  if (images.length === 0 && product.image) {
    const normalizedUrl = normalizeImageUrl(product.image);
    if (normalizedUrl) {
      images.push({ uri: normalizedUrl });
    }
  }
  
  // If no images found, return fallback
  if (images.length === 0) {
    return [require('../assets/images/instant-pic.png')];
  }
  
  return images;
};

