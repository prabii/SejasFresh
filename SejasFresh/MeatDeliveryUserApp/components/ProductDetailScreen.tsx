import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { cartService } from '../services/cartService';
import { Product, productService } from '../services/productService';
import { useToast } from './ui/ToastProvider';
import { getProductImageSource } from '../data/mockData';

const { width: screenWidth } = Dimensions.get('window');
const RED_COLOR = '#D13635';
const LIGHT_RED = '#FFF1F1';
const GREEN_COLOR = '#4CAF50';

const ProductDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id: productId } = useLocalSearchParams<{ id: string }>();
  const { refreshCartCount, cartItemCount } = useCart();
  const { unreadCount } = useNotificationContext();
  const { showSuccess, showError } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleCartPress = () => {
    router.push('/(tabs)/cart' as any);
  };

  const handleNotificationPress = () => {
    router.push('/other/notifications' as any);
  };

  // Load product details
  const loadProduct = useCallback(async () => {
    if (!productId) {
      setError('Product ID not provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const productData = await productService.getProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Handle quantity changes
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.availability?.quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      
      await cartService.addToCart(product._id || product.id, quantity);
      await refreshCartCount();
      showSuccess(`${quantity}x ${product.name} added to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId, loadProduct]);

  // Refresh cart count when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshCartCount();
    }, [refreshCartCount])
  );

  // Get product images
  const getProductImages = (product: Product): any[] => {
    if (product.images && product.images.length > 0) {
      return product.images.map(img => img.url);
    }
    if (product.image) {
      return [product.image];
    }
    return [getProductImageSource(product)];
  };

  // Format review count
  const formatReviewCount = (count: number): string => {
    if (count >= 2000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  // Get weight unit
  const getWeightUnit = (): string => {
    if (product?.weight) {
      return `/${product.weight.value}${product.weight.unit === 'kg' ? '00g' : product.weight.unit}`;
    }
    return '/500g';
  };

  // Calculate total price
  const getTotalPrice = (): number => {
    if (!product) return 0;
    const price = product.discountedPrice || product.price;
    return price * quantity;
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
              <View style={styles.cartIconContainer}>
                <Ionicons name="cart" size={24} color="#fff" />
                {cartItemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED_COLOR} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
              <View style={styles.cartIconContainer}>
                <Ionicons name="cart" size={24} color="#fff" />
                {cartItemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={RED_COLOR} />
          <Text style={styles.errorTitle}>Failed to Load Product</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = getProductImages(product);
  const isPremium = product.category === 'premium';
  const finalPrice = product.discountedPrice || product.price;
  const rating = product.ratings?.average || product.rating || 4.9;
  const reviewCount = product.ratings?.count || 2000;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <Ionicons name="cart" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={images[selectedImageIndex] || getProductImageSource(product)}
            style={styles.productImage}
            contentFit="cover"
            placeholder={require('../assets/images/instant-pic.png')}
            transition={200}
            cachePolicy="memory-disk"
          />
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Premium Cut Label */}
          {isPremium && (
            <Text style={styles.premiumLabel}>Premium Cut</Text>
          )}

          {/* Product Name with Quantity Selector */}
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <MaterialIcons 
                  name="remove" 
                  size={20} 
                  color={quantity <= 1 ? '#ccc' : '#333'} 
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= (product.availability?.quantity || 10)}
              >
                <MaterialIcons 
                  name="add" 
                  size={20} 
                  color={quantity >= (product.availability?.quantity || 10) ? '#ccc' : '#333'} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{finalPrice}</Text>
            <Text style={styles.weightUnit}>{getWeightUnit()}</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            {/* Delivery Card */}
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color={GREEN_COLOR} />
              <Text style={styles.infoValueGreen}>30 min</Text>
              <Text style={styles.infoLabel}>Delivery</Text>
            </View>

            {/* Reviews Card */}
            <View style={styles.infoCard}>
              <Ionicons name="chatbubble-outline" size={20} color="#1a1a1a" />
              <Text style={styles.infoValue}>{formatReviewCount(reviewCount)}</Text>
              <Text style={styles.infoLabel}>Reviews</Text>
            </View>

            {/* Rating Card */}
            <View style={styles.infoCard}>
              <Ionicons name="star" size={20} color="#1a1a1a" />
              <Text style={styles.infoValue}>{rating.toFixed(1)}</Text>
              <Text style={styles.infoLabel}>Rating</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPrice}>₹{getTotalPrice()}</Text>
          <Text style={styles.bottomPriceUnit}>
            {getWeightUnit()} x{quantity}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, addingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart || !product.availability?.inStock}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.addToCartText}>Add to cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: RED_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3333',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartButton: {
    width: 40,
    height: 40,
    backgroundColor: RED_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF3333',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: screenWidth,
    height: screenWidth * 0.9, // 90% of screen width for better visibility
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: RED_COLOR,
  },
  productInfo: {
    padding: 20,
  },
  premiumLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: RED_COLOR,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  weightUnit: {
    fontSize: 16,
    color: '#666',
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: LIGHT_RED,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValueGreen: {
    fontSize: 16,
    fontWeight: 'bold',
    color: GREEN_COLOR,
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bottomPriceUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 140,
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 50,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
