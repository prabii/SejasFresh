import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cartService, CartSummary } from '../services/cartService';

interface CartIconProps {
  onPress?: () => void;
  color?: string;
  size?: number;
}

const CartIcon: React.FC<CartIconProps> = ({
  onPress,
  color = '#333',
  size = 24
}) => {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);

  useEffect(() => {
    loadCartSummary();
    
    // Optionally, you could set up an interval to refresh cart count
    const interval = setInterval(loadCartSummary, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCartSummary = async () => {
    try {
      const summary = await cartService.getCartSummary();
      setCartSummary(summary);
    } catch (error) {
      console.error('Error loading cart summary:', error);
      // Set empty cart on error
      setCartSummary({
        itemCount: 0,
        totalAmount: 0,
        formattedTotal: '₹0.00',
        items: []
      });
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cart-outline" size={size} color={color} />
        {cartSummary && cartSummary.itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {cartSummary.itemCount > 99 ? '99+' : cartSummary.itemCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  
  iconContainer: {
    position: 'relative',
  },
  
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CartIcon;