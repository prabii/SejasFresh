// app/auth/forgot-password.tsx
import ForgotPasswordScreen from '@/components/ForgotPasswordScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordPage() {
  return (
    <SafeAreaView style={styles.container}>
      <ForgotPasswordScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});