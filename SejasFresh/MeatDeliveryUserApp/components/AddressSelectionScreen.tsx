import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Address, addressService } from '../services/addressService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { useToast } from './ui/ToastProvider';

const RED_COLOR = '#D13635';
const LIGHT_GRAY = '#f5f5f5';
const GREEN_COLOR = '#4CAF50';

const AddressSelectionScreen: React.FC = () => {
  const toast = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  useEffect(() => {
    loadAddresses();
    loadCartTotal();
  }, []);

  // Reload addresses when screen comes into focus (e.g., returning from add address screen)
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const loadAddresses = async () => {
    try {
      setLoading(true);
      
      // Try to load addresses from backend first
      const savedAddresses = await addressService.getSavedAddresses();
      
      if (savedAddresses && savedAddresses.length > 0) {
        setAddresses(savedAddresses);
        
        // Select default address or first address
        const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        }
      } else {
        // No addresses found - user needs to add one
        setAddresses([]);
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // On error, show empty state - user needs to add address
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCartTotal = async () => {
    try {
      const cart = await cartService.getCart();
      if (cart && cart.totalAmount) {
        setCartTotal(cart.totalAmount);
      } else {
        setCartTotal(0);
      }
    } catch (error) {
      console.error('Error loading cart total:', error);
      setCartTotal(0);
    }
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleAddNewAddress = () => {
    router.push('/add-address');
  };

  const handleDeleteAddress = async (addressId: string) => {
    const addressToDelete = addresses.find(addr => addr._id === addressId);
    if (!addressToDelete) return;

    try {
      const updatedAddresses = await addressService.deleteAddress(addressId);
      setAddresses(updatedAddresses);
      
      // If deleted address was selected, select another one
      if (selectedAddressId === addressId) {
        const defaultAddress = updatedAddresses.find(addr => addr.isDefault) || updatedAddresses[0];
        setSelectedAddressId(defaultAddress?._id || null);
      }
      
      toast.showSuccess('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.showError('Failed to delete address. Please try again.');
    }
  };

  const handleMakeDefault = async (addressId: string) => {
    try {
      const updatedAddresses = await addressService.setDefaultAddress(addressId);
      setAddresses(updatedAddresses);
      toast.showSuccess('Default address updated successfully');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.showError('Failed to set default address. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.showError('Please select a delivery address');
      return;
    }

    if (cartTotal === 0) {
      toast.showError('Your cart is empty');
      return;
    }

    try {
      setIsPlacingOrder(true);
      
      // Validate cart has items before placing order
      const currentCart = await cartService.getCart();
      if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        throw new Error('Your cart is empty. Please add items before placing an order.');
      }
      
      const validItems = currentCart.items.filter(item => item.product !== null);
      if (validItems.length === 0) {
        throw new Error('No valid items in cart. Please refresh and try again.');
      }
      
      // Create order using the backend API with selected address
      const order = await orderService.createOrderFromCart(
        selectedAddressId,
        'cash-on-delivery', // Payment method
        specialInstructions.trim() || undefined // Special instructions
      );
      
      // Show success notification
      toast.showSuccess('🎉 Order Placed Successfully!');
      
      // Refresh notifications to update badge count
      try {
        const { useNotificationContext } = await import('../contexts/NotificationContext');
        // Note: We can't use hooks here, so we'll refresh in the notification context
        // The polling will pick it up automatically
      } catch (error) {
        console.error('Error refreshing notifications:', error);
      }
      
      // Send local push notification about order placement
      try {
        const { notificationService } = await import('../services/notificationService');
        await notificationService.scheduleLocalNotification(
          'Order Placed Successfully! 🎉',
          `Your order #${order.orderNumber} has been placed. We'll notify you when it's confirmed.`,
          { 
            type: 'order',
            orderId: order._id, 
            orderNumber: order.orderNumber,
            screen: 'order-details'
          },
          1 // Show after 1 second
        );
      } catch (error) {
        console.error('Error sending local notification:', error);
      }
      
      // Navigate to order success page with order data
      router.replace({
        pathname: '/order-success',
        params: {
          orderData: JSON.stringify(order)
        }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.showError(errorMessage);
    } finally {
      setIsPlacingOrder(false);
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
          <Text style={styles.loadingText}>Loading addresses...</Text>
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
        <Text style={styles.headerTitle}>Select Delivery Address</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address List */}
        <View style={styles.addressSection}>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={[
                styles.addressCard,
                selectedAddressId === address._id && styles.selectedAddressCard
              ]}
              onPress={() => handleSelectAddress(address._id)}
            >
              <View style={styles.addressContent}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTypeContainer}>
                    <Ionicons 
                      name={address.label === 'Home' ? 'home' : address.label === 'Work' || address.label === 'Office' ? 'business' : 'location'} 
                      size={20} 
                      color={selectedAddressId === address._id ? RED_COLOR : '#666'} 
                    />
                    <Text style={[
                      styles.addressType,
                      selectedAddressId === address._id && styles.selectedAddressType
                    ]}>
                      {address.label}
                    </Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    {/* Delete Address Button - only show if not the only address */}
                    {addresses.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => handleDeleteAddress(address._id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                    <View style={[
                      styles.radioButton,
                      selectedAddressId === address._id && styles.selectedRadioButton
                    ]}>
                      {selectedAddressId === address._id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </View>

                <Text style={styles.addressText}>
                  {address.street}
                </Text>
                {address.landmark && (
                  <Text style={styles.addressText}>
                    Near {address.landmark}
                  </Text>
                )}
                <Text style={styles.addressText}>
                  {address.city}, {address.state} {address.zipCode}
                </Text>
                
                {/* Make Default Button - show only for non-default addresses */}
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={styles.makeDefaultButton}
                    onPress={() => handleMakeDefault(address._id)}
                  >
                    <Text style={styles.makeDefaultText}>Make this default</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Add New Address Button */}
          <TouchableOpacity style={styles.addAddressButton} onPress={handleAddNewAddress}>
            <AntDesign name="plus" size={20} color={RED_COLOR} />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary removed as per requirements */}

        {/* Special Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Add any special delivery instructions..."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.instructionsHint}>
            e.g., Ring the doorbell twice, Leave at the door, Call when arrived
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.placeOrderButton,
            (!selectedAddressId || isPlacingOrder || cartTotal === 0) && styles.disabledButton
          ]} 
          onPress={handlePlaceOrder}
          disabled={!selectedAddressId || isPlacingOrder || cartTotal === 0}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order - ₹{cartTotal}</Text>
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
    width: 34, // Same as back button to center title
  },

  // Content Styles
  content: {
    flex: 1,
  },

  addressSection: {
    padding: 20,
  },

  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  selectedAddressCard: {
    borderColor: RED_COLOR,
    backgroundColor: '#fef5f5',
  },

  addressContent: {
    flex: 1,
  },

  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deleteButton: {
    padding: 8,
    marginRight: 8,
  },

  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },

  selectedAddressType: {
    color: RED_COLOR,
  },

  defaultBadge: {
    backgroundColor: GREEN_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },

  defaultText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },

  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 2,
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

  selectedRadioButton: {
    borderColor: RED_COLOR,
  },

  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED_COLOR,
  },

  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: RED_COLOR,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },

  addAddressText: {
    fontSize: 16,
    color: RED_COLOR,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Summary Styles
  summarySection: {
    backgroundColor: LIGHT_GRAY,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RED_COLOR,
  },

  paymentMethod: {
    fontSize: 16,
    color: GREEN_COLOR,
    fontWeight: '600',
  },

  // Bottom Section
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },

  placeOrderButton: {
    backgroundColor: RED_COLOR,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },

  placeOrderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Special Instructions Styles
  instructionsSection: {
    backgroundColor: LIGHT_GRAY,
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
  },

  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  instructionsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  instructionsHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Make Default Button Styles
  makeDefaultButton: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  makeDefaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AddressSelectionScreen;