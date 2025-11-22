import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onPress?: () => void;
}

interface ToastProps extends ToastConfig {
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  visible, 
  onHide,
  onPress 
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));

  const hideToast = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      onHide();
    });
  }, [slideAnim, onHide]);

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, slideAnim, onHide, hideToast]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          background: '#4CAF50',
          text: '#ffffff',
          icon: '#ffffff'
        };
      case 'error':
        return {
          background: '#F44336',
          text: '#ffffff',
          icon: '#ffffff'
        };
      case 'warning':
        return {
          background: '#FF9800',
          text: '#ffffff',
          icon: '#ffffff'
        };
      case 'info':
        return {
          background: '#2196F3',
          text: '#ffffff',
          icon: '#ffffff'
        };
      default:
        return {
          background: '#323232',
          text: '#ffffff',
          icon: '#ffffff'
        };
    }
  };

  const colors = getColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.background
        }
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress || hideToast}
        activeOpacity={0.9}
      >
        <Ionicons 
          name={getIconName() as any} 
          size={24} 
          color={colors.icon} 
          style={styles.icon} 
        />
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.icon} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default Toast;