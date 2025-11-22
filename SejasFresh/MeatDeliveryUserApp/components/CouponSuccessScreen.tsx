import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RED_COLOR = '#D13635';

interface CouponSuccessScreenProps {
  visible: boolean;
  onClose: () => void;
  couponCode?: string;
  discountAmount?: number;
}

const CouponSuccessScreen: React.FC<CouponSuccessScreenProps> = ({
  visible,
  onClose,
  couponCode,
  discountAmount,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Celebration Image/Illustration */}
          <View style={styles.illustrationContainer}>
            {/* Try to load PNG image, fallback to icons */}
            {(() => {
              try {
                const celebrationImage = require('../assets/images/coupon-success.png');
                return (
                  <Image
                    source={celebrationImage}
                    style={styles.celebrationImage}
                    resizeMode="contain"
                  />
                );
              } catch {
                // Fallback to icon-based celebration
                return (
                  <>
                    <View style={styles.celebrationIcon}>
                      <Ionicons name="gift" size={80} color={RED_COLOR} />
                      <Ionicons name="checkmark-circle" size={60} color="#4CAF50" style={styles.checkIcon} />
                    </View>
                    {/* Confetti effect using icons */}
                    <View style={styles.confettiContainer}>
                      <Ionicons name="star" size={20} color={RED_COLOR} style={styles.confetti1} />
                      <Ionicons name="star" size={18} color="#FFD700" style={styles.confetti2} />
                      <Ionicons name="star" size={22} color={RED_COLOR} style={styles.confetti3} />
                      <Ionicons name="star" size={19} color="#FFD700" style={styles.confetti4} />
                      <Ionicons name="star" size={21} color={RED_COLOR} style={styles.confetti5} />
                    </View>
                  </>
                );
              }
            })()}
          </View>

          {/* Success Text */}
          <Text style={styles.successTitle}>Yayyyy !!!</Text>
          <Text style={styles.successMessage}>Coupon applied</Text>
          
          {couponCode && (
            <Text style={styles.couponCode}>Code: {couponCode}</Text>
          )}
          
          {discountAmount && discountAmount > 0 && (
            <Text style={styles.discountText}>
              You saved ₹{discountAmount}!
            </Text>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationImage: {
    width: '100%',
    height: '100%',
  },
  celebrationIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 30,
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confetti1: {
    position: 'absolute',
    top: 20,
    left: 30,
  },
  confetti2: {
    position: 'absolute',
    top: 40,
    right: 40,
  },
  confetti3: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  confetti4: {
    position: 'absolute',
    bottom: 50,
    right: 30,
  },
  confetti5: {
    position: 'absolute',
    top: 60,
    left: '50%',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  couponCode: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  discountText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: RED_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CouponSuccessScreen;

