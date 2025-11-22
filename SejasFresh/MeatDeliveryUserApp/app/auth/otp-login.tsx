// app/auth/otp-login.tsx
import AuthScreen from '@/components/AuthScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPLoginPage() {
  return (
    <SafeAreaView style={styles.container}>
      <AuthScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});