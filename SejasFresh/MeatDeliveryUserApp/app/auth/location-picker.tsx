// app/auth/location-picker.tsx
import LocationPickerScreen from '@/components/LocationPickerScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationPickerPage() {
  return (
    <SafeAreaView style={styles.container}>
      <LocationPickerScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

