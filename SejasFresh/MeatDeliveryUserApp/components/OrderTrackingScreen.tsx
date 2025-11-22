import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, orderService } from '../services/orderService';

const RED_COLOR = '#D13635';
const GREEN_COLOR = '#4CAF50';
const ORANGE_COLOR = '#FF6B35';

interface OrderTrackingScreenProps {
  orderId?: string;
  order?: Order;
}

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ orderId, order: propOrder }) => {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(propOrder || null);
  const [loading, setLoading] = useState(!propOrder);

  useEffect(() => {
    if (orderId && !propOrder) {
      loadOrder();
    }
  }, [orderId]);

  // Poll for order updates every 10 seconds
  useEffect(() => {
    if (!order?._id) return;

    const interval = setInterval(() => {
      loadOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [order?._id]);

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCallAgent = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCancelOrder = () => {
    // TODO: Implement cancel order functionality
    console.log('Cancel order');
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
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = order.status?.toLowerCase() || 'pending';
  const deliveryAgent = order.assignedTo ? {
    name: `${order.assignedTo.firstName || ''} ${order.assignedTo.lastName || ''}`.trim(),
    phone: order.assignedTo.phone || '',
  } : null;
  const estimatedTime = '30 minutes'; // This could come from order data

  // Render different screens based on status
  const renderStatusScreen = () => {
    switch (status) {
      case 'preparing':
        return renderPreparingScreen();
      case 'out-for-delivery':
        return renderOutForDeliveryScreen();
      case 'delivered':
        return renderDeliveredScreen();
      default:
        return renderDefaultScreen();
    }
  };

  const renderPreparingScreen = () => (
    <View style={styles.statusContainer}>
      <View style={styles.illustrationContainer}>
        {/* Meat character illustration placeholder */}
        <View style={styles.meatCharacter}>
          <Ionicons name="restaurant" size={80} color={RED_COLOR} />
        </View>
      </View>
      <Text style={styles.statusTitle}>Your order is being packed</Text>
      {renderOrderDetailsCard()}
    </View>
  );

  const renderOutForDeliveryScreen = () => (
    <View style={styles.statusContainer}>
      <View style={styles.illustrationContainer}>
        {/* Delivery agent illustration placeholder */}
        <View style={styles.deliveryIllustration}>
          <View style={styles.stopwatchContainer}>
            <Ionicons name="time-outline" size={60} color="white" />
          </View>
          <View style={styles.agentContainer}>
            <Ionicons name="person" size={50} color={RED_COLOR} />
          </View>
        </View>
      </View>
      <Text style={styles.statusTitle}>Delivery agent is at your location</Text>
      {renderOrderDetailsCard()}
    </View>
  );

  const renderDeliveredScreen = () => (
    <View style={styles.statusContainer}>
      <View style={styles.illustrationContainer}>
        <Ionicons name="checkmark-circle" size={100} color={GREEN_COLOR} />
      </View>
      <Text style={styles.statusTitle}>Order Delivered!</Text>
      <Text style={styles.statusSubtitle}>Thank you for your order</Text>
      {renderOrderDetailsCard()}
    </View>
  );

  const renderDefaultScreen = () => (
    <View style={styles.statusContainer}>
      <View style={styles.illustrationContainer}>
        <Ionicons name="time-outline" size={80} color={RED_COLOR} />
      </View>
      <Text style={styles.statusTitle}>{getStatusText(status)}</Text>
      {renderOrderDetailsCard()}
    </View>
  );

  const renderOrderDetailsCard = () => (
    <View style={styles.detailsCard}>
      {/* Delivery Status Bar */}
      <View style={styles.deliveryStatusBar}>
        <Text style={styles.deliveryStatusText}>Delivers in</Text>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="white" />
          <Text style={styles.timeText}>{estimatedTime}</Text>
        </View>
        {status !== 'delivered' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* OTP */}
      {status === 'out-for-delivery' && (
        <View style={styles.otpContainer}>
          <Text style={styles.otpText}>OTP - {order.orderNumber?.slice(-4) || '6969'}</Text>
        </View>
      )}

      {/* Delivery Agent Info */}
      {deliveryAgent && (status === 'out-for-delivery' || status === 'delivered') && (
        <View style={styles.agentInfoContainer}>
          <View style={styles.agentAvatar}>
            <Ionicons name="person" size={30} color={RED_COLOR} />
          </View>
          <View style={styles.agentDetails}>
            <Text style={styles.agentName}>
              {deliveryAgent.name || 'Delivery Agent'}
            </Text>
            <Text style={styles.agentPhone}>
              {deliveryAgent.phone || '+91 9876543210'}
            </Text>
          </View>
          {deliveryAgent.phone && status === 'out-for-delivery' && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallAgent(deliveryAgent.phone)}
            >
              <Ionicons name="call" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Payment Details */}
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payment details</Text>
        <Text style={styles.paymentValue}>
          {order.paymentInfo?.method === 'cash-on-delivery' ? 'Cash on delivery' : 'Online'}
        </Text>
      </View>

      {/* Order Items */}
      <View style={styles.itemsSection}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name || item.product?.name || 'Item'}</Text>
            <Text style={styles.itemPrice}>
              ₹{item.priceAtTime || 0} x {item.quantity}
            </Text>
          </View>
        ))}
      </View>

      {/* Back to Home Button */}
      <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/(tabs)')}>
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Order Delivered';
      default:
        return 'Tracking Order';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={RED_COLOR} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatusScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF1F1',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButtonText: {
    color: RED_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  illustrationContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  meatCharacter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryIllustration: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopwatchContainer: {
    position: 'absolute',
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RED_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  detailsCard: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    marginTop: 20,
    minHeight: 400,
  },
  deliveryStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE_COLOR,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  deliveryStatusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  otpContainer: {
    alignSelf: 'flex-start',
    backgroundColor: RED_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 15,
  },
  otpText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  agentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  agentPhone: {
    fontSize: 14,
    color: '#666',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: 16,
    color: '#666',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: RED_COLOR,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderTrackingScreen;

