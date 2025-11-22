// app/auth/register.tsx
import SimpleRegisterScreen from '@/components/SimpleRegisterScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterPage() {
  return (
    <SafeAreaView style={styles.container}>
      <SimpleRegisterScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
