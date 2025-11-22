// app/auth/login.tsx
import SimpleLoginScreen from '@/components/SimpleLoginScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginPage() {
  return (
    <SafeAreaView style={styles.container}>
      <SimpleLoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
