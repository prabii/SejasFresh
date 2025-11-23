import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, orderService } from '../services/orderService';
import { getCurrentConfig } from '../config/api';

// Color constants
const PRIMARY_RED = '#D32F2F';
const GREEN_COLOR = '#2E7D32';
const YELLOW_COLOR = '#F9A825';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
const LIGHT_PINK = '#FFF1F1';

const OrderDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { orderData } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Parse initial order data from params
  useEffect(() => {
    let initialOrder: Order | null = null;
    try {
      if (orderData) {
        if (typeof orderData === 'string') {
          initialOrder = JSON.parse(orderData);
        } else if (typeof orderData === 'object' && !Array.isArray(orderData)) {
          initialOrder = orderData as Order;
        }
      }
    } catch (error) {
      console.error('Error parsing order data:', error);
    }
    setOrder(initialOrder);
  }, [orderData]);

  // Real-time order status updates (polling every 10 seconds)
  useEffect(() => {
    if (!order?._id) return;

    const fetchOrderStatus = async () => {
      try {
        const response = await orderService.getOrderById(order._id);
        if (response.success && response.data) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
      }
    };

    // Fetch immediately
    fetchOrderStatus();

    // Set up polling interval (every 10 seconds)
    const interval = setInterval(fetchOrderStatus, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [order?._id]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (!order?._id) return;
    setIsRefreshing(true);
    try {
      const response = await orderService.getOrderById(order._id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error refreshing order:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    if (!order) return;

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      Alert.alert(
        'Cannot Cancel',
        `This order cannot be cancelled because it is already ${order.status}.`
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${order.orderNumber}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await orderService.cancelOrder(order._id, 'Cancelled by customer');
              
              // Refresh order to get updated status
              const response = await orderService.getOrderById(order._id);
              if (response.success && response.data) {
                setOrder(response.data);
              }
              
              Alert.alert('Success', 'Order has been cancelled successfully.');
            } catch (error: any) {
              console.error('Error cancelling order:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to cancel order. Please try again.'
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'paid':
        return GREEN_COLOR;
      case 'cancelled':
      case 'failed':
      case 'refunded':
        return PRIMARY_RED;
      case 'pending':
        return YELLOW_COLOR;
      default:
        return DARK_GRAY;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string): keyof typeof MaterialIcons.glyphMap => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      case 'pending':
        return 'schedule';
      case 'confirmed':
        return 'check';
      case 'preparing':
        return 'restaurant';
      case 'out-for-delivery':
        return 'local-shipping';
      default:
        return 'info';
    }
  };

  // Get status display text
  const getStatusDisplayText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get delivery status message
  const getDeliveryStatusMessage = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Your order is being processed. We will confirm it shortly.';
      case 'confirmed':
        return 'Your order has been confirmed and is being prepared.';
      case 'preparing':
        return 'Your order is being prepared. It will be ready for delivery soon.';
      case 'out-for-delivery':
        return 'Your order is on the way! Our delivery partner will reach you shortly.';
      case 'delivered':
        return 'Your order has been delivered successfully. Thank you for your order!';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return 'Tracking your order status...';
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency with null check
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${amount.toFixed(2)}`;
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render order item
  const renderOrderItem = ({ item }: { item: Order['items'][0] }) => {
    // Get product image with proper URL construction
    const getProductImage = () => {
      const { getProductImageSource } = require('../utils/imageUtils');
      // Try item.image first (from order creation)
      if ((item as any).image) {
        const { normalizeImageUrl } = require('../utils/imageUtils');
        const normalizedUrl = normalizeImageUrl((item as any).image);
        if (normalizedUrl) {
          return { uri: normalizedUrl };
        }
      }
      return getProductImageSource(item.product);
    };

    return (
      <View style={styles.orderItemCard}>
        <Image 
          source={getProductImage()}
          style={styles.itemImage} 
          resizeMode="cover" 
          defaultSource={require('../assets/images/instant-pic.png')}
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.product?.description || 'No description'}
          </Text>
          {item.product?.weight && (
            <Text style={styles.itemWeight}>
              Weight: {item.product.weight.value}{item.product.weight.unit}
            </Text>
          )}
          <View style={styles.itemPricing}>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.priceAtTime || item.product?.price || 0)}
            </Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity || 0}</Text>
          </View>
          <Text style={styles.itemSubtotal}>
            Subtotal: {formatCurrency(item.subtotal || (item.priceAtTime || item.product?.price || 0) * (item.quantity || 0))}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.backButtonNav} onPress={handleBack}>
          <AntDesign name="left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.navigationTitle}>Order Details</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButtonNav} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY_RED}
          />
        }
      >
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          {isRefreshing && (
            <View style={styles.refreshingIndicator}>
              <ActivityIndicator size="small" color={PRIMARY_RED} />
              <Text style={styles.refreshingText}>Updating status...</Text>
            </View>
          )}
          <View style={styles.statusHeader}>
            <MaterialIcons 
              name={getStatusIcon(order.status)} 
              size={24} 
              color={getStatusColor(order.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusDisplayText(order.status)}
            </Text>
          </View>
          
          <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>
            Placed on {formatDate(order.createdAt)}
          </Text>
          <Text style={styles.orderTotal}>
            Total: {order.formattedTotal || formatCurrency(order.pricing?.total || 0)}
          </Text>
          
          {/* Delivery Status Message */}
          {order.status && (
            <View style={styles.deliveryStatusContainer}>
              <Text style={styles.deliveryStatusText}>
                {getDeliveryStatusMessage(order.status)}
              </Text>
            </View>
          )}

          {/* Cancel Order Button */}
          {order.status !== 'delivered' && 
           order.status !== 'cancelled' && 
           order.status !== 'out-for-delivery' && (
            <TouchableOpacity
              style={[styles.cancelOrderButton, isCancelling && styles.cancelOrderButtonDisabled]}
              onPress={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Agent Information */}
        {order.assignedTo && (order.status === 'out-for-delivery' || order.status === 'delivered') && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {order.status === 'delivered' ? 'Delivered By' : 'Delivery Agent'}
            </Text>
            <View style={styles.deliveryAgentContainer}>
              <View style={styles.deliveryAgentInfo}>
                <Text style={styles.deliveryAgentName}>
                  {order.assignedTo.firstName} {order.assignedTo.lastName}
                </Text>
                <Text style={styles.deliveryAgentPhone}>{order.assignedTo.phone}</Text>
              </View>
              {order.status === 'out-for-delivery' && (
                <TouchableOpacity
                  style={styles.callAgentButton}
                  onPress={() => {
                    Linking.openURL(`tel:${order.assignedTo?.phone || ''}`);
                  }}
                >
                  <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Customer Information */}
        {order.customer && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <Text style={styles.customerName}>{order.customer.fullName || `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()}</Text>
            {order.customer.email && (
              <Text style={styles.customerDetail}>{order.customer.email}</Text>
            )}
            {order.customer.phone && (
              <Text style={styles.customerDetail}>{order.customer.phone}</Text>
            )}
          </View>
        )}

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            {order.deliveryAddress.street && (
              <Text style={styles.addressText}>
                {order.deliveryAddress.street}
                {order.deliveryAddress.landmark && `, ${order.deliveryAddress.landmark}`}
              </Text>
            )}
            {(order.deliveryAddress.city || order.deliveryAddress.state) && (
              <Text style={styles.addressText}>
                {order.deliveryAddress.city || ''}{order.deliveryAddress.city && order.deliveryAddress.state ? ', ' : ''}{order.deliveryAddress.state || ''}
              </Text>
            )}
            {(order.deliveryAddress.zipCode || order.deliveryAddress.country) && (
              <Text style={styles.addressText}>
                {order.deliveryAddress.zipCode || ''}{order.deliveryAddress.zipCode && order.deliveryAddress.country ? ', ' : ''}{order.deliveryAddress.country || 'India'}
              </Text>
            )}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>

        {/* Payment Information */}
        {order.paymentInfo && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            {order.paymentInfo.method && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Method:</Text>
                <Text style={styles.paymentValue}>
                  {order.paymentInfo.method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            )}
            {(() => {
              // Calculate payment status based on order status and payment method
              let paymentStatus = order.paymentInfo.status;
              
              // If payment status is missing or incorrect, calculate it
              if (!paymentStatus || paymentStatus === 'pending') {
                const paymentMethod = order.paymentInfo.method || 'cash-on-delivery';
                const orderStatus = order.status || 'pending';
                
                if (paymentMethod === 'cash-on-delivery') {
                  // COD: paid when delivered, pending otherwise
                  paymentStatus = orderStatus === 'delivered' ? 'paid' : 'pending';
                } else if (paymentMethod === 'online' || paymentMethod === 'card') {
                  // Online/Card: paid when order is confirmed or later
                  paymentStatus = (orderStatus === 'pending') ? 'pending' : 'paid';
                }
              }
              
              return (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Status:</Text>
                  <Text style={[styles.paymentValue, { color: getStatusColor(paymentStatus) }]}>
                    {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        {/* Price Breakdown */}
        {order.pricing && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal:</Text>
              <Text style={styles.priceValue}>{formatCurrency(order.pricing.subtotal || 0)}</Text>
            </View>
            
            {(order.pricing.discount || 0) > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Discount:</Text>
                <Text style={[styles.priceValue, { color: GREEN_COLOR }]}>
                  -{formatCurrency(order.pricing.discount || 0)}
                </Text>
              </View>
            )}
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee:</Text>
              <Text style={styles.priceValue}>
                {(order.pricing.deliveryFee || 0) > 0 ? formatCurrency(order.pricing.deliveryFee || 0) : 'FREE'}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax:</Text>
              <Text style={styles.priceValue}>{formatCurrency(order.pricing.tax || 0)}</Text>
            </View>
            
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.pricing.total || 0)}</Text>
            </View>
          </View>
        )}

        {/* Order Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Order Timeline</Text>
            {order.statusHistory.map((history, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>
                    {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(history.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Navigation Bar Styles
  navigationBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButtonNav: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LIGHT_PINK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navigationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },

  scrollView: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },

  // Status Card Styles
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_RED,
  },

  deliveryStatusContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: LIGHT_PINK,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_RED,
  },

  deliveryStatusText: {
    fontSize: 14,
    color: DARK_GRAY,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Section Card Styles
  sectionCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 12,
  },

  // Customer Information Styles
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  customerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  // Delivery Agent Styles
  deliveryAgentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_PINK,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  deliveryAgentInfo: {
    flex: 1,
  },
  deliveryAgentName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  deliveryAgentPhone: {
    fontSize: 14,
    color: '#666',
  },
  callAgentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  // Address Styles
  addressText: {
    fontSize: 14,
    color: DARK_GRAY,
    lineHeight: 20,
    marginBottom: 2,
  },

  // Order Item Styles
  orderItemCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },

  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  itemWeight: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_RED,
  },

  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },

  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GRAY,
  },

  // Payment Information Styles
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },

  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_GRAY,
  },

  // Price Breakdown Styles
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  priceLabel: {
    fontSize: 14,
    color: '#666',
  },

  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_GRAY,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_RED,
  },

  // Timeline Styles
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_RED,
    marginRight: 12,
  },

  timelineContent: {
    flex: 1,
  },

  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GRAY,
  },

  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: PRIMARY_RED,
    marginBottom: 20,
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 20,
  },

  refreshingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  refreshingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },

  // Cancel Order Button Styles
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_RED,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },

  cancelOrderButtonDisabled: {
    opacity: 0.6,
  },

  cancelOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;