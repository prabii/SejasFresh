import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useCart } from '../contexts/CartContext';
import { cartService } from '../services/cartService';
import { Product, productService } from '../services/productService';
import { getProductImageSource } from '../data/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // 75% of screen width - reduced
const CARD_HEIGHT = CARD_WIDTH * 0.7; // Rectangular shape (width > height)

export default function BannerSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { incrementCartCount } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPremiumProducts = async () => {
      try {
        setLoading(true);
        const premium = await productService.getProductsByCategory('premium');
        setProducts(premium.slice(0, 5)); // Show more products
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPremiumProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    setAddingId(product._id || product.id);
    try {
      await cartService.addToCart(product._id || product.id, 1);
      incrementCartCount();
    } catch {
      // Error handling
    } finally {
      setAddingId(null);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product-detail?id=${product._id || product.id}` as any);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Exclusive Collection</Text>
        <TouchableOpacity onPress={() => router.push('/other/categories' as any)}>
          <Ionicons name="chevron-forward" size={24} color="#D13635" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D13635" />
          <Text style={styles.loadingText}>Loading exclusive products...</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {products.map((product, index) => (
            <TouchableOpacity
              key={product._id || product.id || index}
              style={styles.cardContainer}
              onPress={() => handleProductPress(product)}
              activeOpacity={0.9}
            >
              <Image
                source={getProductImageSource(product)}
                style={styles.cardImage}
                contentFit="cover"
                placeholder={require('../assets/images/instant-pic.png')}
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={styles.overlay}>
                <View style={styles.contentContainer}>
                  <Text style={styles.productName}>{product.name}</Text>
                  
                  {/* Rating Stars */}
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color="#FFD700"
                        style={styles.star}
                      />
                    ))}
                  </View>
                  
                  {/* Description */}
                  <Text style={styles.description} numberOfLines={2}>
                    {product.description || 'Delighted with rich flavor and premium quality'}
                  </Text>
                  
                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={addingId === (product._id || product.id)}
                  >
                    <Text style={styles.addButtonText}>
                      {addingId === (product._id || product.id) ? 'Adding...' : 'Add to cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingRight: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better text visibility
    justifyContent: 'flex-end',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  productName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    marginRight: 2,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addButton: {
    backgroundColor: '#D13635',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    minWidth: 140,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
