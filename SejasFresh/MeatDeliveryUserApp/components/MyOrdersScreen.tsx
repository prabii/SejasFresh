import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, orderService } from '../services/orderService';

// Color constants
const PRIMARY_RED = '#D32F2F';
const GREEN_COLOR = '#2E7D32';
const YELLOW_COLOR = '#F9A825';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
const LIGHT_PINK = '#FFF1F1';

const MyOrdersScreen: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load orders from API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getUserOrders();
      
      if (response.success && response.data?.data) {
        setOrders(response.data.data);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle order details
  const handleOrderDetails = (order: Order) => {
    router.push({
      pathname: '/other/order-details',
      params: { orderData: JSON.stringify(order) }
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return GREEN_COLOR;
      case 'cancelled':
        return PRIMARY_RED;
      case 'pending':
        return YELLOW_COLOR;
      default:
        return DARK_GRAY;
    }
  };

  // Get status text
  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    }
  };

  // Get formatted date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get order title (first product name or summary)
  const getOrderTitle = (order: Order): string => {
    if (order.items.length === 0) return 'No items';
    if (order.items.length === 1) return order.items[0].product.name;
    return `${order.items[0].product.name} & ${order.items.length - 1} more`;
  };

  // Get total quantity
  const getTotalQuantity = (order: Order): number => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get product image with proper URL construction
  const getProductImage = (order: Order) => {
    if (order.items.length > 0) {
      const firstItem = order.items[0];
      let imageUrl: string | null = null;

      // Try multiple image sources
      // 1. Try images array (new structure)
      if (firstItem.product?.images && firstItem.product.images.length > 0) {
        imageUrl = firstItem.product.images[0]?.url || null;
      }
      
      // 2. Try item.image (from order creation - stored in order item)
      if (!imageUrl && (firstItem as any).image) {
        imageUrl = (firstItem as any).image;
      }

      if (imageUrl) {
        // Check if it's already a full URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return { uri: imageUrl };
        }
        
        // Construct full URL from backend
        const { getCurrentConfig } = require('../config/api');
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
      }
    }
    
    // Fallback to default image
    return require('../assets/images/instant-pic.png');
  };

  // Filter orders based on active tab
  const getFilteredOrders = (): Order[] => {
    // Since we only have 'All' tab, return all orders
    return orders;
  };

  // Render order card
  const renderOrderCard = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      {/* Order ID and Date Row */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order ID = {item.orderNumber}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* Product Details Row */}
      <View style={styles.orderContent}>
        {/* Product Image */}
        <Image 
          source={getProductImage(item)} 
          style={styles.productImage} 
          resizeMode="cover"
          defaultSource={require('../assets/images/instant-pic.png')}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{getOrderTitle(item)}</Text>
          <Text style={styles.productQuantity}>Quantity - {getTotalQuantity(item)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>

        {/* Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleOrderDetails(item)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.navigationTitle}>My Orders</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_RED} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredOrders()}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
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

  backButton: {
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

  // Orders List Styles
  ordersList: {
    flex: 1,
  },

  ordersListContainer: {
    padding: 16,
  },

  // Order Card Styles
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
  },

  orderDate: {
    fontSize: 14,
    color: '#888',
  },

  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: LIGHT_GRAY,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },

  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  productQuantity: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },

  detailsButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
    textAlign: 'center',
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  errorText: {
    fontSize: 16,
    color: PRIMARY_RED,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default MyOrdersScreen;