import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCart } from '../../contexts/CartContext';

interface CartIconWithBadgeProps {
  color: string;
  size: number;
}

const CartIconWithBadge: React.FC<CartIconWithBadgeProps> = ({ color, size }) => {
  const { cartItemCount } = useCart();

  return (
    <View style={styles.container}>
      <Ionicons name="cart" size={size} color={color} />
      {cartItemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartItemCount > 99 ? '99+' : cartItemCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
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
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CartIconWithBadge;