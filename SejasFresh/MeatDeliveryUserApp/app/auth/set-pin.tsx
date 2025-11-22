// app/auth/set-pin.tsx
import SetPinScreen from '@/components/SetPinScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetPinPage() {
  return (
    <SafeAreaView style={styles.container}>
      <SetPinScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});