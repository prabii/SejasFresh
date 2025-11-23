import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getCurrentConfig } from '../config/api';
import { addressService } from '../services/addressService';
import { Cart, CartItem, cartService } from '../services/cartService';
import { couponService, CouponValidationResponse } from '../services/couponService';
import { Product, productService } from '../services/productService';
import { getProductImageSource } from '../utils/imageUtils';
import CouponSuccessScreen from './CouponSuccessScreen';

const RED_COLOR = '#D13635';
const LIGHT_GRAY = '#f5f5f5';
const GREEN_COLOR = '#4CAF50';

// Delivery Location Component
const DeliveryLocation: React.FC = () => {
  const [userLocation, setUserLocation] = useState<string>('Fetching location...');
  const { user } = useAuth();

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      // First try to get default address from backend
      const defaultAddress = await addressService.getDefaultAddress();
      if (defaultAddress) {
        const { city, zipCode } = defaultAddress;
        let addressString = '';
        if (city && zipCode) addressString = `${city}, ${zipCode}`;
        else if (city) addressString = city;
        else if (zipCode) addressString = zipCode;
        if (addressString) {
          setUserLocation(addressString);
          return;
        }
      }

      // If we have a user in context, use that (fast, avoids AsyncStorage)
      if (user) {
        try {
          let addressString = '';
          if (user.address) {
            if (typeof user.address === 'object') {
              const { city, zipCode } = user.address as any;
              if (city && zipCode) addressString = `${city}, ${zipCode}`;
              else if (city) addressString = city;
              else if (zipCode) addressString = zipCode;
            } else if (typeof user.address === 'string') {
              addressString = user.address;
            }
          } else if ((user as any).location && typeof (user as any).location === 'object') {
            const { city, zipCode } = (user as any).location;
            if (city && zipCode) addressString = `${city}, ${zipCode}`;
            else if (city) addressString = city;
            else if (zipCode) addressString = zipCode;
          }

          setUserLocation(addressString || 'Select Location');
          return;
        } catch (err) {
          console.error('Error extracting address from user context:', err);
        }
      }

      // Fallback: read cached userData from AsyncStorage (non-blocking path already executed)
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          let addressString = '';
          if (parsed.address) {
            if (typeof parsed.address === 'object') {
              const { city, zipCode } = parsed.address;
              if (city && zipCode) addressString = `${city}, ${zipCode}`;
              else if (city) addressString = city;
              else if (zipCode) addressString = zipCode;
            } else if (typeof parsed.address === 'string') {
              addressString = parsed.address;
            }
          }
          setUserLocation(addressString || 'Select Location');
          return;
        }
      } catch (err) {
        console.error('Fallback: error reading userData from AsyncStorage:', err);
      }

      setUserLocation('Select Location');
    } catch (error) {
      console.error('Error loading user location:', error);
      
      // Try fallback to local storage
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.city) {
            setUserLocation(user.city);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback location loading also failed:', fallbackError);
      }
      
      setUserLocation('Select Location');
    }
  };

  const getLocationText = () => {
    // Ensure we always return a string
    return typeof userLocation === 'string' ? userLocation : 'Select Location';
  };

  const handleNotificationPress = () => {
    router.push('/other/notifications');
  };

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="location-sharp" size={20} color="#fff" />
        <View>
          <Text style={styles.locationText}>Current location</Text>
          <Text style={styles.cityText}>
            {getLocationText()}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleNotificationPress}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// Cart Item Card Component
const CartItemCard: React.FC<{ 
  item: CartItem; 
  onUpdateQuantity: (itemId: string, quantity: number) => void; 
  onRemove: (itemId: string) => void; 
  deliveryInfo: string;
}> = ({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  deliveryInfo
}) => {
  const increaseQuantity = () => {
    onUpdateQuantity(item._id, item.quantity + 1);
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item._id);
  };

  // Get image source - use backend image URL or fallback to local
  const getImageSource = () => {
    try {
      return getProductImageSource(item.product || undefined);
    } catch (error) {
      console.error('Error getting image source:', error);
      return require('../assets/images/instant-pic.png');
    }
  };

  // Safety check for item
  if (!item || !item.product) {
    return null;
  }

  return (
    <View style={styles.cartItemCard}>
      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <AntDesign name="close" size={16} color="#999" />
      </TouchableOpacity>
      
      <View style={styles.cartItemContent}>
        <Image 
          source={getImageSource()} 
          style={styles.cartItemImage}
          contentFit="cover"
          placeholder={require('../assets/images/instant-pic.png')}
          transition={200}
          cachePolicy="memory-disk"
        />
        
        <View style={styles.cartItemInfo}>
          <View style={styles.cartItemHeader}>
            <Text style={styles.cartItemName}>{item.product?.name || 'Unknown Product'}</Text>
          </View>
          <View style={styles.freshTagRow}>
            <View style={styles.instantBadge}>
              <Text style={styles.instantText}>Fresh</Text>
            </View>
          </View>
          
          <Text style={styles.productWeight}>
            {item.product?.weight ? `${item.product.weight.value}${item.product.weight.unit}` : '1kg'}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{item.priceAtTime}/{item.product?.weight?.unit || 'kg'}</Text>
            {item.product?.discountedPrice && item.product?.discountedPrice < item.product?.price && (
              <Text style={styles.originalPrice}>₹{item.product?.price}/{item.product?.weight?.unit || 'kg'}</Text>
            )}
          </View>
          
          {item.product?.ratings && (
            <View style={styles.ratingContainer}>
              <AntDesign name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.product.ratings.average}</Text>
              <Text style={styles.ratingCount}>({item.product.ratings.count})</Text>
            </View>
          )}
          
          <Text style={styles.deliveryInfo}>{deliveryInfo}</Text>
          
          <View style={styles.quantityController}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
            >
              <AntDesign name="minus" size={16} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <AntDesign name="plus" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Product Card Component for Suggestions
const ProductCard: React.FC<{ 
  item: Product;
  onAddToCart: (productId: string) => void;
}> = ({ item, onAddToCart }) => {
  const router = useRouter();
  
  const handleAddProduct = () => {
    onAddToCart(item._id);
  };

  const handleProductPress = () => {
    router.push(`/product-detail?id=${item._id || item.id}` as any);
  };

  // Get image source - use backend image URL or fallback to local
  const getImageSource = () => {
    return getProductImageSource(item);
  };

  return (
    <TouchableOpacity 
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={handleProductPress}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={getImageSource()} 
          style={styles.productImage}
          contentFit="cover"
          placeholder={require('../assets/images/instant-pic.png')}
          transition={200}
          cachePolicy="memory-disk"
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={(e) => {
            e.stopPropagation();
            handleAddProduct();
          }}
        >
          <AntDesign name="plus" size={18} color="white" />
        </TouchableOpacity>
        {item.discountedPrice && item.discountedPrice < item.price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>
              {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>
            ₹{item.discountedPrice || item.price}
          </Text>
          {item.discountedPrice && item.discountedPrice < item.price && (
            <Text style={styles.originalProductPrice}>
              ₹{item.price}
            </Text>
          )}
          <Text style={styles.priceUnit}>/kg</Text>
        </View>
        
        <View style={styles.productDetails}>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.ratings?.average || item.rating || 4.5}
            </Text>
            {item.ratings?.count && (
              <Text style={styles.ratingCountText}>
                ({item.ratings.count})
              </Text>
            )}
          </View>
          
          <View style={styles.deliveryContainer}>
            <Ionicons name="time-outline" size={12} color={GREEN_COLOR} />
            <Text style={styles.deliveryText}>
              {item.deliveryTime || '30 min'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Coupon and Summary Component
const CouponAndSummary: React.FC<{ 
  cartItems: CartItem[];
  cart: Cart | null;
  onCouponApplied: () => void;
}> = ({ cartItems, cart, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to Cash on Delivery
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponValidation, setCouponValidation] = useState<CouponValidationResponse | null>(null);
  const [appliedCouponError, setAppliedCouponError] = useState<string | null>(null);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);

  // Helper function to check if coupon is truly applied
  const isCouponApplied = useCallback(() => {
    return cart?.appliedCoupon?.code && cart.appliedCoupon.code.trim() !== '';
  }, [cart?.appliedCoupon]);
  
  const subTotal = cart?.subtotal || cartItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  const deliveryFee = 0; // Free delivery for now
  // Only show discount if coupon is actually applied and has a valid code
  const discountAmount = isCouponApplied() ? (cart?.discountAmount || 0) : 0;
  const total = isCouponApplied() 
    ? (cart?.finalAmount || (subTotal + deliveryFee - discountAmount))
    : (cart?.totalAmount || (subTotal + deliveryFee)); 

  // Reset validation when coupon code changes
  useEffect(() => {
    if (couponCode !== (cart?.appliedCoupon?.code || '')) {
      setCouponValidation(null);
      setAppliedCouponError(null);
    }
  }, [couponCode, cart?.appliedCoupon?.code]);

  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }

    try {
      setIsValidatingCoupon(true);
      setAppliedCouponError(null);

      // First validate the coupon
      const validation = await couponService.validateCoupon(couponCode.trim(), subTotal);
      setCouponValidation(validation);

      // If validation is successful, apply the coupon to cart
      await cartService.applyCoupon(couponCode.trim());
      
      // Refresh the cart data
      onCouponApplied();
      
      // Show success screen
      setShowCouponSuccess(true);
    } catch (error: any) {
      console.error('Error checking coupon:', error);
      setCouponValidation(null);
      setAppliedCouponError(error.message || 'Failed to apply coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setIsValidatingCoupon(true);
      
      // Clear the UI state immediately to provide instant feedback
      setCouponCode('');
      setCouponValidation(null);
      setAppliedCouponError(null);
      
      try {
        await cartService.removeCoupon();
      } catch (error: any) {
        // If we get the toFixed error, it likely means the coupon was removed but there's a backend formatting issue
        if (error.message && error.message.includes('toFixed')) {
          console.log('Coupon likely removed despite formatting error');
        } else {
          // If there's a real error, restore the coupon code only if there was actually a valid coupon
          if (cart?.appliedCoupon?.code) {
            setCouponCode(cart.appliedCoupon.code);
            // Don't clear the validation states on real error
            setCouponValidation(null);
            setAppliedCouponError(null);
          }
          throw error; // Re-throw if it's a different error
        }
      }
      
      // Always refresh the cart to get the updated state
      onCouponApplied();
    } catch (error: any) {
      console.error('Error removing coupon:', error);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Set coupon code only when cart's applied coupon changes
  useEffect(() => {
    if (cart?.appliedCoupon?.code) {
      // Set coupon code if there's an applied coupon
      setCouponCode(cart.appliedCoupon.code);
    }
    // Don't clear input automatically - let user type freely
  }, [cart?.appliedCoupon?.code]);

  return (
    <View style={styles.summaryContainer}>
      {/* Coupon Section */}
      <View style={styles.couponSection}>
        <View style={styles.couponInputContainer}>
          <TextInput
            style={[
              styles.couponInput, 
              isCouponApplied() && styles.couponInputApplied
            ]}
            placeholder="Enter coupon code"
            placeholderTextColor="#999"
            value={couponCode}
            onChangeText={setCouponCode}
            editable={!isCouponApplied()}
          />
          <TouchableOpacity 
            style={[
              styles.checkButton,
              isCouponApplied() ? styles.couponRemoveButton : styles.checkButton,
              isValidatingCoupon && styles.checkButtonDisabled
            ]} 
            onPress={isCouponApplied() ? handleRemoveCoupon : handleCheckCoupon}
            disabled={isValidatingCoupon}
          >
            <Text style={[
              styles.checkButtonText,
              isCouponApplied() && styles.removeButtonText
            ]}>
              {isValidatingCoupon ? 'Wait...' : isCouponApplied() ? 'Remove' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Applied Coupon Success Message */}
        {isCouponApplied() && (
          <View style={styles.couponSuccessContainer}>
            <Ionicons name="checkmark-circle" size={16} color={GREEN_COLOR} />
            <Text style={styles.couponSuccessText}>
              Coupon &ldquo;{cart!.appliedCoupon!.code}&rdquo; applied! You saved ₹{cart!.appliedCoupon!.discount}
            </Text>
          </View>
        )}

        {/* Coupon Error Message */}
        {appliedCouponError && !isCouponApplied() && (
          <View style={styles.couponErrorContainer}>
            <Ionicons name="close-circle" size={16} color="#ff4444" />
            <Text style={styles.couponErrorText}>{appliedCouponError}</Text>
          </View>
        )}

        {/* Coupon Validation Preview (before applying) */}
        {couponValidation && !isCouponApplied() && !appliedCouponError && (
          <View style={styles.couponValidContainer}>
            <Ionicons name="gift" size={16} color={GREEN_COLOR} />
            <Text style={styles.couponValidText}>
              Great! You&apos;ll save ₹{couponValidation.discount} with this coupon
            </Text>
          </View>
        )}
      </View>

      {/* Payment Method Selection */}
      <View style={styles.paymentSection}>
        <Text style={styles.paymentSectionTitle}>Payment Method</Text>
        <TouchableOpacity 
          style={[
            styles.paymentOption, 
            paymentMethod === 'cod' && styles.paymentOptionSelected
          ]}
          onPress={() => setPaymentMethod('cod')}
        >
          <View style={styles.paymentOptionContent}>
            <View style={styles.paymentOptionLeft}>
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color={paymentMethod === 'cod' ? RED_COLOR : '#666'} 
              />
              <View style={styles.paymentOptionText}>
                <Text style={[
                  styles.paymentOptionTitle,
                  paymentMethod === 'cod' && styles.paymentOptionTitleSelected
                ]}>
                  Cash on Delivery
                </Text>
                <Text style={styles.paymentOptionSubtitle}>
                  Pay when you receive your order
                </Text>
              </View>
            </View>
            <View style={[
              styles.radioButton,
              paymentMethod === 'cod' && styles.radioButtonSelected
            ]}>
              {paymentMethod === 'cod' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Future payment options can be added here */}
        <TouchableOpacity 
          style={[styles.paymentOption, styles.paymentOptionDisabled]}
          disabled={true}
        >
          <View style={styles.paymentOptionContent}>
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="card-outline" size={24} color="#ccc" />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitleDisabled}>
                  Online Payment
                </Text>
                <Text style={styles.paymentOptionSubtitle}>
                  Coming soon
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Price Breakdown */}
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Sub Total</Text>
          <Text style={styles.priceValue}>₹{subTotal}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Fee</Text>
          <Text style={[styles.priceValue, deliveryFee === 0 && styles.freeDelivery]}>
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
          </Text>
        </View>

        {/* Show discount if coupon is applied */}
        {isCouponApplied() && discountAmount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Coupon Discount ({cart!.appliedCoupon!.code})
            </Text>
            <Text style={[styles.priceValue, styles.discountValue]}>
              -₹{discountAmount}
            </Text>
          </View>
        )}
        
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
      </View>
      
      {/* Coupon Success Screen */}
      <CouponSuccessScreen
        visible={showCouponSuccess}
        onClose={() => setShowCouponSuccess(false)}
        couponCode={cart?.appliedCoupon?.code}
        discountAmount={cart?.appliedCoupon?.discount || cart?.discountAmount}
      />
    </View>
  );
};

// Main Cart Page Component
const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { refreshCartCount } = useCart();


  // Load cart data on component mount
  useEffect(() => {
    loadCartData();
    loadSuggestedProducts();
  }, []);

  // Always fetch cart from backend when page is focused
  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, [])
  );

  const loadCartData = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      // Ensure cart is set even if it's empty
      if (cartData) {
        setCart(cartData);
      } else {
        // Create empty cart with required fields
        const emptyCart: Cart = {
          _id: '',
          user: '',
          items: [],
          totalItems: 0,
          totalAmount: 0,
          subtotal: 0,
          discountAmount: 0,
          finalAmount: 0,
          formattedTotal: '₹0.00',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCart(emptyCart);
      }
    } catch (error: any) {
      console.error('Error loading cart:', error);
      // Set empty cart on error to prevent blank screen
      const emptyCart: Cart = {
        _id: '',
        user: '',
        items: [],
        totalItems: 0,
        totalAmount: 0,
        subtotal: 0,
        discountAmount: 0,
        finalAmount: 0,
        formattedTotal: '₹0.00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedProducts = async () => {
    try {
      const products = await productService.getSuggestedProducts(4);
      // Ensure we always set an array
      setSuggestedProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error loading suggested products:', error);
      setSuggestedProducts([]); // Set empty array on error
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setUpdating(true);
      const updatedCart = await cartService.updateCartItem(itemId, quantity);
      setCart(updatedCart);
      // Refresh cart count to update the badge
      await refreshCartCount();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(true);
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
      // Refresh cart count to update the badge
      await refreshCartCount();
    } catch (error: any) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(false);
    }
  };

  const clearUnavailableItems = async () => {
    try {
      setUpdating(true);
      
      if (cart) {
        const unavailableItems = cart.items.filter(item => item.product === null);
        const validItems = cart.items.filter(item => item.product !== null);
        
        // If all items are unavailable, use clearCart API for efficiency
        if (validItems.length === 0) {
          await cartService.clearCart();
        } else {
          // Remove only unavailable items
          for (const item of unavailableItems) {
            await cartService.removeFromCart(item._id);
          }
        }
        
        // Reload the cart
        await loadCartData();
      }
    } catch (error: any) {
      console.error('Error clearing unavailable items:', error);
    } finally {
      setUpdating(false);
    }
  };



  const addToCart = async (productId: string) => {
    try {
      setUpdating(true);
      const updatedCart = await cartService.addToCart(productId, 1);
      setCart(updatedCart);
      // Refresh cart count to update the badge
      await refreshCartCount();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleProceed = () => {
    if (cart && cart.totalAmount > 0) {
      // Navigate to address selection screen
      // Cast to any to satisfy expo-router's strict route typing in this project
      router.push('/address-selection' as any);
    }
  };

  // Ensure cart is never null
  const safeCart: Cart = cart || {
    _id: '',
    user: '',
    items: [],
    totalItems: 0,
    totalAmount: 0,
    subtotal: 0,
    discountAmount: 0,
    finalAmount: 0,
    formattedTotal: '₹0.00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={RED_COLOR} />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Location */}
      <DeliveryLocation />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cart Items */}
        <View style={styles.cartItemsSection}>
          {(() => {
            try {
              const validItems = safeCart.items?.filter(item => item && item.product !== null && item.product !== undefined) || [];
              // If all products are normal (category === 'normal'), show 60-90 min, else next day
              const allNormal = validItems.length > 0 && validItems.every(item => item.product?.category === 'normal');
              const deliveryInfo = allNormal
                ? 'Will be delivered in 60-90 min'
                : 'Will be delivered next day';
              return validItems.map(item => (
                <CartItemCard
                  key={item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  deliveryInfo={deliveryInfo}
                />
              ));
            } catch (error) {
              console.error('Error rendering cart items:', error);
              return null;
            }
          })()}
          
          {/* Handle empty cart or all items unavailable */}
          {(!safeCart.items || safeCart.items.length === 0) && (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add some delicious items to get started!</Text>
            </View>
          )}
          
          {/* Handle case when cart has items but all products are null */}
          {safeCart.items && safeCart.items.length > 0 && safeCart.items.every(item => !item.product) && (
            <View style={styles.unavailableCart}>
              <Ionicons name="sad-outline" size={48} color="#ff6b6b" />
              <Text style={styles.unavailableTitle}>All items are unavailable</Text>
              <Text style={styles.unavailableText}>
                The products in your cart are no longer available. 
                {'\n'}Please clear your cart and add fresh items.
              </Text>
              <TouchableOpacity style={styles.clearCartButton} onPress={clearUnavailableItems}>
                <Text style={styles.clearCartButtonText}>Clear Cart</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Show warning if only some items have missing product data */}
          {cart && cart.items.length > 0 && 
           cart.items.some(item => item.product === null) && 
           !cart.items.every(item => item.product === null) && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color="#ff9800" />
              <Text style={styles.warningText}>
                Some items are no longer available and have been hidden.
              </Text>
              <TouchableOpacity onPress={clearUnavailableItems} style={styles.clearUnavailableButton}>
                <Text style={styles.clearUnavailableText}>Remove unavailable items</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Suggested Products */}
        <View style={styles.suggestedSection}>
          <Text style={styles.sectionTitle}>You might also like</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedContainer}
          >
            {Array.isArray(suggestedProducts) && suggestedProducts.map(product => (
              <ProductCard 
                key={product._id || product.id} 
                item={product} 
                onAddToCart={addToCart}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Coupon and Summary - only show if there are valid items */}
        {safeCart.items && safeCart.items.length > 0 && safeCart.items.some(item => item.product !== null) && (
          <CouponAndSummary 
            cartItems={safeCart.items.filter(item => item.product !== null)} 
            cart={safeCart}
            onCouponApplied={loadCartData}
          />
        )}
        
        {/* Proceed Button - only show if there are valid items */}
        {safeCart.items && safeCart.items.length > 0 && safeCart.items.some(item => item.product !== null) && (
          <TouchableOpacity 
            style={styles.proceedButton} 
            onPress={handleProceed}
            disabled={updating}
          >
            <Text style={styles.proceedButtonText}>
              {updating ? 'Updating...' : 'Proceed'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: RED_COLOR,
  },

  locationText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 8,
  },

  cityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    marginTop: 2,
  },

  // Delivery Location Styles
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: LIGHT_GRAY,
  },

  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  changeButton: {
    fontSize: 14,
    color: RED_COLOR,
    fontWeight: '500',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Cart Items Styles
  cartItemsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  cartItemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },

  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },

  cartItemContent: {
    flexDirection: 'row',
  },

  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },

  cartItemInfo: {
    flex: 1,
  },

  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },

  freshTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: -4,
  },

  instantBadge: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },

  instantText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: RED_COLOR,
    marginRight: 10,
  },

  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  deliveryInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },

  quantityController: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  quantityButton: {
    backgroundColor: LIGHT_GRAY,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },

  // Suggested Products Styles
  suggestedSection: {
    paddingTop: 30,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 18,
    letterSpacing: 0.3,
  },

  suggestedContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },

  productCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },

  productImageContainer: {
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: RED_COLOR,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  productInfo: {
    padding: 12,
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    minHeight: 38,
  },

  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: RED_COLOR,
    marginRight: 6,
  },
  originalProductPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3333',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: '600',
  },
  ratingCountText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },

  productWeight: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  ratingStars: {
    flexDirection: 'row',
    marginRight: 5,
  },

  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryText: {
    fontSize: 12,
    color: GREEN_COLOR,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Summary Styles
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  couponSection: {
    marginBottom: 20,
  },

  couponInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  couponInput: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },

  couponInputApplied: {
    backgroundColor: '#f0f9f0',
    borderWidth: 1,
    borderColor: GREEN_COLOR,
  },

  checkButton: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },

  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  checkButtonDisabled: {
    opacity: 0.6,
  },

  couponRemoveButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },

  removeButtonText: {
    color: 'white',
  },

  // Coupon Status Messages
  couponSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    borderColor: GREEN_COLOR,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  couponSuccessText: {
    fontSize: 14,
    color: GREEN_COLOR,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  couponErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  couponErrorText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },

  couponValidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    borderColor: GREEN_COLOR,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  couponValidText: {
    fontSize: 14,
    color: GREEN_COLOR,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  priceBreakdown: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginBottom: 0,
  },

  priceLabel: {
    fontSize: 16,
    color: '#333',
  },

  priceValue: {
    fontSize: 16,
    color: '#333',
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RED_COLOR,
  },

  // Proceed Button Styles
  proceedButton: {
    backgroundColor: RED_COLOR,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },

  proceedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Loading Styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  // Empty Cart Styles
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyCartText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Warning Styles
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 10,
  },

  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },

  // Enhanced Empty Cart Styles
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },

  // Unavailable Cart Styles
  unavailableCart: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff5f5',
    borderColor: '#ffebee',
    borderWidth: 1,
    borderRadius: 12,
    margin: 10,
  },

  unavailableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 16,
    marginBottom: 8,
  },

  unavailableText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  clearCartButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  clearCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Clear Unavailable Button Styles
  clearUnavailableButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff9800',
    marginLeft: 10,
  },

  clearUnavailableText: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: '600',
  },

  // Payment Method Styles
  paymentSection: {
    marginBottom: 20,
  },

  paymentSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  paymentOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  paymentOptionSelected: {
    borderColor: RED_COLOR,
    backgroundColor: '#fef5f5',
  },

  paymentOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#f8f8f8',
  },

  paymentOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  paymentOptionText: {
    marginLeft: 15,
    flex: 1,
  },

  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },

  paymentOptionTitleSelected: {
    color: RED_COLOR,
  },

  paymentOptionTitleDisabled: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 2,
  },

  paymentOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioButtonSelected: {
    borderColor: RED_COLOR,
  },

  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED_COLOR,
  },

  freeDelivery: {
    color: GREEN_COLOR,
    fontWeight: 'bold',
  },

  discountValue: {
    color: GREEN_COLOR,
    fontWeight: 'bold',
  },
});

export default CartPage;