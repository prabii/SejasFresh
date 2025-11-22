import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationItem, notificationService } from '../services/notificationService';
import { orderService } from '../services/orderService';
import { useToast } from './ui/ToastProvider';

const RED_COLOR = '#D13635';
const LIGHT_GRAY = '#f5f5f5';

// NotificationsHeader Component
interface NotificationsHeaderProps {
  onMarkAllRead: () => void;
  isLoading: boolean;
}

interface NotificationsHeaderProps {
  onMarkAllRead: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  isClearing: boolean;
}

const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({ 
  onMarkAllRead, 
  onClearAll,
  isLoading, 
  isClearing 
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <AntDesign name="left" size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Notifications</Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={onClearAll}
          disabled={isClearing || isLoading}
          style={[styles.clearAllButton, (isClearing || isLoading) && styles.disabledButton]}
        >
          <Text style={[styles.clearAllText, (isClearing || isLoading) && styles.disabledText]}>
            Clear All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onMarkAllRead}
          disabled={isLoading || isClearing}
          style={[styles.markAllReadButton, (isLoading || isClearing) && styles.disabledButton]}
        >
          <Text style={[styles.markAllReadText, (isLoading || isClearing) && styles.disabledText]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// NotificationItemCard Component
interface NotificationItemCardProps {
  item: NotificationItem;
  onPress: (notification: NotificationItem) => void;
}

const NotificationItemCard: React.FC<NotificationItemCardProps> = ({ item, onPress }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Ionicons name="receipt-outline" size={20} color={RED_COLOR} />;
      case 'offer':
        return <Ionicons name="pricetag-outline" size={20} color="#FF9500" />;
      case 'delivery':
        return <Ionicons name="bicycle-outline" size={20} color="#4CAF50" />;
      case 'product':
        return <Ionicons name="storefront-outline" size={20} color="#2196F3" />;
      case 'payment':
        return <Ionicons name="card-outline" size={20} color="#9C27B0" />;
      case 'welcome':
        return <Ionicons name="heart-outline" size={20} color="#E91E63" />;
      case 'system_announcement':
        return <Ionicons name="megaphone-outline" size={20} color="#FF6B35" />;
      default:
        return <Ionicons name="notifications-outline" size={20} color="#666" />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handlePress = () => {
    onPress(item);
  };

  return (
    <TouchableOpacity style={styles.notificationItem} onPress={handlePress}>
      {!item.isRead && <View style={styles.unreadIndicator} />}
      
      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
      </View>
      
      <View style={styles.chevronContainer}>
        <AntDesign name="right" size={16} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

// Main NotificationsScreen Component
const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { showSuccess, showError } = useToast();

  const testConnection = async () => {
    try {
      console.log('Testing notification service connection...');
      
      // Test basic connection
      const result = await notificationService.testConnection();
      console.log('Connection test result:', result);
      
      // Test getting notifications
      const notifResult = await notificationService.testGetNotifications();
      console.log('Get notifications test result:', notifResult);
      
      // Only log success, don't show toast
      console.log('Connection test completed successfully');
    } catch (error: any) {
      console.error('Connection test failed:', error);
      // Only show error alerts, not success
      showError(`Connection test failed: ${error.message}`);
    }
  };

  const loadNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log('Loading notifications, page:', page);
      
      const response = await notificationService.getNotifications({
        page,
        limit: 20,
      });

      console.log('Notifications response:', response);

      if (response.success) {
        const newNotifications = response.data?.data || [];
        
        if (append && page > 1) {
          setNotifications(prev => {
            // Filter out duplicates and ensure all items have _id
            const existingIds = new Set((prev || []).map(n => n._id || n.id).filter(Boolean));
            const uniqueNew = newNotifications.filter(n => {
              const id = n._id || n.id;
              return id && !existingIds.has(id);
            });
            return [...(prev || []), ...uniqueNew];
          });
        } else {
          // Ensure all notifications have valid IDs
          const validNotifications = newNotifications.filter(n => n._id || n.id);
          setNotifications(validNotifications);
        }
        
        // Calculate hasMoreData based on pagination
        const pagination = response.data?.pagination;
        setHasMoreData(pagination ? pagination.current < pagination.pages : false);
        setCurrentPage(page);
      } else {
        console.error('Failed to load notifications:', response);
        showError('Failed to load notifications');
        // Ensure we still have a valid array
        if (!append) {
          setNotifications([]);
        }
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      showError(error.message || 'Failed to load notifications');
      // Ensure we still have a valid array on error
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [showError]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    loadNotifications(1);
  }, [loadNotifications]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreData) {
      loadNotifications(currentPage + 1, true);
    }
  };

  // Load notifications when screen is focused (including initial focus)
  useFocusEffect(
    useCallback(() => {
      // Reset pagination and load fresh notifications
      setCurrentPage(1);
      setHasMoreData(true);
      loadNotifications(1);
    }, [loadNotifications])
  );

  const handleNotificationPress = async (notification: NotificationItem) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        
        // Update local state
        setNotifications(prev => 
          (prev || []).map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true }
              : n
          )
        );
      }

      // Navigate to relevant screen based on notification type
      // Handle order notifications
      if (notification.type === 'order') {
        // Get orderId from metadata - it can be a string or an object
        let orderId: string | undefined;
        let orderNumber: string | undefined;
        
        const metadata = notification.metadata || {};
        
        // Check if orderId is a string (backend sends it as string)
        if (typeof metadata.orderId === 'string') {
          orderId = metadata.orderId;
        } else if (metadata.orderId && typeof metadata.orderId === 'object') {
          // If orderId is an object, try to get orderNumber from it
          orderNumber = (metadata.orderId as any).orderNumber;
        }
        
        // Also check for direct orderNumber in metadata
        if (typeof metadata.orderNumber === 'string') {
          orderNumber = metadata.orderNumber;
        }
        
        try {
          if (orderId) {
            // Fetch the order details by ID
            const order = await orderService.getOrder(orderId);
            
            // Navigate to order details screen with order data
            router.push({
              pathname: '/other/order-details',
              params: {
                orderData: JSON.stringify(order)
              }
            } as any);
          } else if (orderNumber) {
            // If we only have order number, navigate to orders list
            router.push('/other/my-orders' as any);
          } else {
            // Navigate to orders list
            router.push('/other/my-orders' as any);
          }
        } catch (orderError: any) {
          console.error('Error fetching order:', orderError);
          // Fallback: navigate to orders list
          router.push('/other/my-orders' as any);
          if (orderNumber) {
            showError(`Could not load order #${orderNumber}. Please check your orders.`);
          }
        }
      } else if (notification.type === 'product' && notification.metadata?.productId) {
        // Navigate to product details
        const productId = typeof notification.metadata.productId === 'string' 
          ? notification.metadata.productId 
          : (notification.metadata.productId as any)?.id || (notification.metadata.productId as any)?.name;
        
        if (productId) {
          router.push({
            pathname: '/product-detail',
            params: {
              id: productId
            }
          } as any);
        }
      } else if (notification.metadata?.screen) {
        // Navigate based on screen metadata
        const screen = notification.metadata.screen;
        const metaOrderId = notification.metadata.orderId;
        
        if (screen === 'order-details') {
          // Extract orderId as string
          const orderIdStr = typeof metaOrderId === 'string' 
            ? metaOrderId 
            : (metaOrderId as any)?.toString?.() || (metaOrderId as any)?._id?.toString?.() || undefined;
            
          if (orderIdStr) {
            try {
              const order = await orderService.getOrder(orderIdStr);
              router.push({
                pathname: '/other/order-details',
                params: {
                  orderData: JSON.stringify(order)
                }
              } as any);
            } catch (error) {
              router.push('/other/my-orders' as any);
            }
          } else {
            router.push('/other/my-orders' as any);
          }
        } else if (screen === 'categories') {
          router.push('/(tabs)/categories' as any);
        } else if (screen === 'cart') {
          router.push('/(tabs)/cart' as any);
        } else if (screen === 'profile') {
          router.push('/(tabs)/profile' as any);
        } else {
          router.push('/(tabs)' as any);
        }
      } else {
        // For other notifications, just mark as read (no navigation)
        // Don't show toast
      }
      
    } catch (error: any) {
      console.error('Error handling notification press:', error);
      showError('Failed to open notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAllRead(true);
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        // Update all notifications to read
        setNotifications(prev => 
          (prev || []).map(n => ({ ...n, isRead: true }))
        );
        showSuccess('All notifications marked as read');
      } else {
        showError('Failed to mark all notifications as read');
      }
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      showError(error.message || 'Failed to mark all notifications as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearingAll(true);
      const response = await notificationService.clearAllNotifications();
      
      if (response.success) {
        // Clear all notifications from state
        setNotifications([]);
        setCurrentPage(1);
        setHasMoreData(false);
        showSuccess('All notifications cleared');
      } else {
        showError('Failed to clear all notifications');
      }
    } catch (error: any) {
      console.error('Error clearing all notifications:', error);
      showError(error.message || 'Failed to clear all notifications');
    } finally {
      setClearingAll(false);
    }
  };

  const renderNotificationItem = ({ item, index }: { item: NotificationItem; index: number }) => {
    // Ensure item has required properties
    if (!item || (!item._id && !item.id)) {
      return null;
    }
    return (
      <NotificationItemCard 
        item={item} 
        onPress={handleNotificationPress}
      />
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED_COLOR} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No notifications</Text>
        <Text style={styles.emptyStateMessage}>
          When you receive notifications, they will appear here
        </Text>
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={testConnection}
          >
            <Text style={styles.debugButtonText}>Test Connection</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={RED_COLOR} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <NotificationsHeader 
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
        isLoading={markingAllRead}
        isClearing={clearingAll}
      />
      
      {/* Notifications List */}
      <FlatList
        data={notifications || []}
        renderItem={renderNotificationItem}
        keyExtractor={(item, index) => item._id || item.id || `notification-${index}`}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          (!notifications || notifications.length === 0) && styles.emptyListContainer
        ]}
        style={styles.flatList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[RED_COLOR]}
            tintColor={RED_COLOR}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
      />
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
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  markAllReadText: {
    fontSize: 14,
    color: RED_COLOR,
    fontWeight: '500',
  },

  markAllReadButton: {
    padding: 4,
  },

  clearAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  clearAllButton: {
    padding: 4,
  },

  disabledButton: {
    opacity: 0.5,
  },

  disabledText: {
    color: '#999',
  },

  // FlatList Styles
  flatList: {
    flex: 1,
  },

  listContainer: {
    paddingVertical: 10,
  },

  emptyListContainer: {
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 70,
  },

  // Notification Item Styles
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    position: 'relative',
  },

  unreadIndicator: {
    position: 'absolute',
    left: 10,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED_COLOR,
    transform: [{ translateY: -4 }],
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  contentContainer: {
    flex: 1,
    paddingRight: 10,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },

  unreadTitle: {
    fontWeight: 'bold',
    color: '#000',
  },

  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },

  timestamp: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },

  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },

  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Debug Button Styles (Development only)
  debugButton: {
    backgroundColor: RED_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },

  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;