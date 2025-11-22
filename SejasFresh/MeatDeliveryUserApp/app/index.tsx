import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { cleanupExpiredSessions } from '../utils/sessionManager';

export default function Index() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Clean up any expired sessions first
      await cleanupExpiredSessions();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Stop loading immediately - auth context will handle its own loading
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (isLoading || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D13635" />
      </View>
    );
  }

  // Debug: Log auth status
  console.log('Auth check - isAuthenticated:', isAuthenticated, 'user:', !!user);

  // If user is authenticated AND has valid user data, go to main app
  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated, go to welcome screen showing both login and signup options
  return <Redirect href="/auth/welcome" />;
}