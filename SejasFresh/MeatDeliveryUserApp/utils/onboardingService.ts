import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboardingCompleted';

export class OnboardingService {
  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  }

  /**
   * Reset onboarding status (useful for testing)
   */
  static async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
      throw error;
    }
  }
}