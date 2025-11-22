import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../components/ui/ToastProvider';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <ToastProvider>
              <StatusBar style="dark" backgroundColor="#ffffff" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="landing" />
                <Stack.Screen name="onboard/steps" />
                <Stack.Screen name="auth/welcome" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/otp-login" />
                <Stack.Screen name="auth/register" />
                <Stack.Screen name="auth/location-picker" />
                <Stack.Screen name="auth/forgot-password" />
                <Stack.Screen name="auth/set-pin" />
                <Stack.Screen name="auth/otp" />
                <Stack.Screen name="auth/success" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="other/notifications" />
                <Stack.Screen name="other/personal-info" />
                <Stack.Screen name="other/my-orders" />
                <Stack.Screen name="other/order-details" />
                <Stack.Screen name="other/address-management" />
                <Stack.Screen name="other/privacy-security" />
                <Stack.Screen name="other/settings" />
                <Stack.Screen name="other/help-support" />
              </Stack>
            </ToastProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
