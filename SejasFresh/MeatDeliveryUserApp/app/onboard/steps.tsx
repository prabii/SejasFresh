// app/onboard/steps.tsx
import OnboardingScreen from '@/components/OnboardingScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingPage() {
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
