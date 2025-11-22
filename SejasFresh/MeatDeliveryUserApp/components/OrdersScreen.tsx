import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, orderService } from '../services/orderService';

const RED_COLOR = '#D13635';
const GREEN_COLOR = '#4CAF50';
const ORANGE_COLOR = '#FF9800';
const BLUE_COLOR = '#2196F3';

interface OrdersScreenProps {
  onOrderPress?: (order: Order) => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ onOrderPress }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await orderService.getUserOrders();
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const handleRefresh = () => {
    loadOrders(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return ORANGE_COLOR;
      case 'confirmed':
        return BLUE_COLOR;
      case 'preparing':
        return '#9C27B0';
      case 'out-for-delivery':
        return '#FF5722';
      case 'delivered':
        return GREEN_COLOR;
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleOrderPress = (order: Order) => {
    if (onOrderPress) {
      onOrderPress(order);
    } else {
      // Show order details in alert for now
      Alert.alert(
        `Order #${order.orderNumber}`,
        `Status: ${getStatusText(order.status)}\nTotal: ₹${order.pricing.total}\nItems: ${order.items.length}\n\nDelivery Address:\n${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED_COLOR} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[RED_COLOR]}
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              You haven&apos;t placed any orders yet. Start shopping to see your orders here!
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderTotal}>₹{order.pricing.total}</Text>
                <Text style={styles.orderItems}>
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </Text>
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.deliveryAddress} numberOfLines={2}>
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          ))
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

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },

  headerRight: {
    width: 34,
  },

  // Content Styles
  content: {
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  shopButton: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },

  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Order Card Styles
  orderCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },

  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RED_COLOR,
  },

  orderItems: {
    fontSize: 14,
    color: '#666',
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
});

export default OrdersScreen;