import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { addressService } from '../services/addressService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { clearAllCache, getCacheInfo } from '../utils/cacheManager';
import { useToast } from './ui/ToastProvider';

// Enhanced color palette
const RED_COLOR = '#D13635';
const RED_LIGHT = '#FFEBEE';
const RED_DARK = '#B71C1C';
const LIGHT_GRAY = '#F8F9FA';
const MEDIUM_GRAY = '#E9ECEF';
const DARK_GRAY = '#212529';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6C757D';
const TEXT_LIGHT = '#ADB5BD';
const WHITE = '#FFFFFF';
const SHADOW_COLOR = '#000000';

// Mock data for profile menu items
const profileMenuData = [
  {
    id: '1',
    iconName: 'shopping-bag',
    title: 'My Orders',
    iconType: 'feather',
  },
  {
    id: '2',
    iconName: 'map-pin',
    title: 'Saved Addresses',
    iconType: 'feather',
  },
  {
    id: '3',
    iconName: 'bell',
    title: 'Notifications',
    iconType: 'feather',
  },
  {
    id: '4',
    iconName: 'headphones',
    title: 'Customer Support',
    iconType: 'feather',
  },
  {
    id: '5',
    iconName: 'help-circle',
    title: 'Help & FAQ',
    iconType: 'feather',
  },
  {
    id: '6',
    iconName: 'trash-2',
    title: 'Clear Cache',
    iconType: 'feather',
  },
  {
    id: '7',
    iconName: 'info',
    title: 'About Us',
    iconType: 'feather',
  },
  {
    id: '8',
    iconName: 'log-out',
    title: 'Logout',
    iconType: 'feather',
  },
];

// ProfileHeader Component
const ProfileHeader: React.FC = () => {
  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push('/edit-profile');
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <AntDesign name="left" size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Profile</Text>
      
      <TouchableOpacity onPress={handleEdit}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};


// ProfileCard Component
const ProfileCard: React.FC = () => {
  const { user } = useAuth();

  // Generate user initials from first and last name or fullName
  const getUserInitials = () => {
    if (!user) return 'GU';
    
    // Try firstName and lastName first
    if (user.firstName && typeof user.firstName === 'string' && user.firstName.trim().length > 0 &&
        user.lastName && typeof user.lastName === 'string' && user.lastName.trim().length > 0) {
      const firstInitial = user.firstName.trim().charAt(0).toUpperCase();
      const lastInitial = user.lastName.trim().charAt(0).toUpperCase();
      if (firstInitial && lastInitial) {
        return `${firstInitial}${lastInitial}`;
      }
    }
    
    // Try fullName if firstName/lastName didn't work
    if (user.fullName && typeof user.fullName === 'string' && user.fullName.trim().length > 0) {
      const parts = user.fullName.trim().split(' ').filter(part => part.length > 0);
      if (parts.length >= 2) {
        const firstInitial = parts[0].charAt(0).toUpperCase();
        const secondInitial = parts[1].charAt(0).toUpperCase();
        if (firstInitial && secondInitial) {
          return `${firstInitial}${secondInitial}`;
        }
      } else if (parts.length === 1 && parts[0].length > 0) {
        const initial = parts[0].charAt(0).toUpperCase();
        if (initial) {
          return initial;
        }
      }
    }
    
    // Try email as fallback
    if (user.email && typeof user.email === 'string' && user.email.trim().length > 0) {
      const emailInitial = user.email.trim().charAt(0).toUpperCase();
      if (emailInitial) {
        return emailInitial;
      }
    }
    
    // Default fallback
    return 'GU';
  };

  // Show placeholder if user is not loaded yet
  // This should rarely happen as parent component handles loading state
  if (!user) {
    return (
      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.initialsText}>GU</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Guest User</Text>
          <Text style={styles.profileEmail}>Please login to view profile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileImageContainer}>
        <Text style={styles.initialsText}>{getUserInitials()}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>
          {user?.fullName && typeof user.fullName === 'string'
            ? user.fullName
            : (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Guest User')}
        </Text>
        <Text style={styles.profileEmail}>
          {user?.email || 'No email available'}
        </Text>
        <Text style={styles.profilePhone}>
          {user?.phone || 'No phone available'}
        </Text>
      </View>
    </View>
  );
};

// ProfileMenuItem Component
const ProfileMenuItem: React.FC<{ 
  iconName: string; 
  title: string; 
  iconType: string;
  isLast?: boolean;
}> = ({ iconName, title, iconType, isLast }) => {
  const { logout } = useAuth();
  
  // Handle logout functionality
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use AuthContext logout function which handles all cleanup
              await logout();
              
              // Navigate to login screen and reset navigation stack
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleMenuItemPress = async () => {
    switch (title) {
      case 'My Orders':
        router.push('/orders');
        break;
      case 'Saved Addresses':
        router.push('/other/address-management');
        break;
      case 'Notifications':
        router.push('/other/notifications');
        break;
      case 'Customer Support':
        router.push('/customer-support');
        break;
      case 'Help & FAQ':
        router.push('/faq');
        break;
      case 'Clear Cache':
        handleClearCache();
        break;
      case 'About Us':
        router.push('/about-us');
        break;
      case 'Logout':
        handleLogout();
        break;
      default:
        Alert.alert('Menu Item', `You tapped: ${title}`);
        break;
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached images and data. Images will reload fresh. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await clearAllCache();
              if (result.success) {
                Alert.alert('Success', 'Cache cleared successfully! Images will reload fresh.', [
                  {
                    text: 'OK',
                  },
                ]);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderIcon = () => {
    const iconColor = title === 'Logout' ? RED_COLOR : '#666';

    switch (iconType) {
      case 'feather':
        return <Feather name={iconName as any} size={20} color={iconColor} />;
      case 'ionicons':
        return <Ionicons name={iconName as any} size={20} color={iconColor} />;
      case 'antdesign':
        return <AntDesign name={iconName as any} size={20} color={iconColor} />;
      default:
        return <Feather name={iconName as any} size={20} color={iconColor} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.menuItem, isLast && styles.lastMenuItem]} 
      onPress={handleMenuItemPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.iconContainer, 
          title === 'Logout' && styles.logoutIconContainer
        ]}>
          {renderIcon()}
        </View>
        <Text style={[
          styles.menuItemTitle, 
          title === 'Logout' && styles.logoutTitle
        ]}>
          {title}
        </Text>
      </View>
      
      <View style={styles.menuItemRight}>
        <AntDesign name="right" size={16} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

// Stats Component
const ProfileStats: React.FC = () => {
  const [stats, setStats] = useState({
    ordersCount: 0,
    addressesCount: 0,
 // Default coins value
  });
  const [loading, setLoading] = useState(true);

  const loadUserStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch orders count from backend
      const ordersResponse = await orderService.getUserOrders(1, 100); // Get first 100 orders to count
      const ordersCount = ordersResponse.data?.pagination?.total || 0;
      
      // Fetch addresses count from backend
      const addressesResponse = await addressService.getSavedAddresses();
      const addressesCount = addressesResponse.length || 0;
      
      setStats({
        ordersCount,
        addressesCount, // This could come from a rewards/points service
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Use default values on error
      setStats({
        ordersCount: 0,
        addressesCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      loadUserStats();
      // Optionally, trigger user info/location refresh here if needed
    }, [loadUserStats])
  );

  // Refresh stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserStats();
    }, [loadUserStats])
  );

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{loading ? '...' : stats.ordersCount}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{loading ? '...' : stats.addressesCount}</Text>
        <Text style={styles.statLabel}>Addresses</Text>
      </View>
    </View>
  );
};

// Main ProfileScreen Component
const ProfileScreen: React.FC = () => {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Fetch user details from backend on screen focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchUser = async () => {
        try {
          // On first mount, wait a bit for AuthContext to finish loading
          if (isInitialMount && authLoading) {
            // Wait for auth to finish loading
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!isActive) return;
          }
          
          setLoading(true);
          const response = await authService.getMe();
          console.log('authService.getMe() response:', response);
          const userData = (response && ((response as any).data || response.user)) || null;
          if (response && response.success && userData && isActive) {
            // Update user data
            updateUser(userData);
          } else if (response && !response.success && isActive) {
            // If API call failed, but we have cached user, keep it
            console.warn('Failed to fetch user, using cached data if available');
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          // On error, if we have cached user, keep showing it
        } finally {
          if (isActive) {
            setLoading(false);
            setHasFetched(true);
            setIsInitialMount(false);
          }
        }
      };
      
      // Always fetch user data when screen comes into focus
      // This ensures fresh data and handles cases where user might be null
      fetchUser();
      
      return () => {
        isActive = false;
      };
  }, [updateUser, authLoading, isInitialMount])
  );

  // Show loading state if:
  // 1. Auth is still loading (on app start) - CRITICAL: wait for this
  // 2. We're fetching and haven't completed yet AND user is null
  // 3. User is null and we haven't fetched yet (first time)
  // Never show blank - always show loading if user is null and we're still initializing
  const shouldShowLoading = authLoading || 
                            (loading && !hasFetched && !user) || 
                            (!user && !hasFetched) ||
                            (!user && loading);

  if (shouldShowLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If user is still null after all loading is done, show placeholder
  // This should rarely happen, but prevents blank screen
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileHeader />
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileCard />
          <ProfileStats />
          <View style={styles.menuContainer}>
            <Text style={styles.menuSectionTitle}>Account</Text>
            <View style={styles.menuList}>
              {profileMenuData.map((item, index) => (
                <ProfileMenuItem
                  key={item.id}
                  iconName={item.iconName}
                  title={item.title}
                  iconType={item.iconType}
                  isLast={index === profileMenuData.length - 1}
                />
              ))}
            </View>
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Seja&apos;s Absolute Fresh</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ProfileHeader />
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <ProfileCard />
        {/* Profile Stats */}
        <ProfileStats />
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuList}>
            {profileMenuData.map((item, index) => (
              <ProfileMenuItem
                key={item.id}
                iconName={item.iconName}
                title={item.title}
                iconType={item.iconType}
                isLast={index === profileMenuData.length - 1}
              />
            ))}
          </View>
        </View>
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Seja&apos;s Absolute Fresh</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: 0.5,
  },

  editText: {
    fontSize: 16,
    color: RED_COLOR,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // Profile Card Styles
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },

  profileInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: RED_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: RED_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  initialsText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LIGHT_GRAY,
  },

  profileInfo: {
    alignItems: 'center',
  },

  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  profileEmail: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    marginBottom: 4,
    fontWeight: '500',
  },

  profilePhone: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    marginBottom: 2,
    fontWeight: '500',
  },

  profileAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  membershipText: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '500',
    marginLeft: 6,
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    padding: 24,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: RED_COLOR,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  statLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },

  // Menu Styles
  menuContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  menuList: {
    backgroundColor: 'white',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RED_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  logoutIconContainer: {
    backgroundColor: '#FFEBEE',
  },

  menuItemTitle: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  logoutTitle: {
    color: RED_COLOR,
  },

  menuItemRight: {
    paddingLeft: 10,
  },

  // App Info Styles
  appInfo: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },

  appInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  versionText: {
    fontSize: 14,
    color: '#999',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;