import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product, productService } from '../services/productService';

// Color constants
const PRIMARY_RED = '#D32F2F';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
const LIGHT_PINK = '#FFF1F1';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SearchResultsScreenProps {
  // Empty interface for future props
}

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = () => {
  const router = useRouter();
  const { q: initialQuery, category } = useLocalSearchParams<{ q: string; category: string }>();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [selectedCategory] = useState(category || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Perform search
  const performSearch = useCallback(async (query: string) => {
    try {
      console.log('Starting search for:', query.trim(), 'Category:', selectedCategory); // Debug log
      setLoading(true);
      setError(null);
      
      let results: Product[] = [];
      
      if (selectedCategory && selectedCategory.trim()) {
        // If category is specified, get products by category
        results = await productService.getProductsByCategory(selectedCategory.trim());
        console.log('Category results:', results, 'Length:', results?.length); // Debug log
      } else if (query.trim()) {
        // Otherwise perform regular search
        results = await productService.searchProducts(query.trim());
        console.log('Search results:', results, 'Length:', results?.length); // Debug log
      }
      
      setProducts(results);
    } catch (error: any) {
      console.error('Search error:', error);
      const errorMessage = error.message || 'Failed to search products. Please try again.';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Handle search input
  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const handleSearchInputSubmit = () => {
    handleSearch();
  };

  // Handle product press
  const handleProductPress = (product: Product) => {
    router.push(`/product-detail?id=${product._id || product.id}` as any);
  };

  // Handle refresh for category or search
  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedCategory || searchQuery.trim()) {
      await performSearch(searchQuery);
    }
    setRefreshing(false);
  };

  // Initial search when component mounts
  useEffect(() => {
    if (initialQuery || category) {
      performSearch(initialQuery || '');
    }
  }, [initialQuery, category, performSearch]);

  // Format price
  const formatPrice = (price: number, discountedPrice?: number) => {
    if (discountedPrice && discountedPrice < price) {
      return (
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>₹{Math.round(discountedPrice)}</Text>
          <Text style={styles.originalPrice}>₹{price}</Text>
        </View>
      );
    }
    return <Text style={styles.price}>₹{price}</Text>;
  };

  // Get product image
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    if (product.image) {
      return product.image;
    }
    return require('../assets/images/instant-pic.png'); // fallback image
  };

  // Render product item
  const renderProductItem = ({ item: product }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={getProductImage(product)}
          style={styles.productImage}
          contentFit="cover"
          placeholder={require('../assets/images/instant-pic.png')}
          transition={200}
          cachePolicy="memory-disk"
        />
        {!product.availability?.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.productMeta}>
          {formatPrice(product.price, product.discountedPrice)}
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>
              {product.ratings?.average?.toFixed(1) || product.rating?.toFixed(1) || '4.5'}
            </Text>
          </View>
        </View>
        
        {product.deliveryTime && (
          <View style={styles.deliveryContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.deliveryTime}>{product.deliveryTime}</Text>
          </View>
        )}
        
        <View style={styles.tagsContainer}>
          {product.tags?.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No products found' : 'Search for products'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `Try searching for something else`
          : 'Enter a search term to find products'
        }
      </Text>
    </View>
  );

  // Error state
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={PRIMARY_RED} />
      <Text style={styles.emptyTitle}>Search Failed</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={20} color="#333" />
        </TouchableOpacity>
        
        {selectedCategory && (
          <Text style={styles.headerTitle}>{selectedCategory}</Text>
        )}
        
        <View style={[styles.searchInputContainer, selectedCategory && styles.searchInputWithTitle]}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchInputSubmit}
            placeholder="Search for products..."
            placeholderTextColor="#999"
            returnKeyType="search"
            autoFocus={!initialQuery}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      {!loading && !error && products.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {products.length} products found
            {selectedCategory && ` in ${selectedCategory}`}
            {searchQuery && !selectedCategory && ` for "${searchQuery}"`}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>Searching products...</Text>
          </View>
        ) : error ? (
          renderErrorState()
        ) : products.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id || item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
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
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LIGHT_PINK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: DARK_GRAY,
    paddingVertical: 12,
  },

  searchButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GRAY,
    marginRight: 12,
  },

  searchInputWithTitle: {
    flex: 1,
  },

  // Results Header
  resultsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  resultsCount: {
    fontSize: 14,
    color: '#666',
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },

  listContainer: {
    padding: 16,
  },

  row: {
    justifyContent: 'space-between',
  },

  // Product Card Styles
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    width: '47%',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  productImageContainer: {
    position: 'relative',
    height: 120,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  outOfStockText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  productInfo: {
    padding: 12,
  },

  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },

  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },

  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_RED,
  },

  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_RED,
    marginRight: 4,
  },

  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },

  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  deliveryTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  tag: {
    backgroundColor: LIGHT_PINK,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },

  tagText: {
    fontSize: 10,
    color: PRIMARY_RED,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },

  // Empty/Error State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  retryButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },

  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchResultsScreen;