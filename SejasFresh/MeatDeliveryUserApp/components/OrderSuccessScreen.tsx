import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useCart } from '../contexts/CartContext';
import { Order } from '../services/orderService';
import { getCurrentConfig } from '../config/api';

const RED_COLOR = '#D13635';
const GREEN_COLOR = '#4CAF50';
const LIGHT_GRAY = '#f5f5f5';

interface OrderSuccessScreenProps {
  order?: Order;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ order: propOrder }) => {
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(propOrder || null);
  const [loading, setLoading] = useState(!propOrder);
  const { refreshCartCount } = useCart();

  useEffect(() => {
    // If order data is passed as params (serialized), parse it
    if (params.orderData && typeof params.orderData === 'string') {
      try {
        const parsedOrder = JSON.parse(params.orderData as string);
        setOrder(parsedOrder);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing order data:', error);
        setLoading(false);
      }
    }
    // Always clear cart count after order success
    refreshCartCount();
  }, [params.orderData, refreshCartCount]);

  const handleExploreMore = () => {
    router.replace('/(tabs)');
  };

  const handleTrackOrder = () => {
    if (order?._id) {
      router.push({
        pathname: '/order-tracking',
        params: { orderId: order._id }
      } as any);
    } else {
      router.push('/orders');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED_COLOR} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorText}>
            We couldn&apos;t load your order details. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleExploreMore}>
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={GREEN_COLOR} />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your order #{order.orderNumber} has been confirmed
          </Text>
          <Text style={styles.successSubtitle}>
            Thank you for your order. We&apos;ll start preparing your fresh meat right away.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount:</Text>
              <Text style={styles.infoValue}>₹{order.pricing.total}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>Cash on Delivery</Text>
            </View>

          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => {
            // Get product image URL
            const getProductImage = () => {
              if (!item.product) return null;
              
              let imageUrl: string | null = null;
              
              // Try images array first
              if (item.product.images && item.product.images.length > 0) {
                imageUrl = item.product.images[0]?.url;
              } 
              // Fallback to single image field
              else if ((item.product as any).image) {
                imageUrl = (item.product as any).image;
              }
              
              if (!imageUrl) return null;
              
              // If already a full URL, return as is
              if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                return { uri: imageUrl };
              }
              
              // Otherwise, construct full URL
              const config = getCurrentConfig();
              const baseUrl = config.API_URL.replace('/api', '');
              
              // Handle different URL formats
              if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
                return { uri: `${baseUrl}/uploads/${imageUrl.replace(/^\/?uploads\//, '')}` };
              } else if (imageUrl.startsWith('/')) {
                return { uri: `${baseUrl}${imageUrl}` };
              } else {
                return { uri: `${baseUrl}/uploads/${imageUrl}` };
              }
            };
            
            const imageSource = getProductImage();
            
            return (
              <View key={item._id || item.product?._id || `item-${index}`} style={styles.itemRow}>
                <View style={styles.itemImageContainer}>
                  {imageSource ? (
                    <Image 
                      source={imageSource} 
                      style={styles.itemImage}
                      contentFit="cover"
                      placeholder={require('../assets/images/instant-pic.png')}
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Image
                      source={require('../assets/images/instant-pic.png')}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                  )}
                </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product?.name || 'Unknown Product'}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  Quantity: {item.quantity} × {item.product?.weight?.value || 1}{item.product?.weight?.unit || 'kg'}
                </Text>
                <Text style={styles.itemPrice}>
                  ₹{item.priceAtTime || 0} × {item.quantity} = ₹{((item.priceAtTime || 0) * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
            );
          })}
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.addressCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressContent}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.addressText}>
                {order.deliveryAddress.street && (
                  <Text style={styles.addressLine}>
                    {order.deliveryAddress.street}
                  </Text>
                )}
                {order.deliveryAddress.landmark && (
                  <Text style={styles.addressLine}>
                    Near {order.deliveryAddress.landmark}
                  </Text>
                )}
                <Text style={styles.addressLine}>
                  {[
                    order.deliveryAddress.city,
                    order.deliveryAddress.state,
                    order.deliveryAddress.zipCode
                  ].filter(Boolean).join(', ')}
                </Text>
                {order.deliveryAddress.country && (
                  <Text style={styles.addressLine}>
                    {order.deliveryAddress.country}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Pricing Breakdown */}
        <View style={styles.pricingCard}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Subtotal:</Text>
            <Text style={styles.pricingValue}>₹{order.pricing.subtotal}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Delivery Fee:</Text>
            <Text style={styles.pricingValue}>
              {order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}
            </Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Tax:</Text>
            <Text style={styles.pricingValue}>₹{order.pricing.tax}</Text>
          </View>

          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{order.pricing.total}</Text>
          </View>
        </View>

        {/* Thank You Message */}
        <View style={styles.thankYouCard}>
          <Text style={styles.thankYouTitle}>Thank You for Choosing Us!</Text>
          <Text style={styles.thankYouText}>
            We&apos;re committed to delivering the freshest, highest-quality meat to your doorstep. 
            Your order is being prepared with care and will be delivered soon.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.exploreButton} onPress={handleExploreMore}>
          <Text style={styles.exploreButtonText}>Explore More</Text>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Content Styles
  content: {
    flex: 1,
  },

  // Success Header
  successHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: LIGHT_GRAY,
  },

  successIconContainer: {
    marginBottom: 20,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },

  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Card Styles
  orderCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  statusBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },

  orderInfo: {
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 16,
    color: '#666',
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Items Card
  itemsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  itemRow: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  itemImageContainer: {
    marginRight: 15,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: RED_COLOR,
  },

  // Address Card
  addressCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  addressText: {
    flex: 1,
    marginLeft: 12,
  },

  addressLine: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 2,
  },

  // Pricing Card
  pricingCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },

  pricingValue: {
    fontSize: 14,
    color: '#333',
  },

  discountValue: {
    color: GREEN_COLOR,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginTop: 10,
    marginBottom: 0,
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

  // Thank You Card
  thankYouCard: {
    backgroundColor: LIGHT_GRAY,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },

  thankYouTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },

  thankYouText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },

  button: {
    backgroundColor: RED_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  trackButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: RED_COLOR,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },

  trackButtonText: {
    color: RED_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },

  exploreButton: {
    flex: 1,
    backgroundColor: RED_COLOR,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },

  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderSuccessScreen;