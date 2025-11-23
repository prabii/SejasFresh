import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

// FileSystem is optional - only use if available
let FileSystem: any = null;
try {
  FileSystem = require('expo-file-system');
} catch (e) {
  console.debug('expo-file-system not available, skipping file cache clearing');
}

/**
 * Cache Manager Utility
 * Handles clearing app cache including images, AsyncStorage, and file system cache
 */

const CACHE_KEYS = {
  LAST_CLEARED: 'cache_last_cleared',
  CACHE_SIZE: 'cache_size',
};

/**
 * Clear Expo Image cache
 */
export const clearImageCache = async (): Promise<boolean> => {
  try {
    // Clear expo-image cache
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    console.log('✅ Image cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing image cache:', error);
    return false;
  }
};

/**
 * Clear AsyncStorage cache (except auth and user data)
 */
export const clearAsyncStorageCache = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    
    // Keep these important keys
    const keepKeys = [
      'authSession',
      'userData',
      'onboardingCompleted',
      'pushToken',
      'notificationPreferences',
    ];
    
    // Remove all keys except the ones we want to keep
    const keysToRemove = keys.filter(key => !keepKeys.includes(key));
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`✅ Cleared ${keysToRemove.length} AsyncStorage keys`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage cache:', error);
    return false;
  }
};

/**
 * Clear file system cache
 */
export const clearFileSystemCache = async (): Promise<boolean> => {
  if (!FileSystem) {
    console.log('⚠️ FileSystem not available, skipping file cache clearing');
    return true; // Return true to not fail the overall operation
  }
  
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      for (const file of files) {
        try {
          await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
        } catch (error) {
          // Ignore individual file errors
          console.debug(`Could not delete cache file: ${file}`);
        }
      }
      console.log(`✅ Cleared ${files.length} cache files`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error clearing file system cache:', error);
    return false;
  }
};

/**
 * Get cache size (approximate)
 */
export const getCacheSize = async (): Promise<number> => {
  try {
    let totalSize = 0;
    
    // Get file system cache size (if available)
    if (FileSystem) {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        try {
          const info = await FileSystem.getInfoAsync(cacheDir);
          if (info.exists) {
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            for (const file of files) {
              try {
                const fileInfo = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
                if (fileInfo.exists && fileInfo.size) {
                  totalSize += fileInfo.size;
                }
              } catch (error) {
                // Ignore individual file errors
              }
            }
          }
        } catch (error) {
          console.debug('Could not calculate cache size:', error);
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
};

/**
 * Format cache size to human readable format
 */
export const formatCacheSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Clear all app cache
 */
export const clearAllCache = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const results = await Promise.allSettled([
      clearImageCache(),
      clearAsyncStorageCache(),
      clearFileSystemCache(),
    ]);
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const totalCount = results.length;
    
    // Save last cleared timestamp
    await AsyncStorage.setItem(CACHE_KEYS.LAST_CLEARED, Date.now().toString());
    
    if (successCount === totalCount) {
      return {
        success: true,
        message: 'Cache cleared successfully!',
      };
    } else {
      return {
        success: true,
        message: `Cache cleared (${successCount}/${totalCount} operations succeeded)`,
      };
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return {
      success: false,
      message: 'Failed to clear cache. Please try again.',
    };
  }
};

/**
 * Auto-clear old cache (called on app start)
 * Clears cache older than 7 days
 */
export const autoClearOldCache = async (): Promise<void> => {
  try {
    const lastCleared = await AsyncStorage.getItem(CACHE_KEYS.LAST_CLEARED);
    if (lastCleared) {
      const daysSinceLastClear = (Date.now() - parseInt(lastCleared)) / (1000 * 60 * 60 * 24);
      
      // Clear cache if it's been more than 7 days
      if (daysSinceLastClear > 7) {
        console.log('Auto-clearing old cache...');
        await clearAllCache();
      }
    }
  } catch (error) {
    console.error('Error in auto-clear cache:', error);
  }
};

/**
 * Get cache info
 */
export const getCacheInfo = async (): Promise<{
  size: number;
  formattedSize: string;
  lastCleared: string | null;
}> => {
  try {
    const size = await getCacheSize();
    const lastCleared = await AsyncStorage.getItem(CACHE_KEYS.LAST_CLEARED);
    
    return {
      size,
      formattedSize: formatCacheSize(size),
      lastCleared: lastCleared ? new Date(parseInt(lastCleared)).toLocaleDateString() : null,
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return {
      size: 0,
      formattedSize: '0 B',
      lastCleared: null,
    };
  }
};

