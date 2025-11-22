import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import LandingScreen from '../components/LandingScreen';

export default function AppLanding() {
  const router = useRouter();

  useEffect(() => {
    // Optionally, after a delay, navigate to main app
    // setTimeout(() => router.replace('/(tabs)'), 2000);
  }, [router]);

  return <LandingScreen onFinish={() => router.replace('/(tabs)')} />;
}
