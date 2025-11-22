import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { cartService } from '../services/cartService';

interface CartContextType {
  cartItemCount: number;
  refreshCartCount: () => Promise<void>;
  incrementCartCount: () => void;
  decrementCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCartCount = async () => {
    try {
      const cart = await cartService.getCart();
      if (cart && cart.items) {
        // Calculate total quantity of all items in cart
        const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Error refreshing cart count:', error);
      setCartItemCount(0);
    }
  };

  const incrementCartCount = () => {
    setCartItemCount(prev => prev + 1);
  };

  const decrementCartCount = () => {
    setCartItemCount(prev => Math.max(0, prev - 1));
  };

  // Load cart count on mount
  useEffect(() => {
    refreshCartCount();
  }, []);

  const value: CartContextType = {
    cartItemCount,
    refreshCartCount,
    incrementCartCount,
    decrementCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};