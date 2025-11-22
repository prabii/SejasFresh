// app/auth/success.tsx
import RegistrationSuccessScreen from '@/components/RegistrationSuccessScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuccessPage() {
  return (
    <SafeAreaView style={styles.container}>
      <RegistrationSuccessScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
