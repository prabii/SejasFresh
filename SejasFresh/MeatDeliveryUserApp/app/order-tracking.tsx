import OrderTrackingScreen from '../components/OrderTrackingScreen';
import { useLocalSearchParams } from 'expo-router';

export default function OrderTrackingPage() {
  const { orderId, orderData } = useLocalSearchParams();
  
  let parsedOrder = null;
  if (orderData && typeof orderData === 'string') {
    try {
      parsedOrder = JSON.parse(orderData);
    } catch (e) {
      console.error('Error parsing order data:', e);
    }
  }

  return <OrderTrackingScreen orderId={orderId as string} order={parsedOrder} />;
}

