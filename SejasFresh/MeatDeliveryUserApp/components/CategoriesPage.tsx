import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';
import { cartService } from '../services/cartService';
import { Product, productService } from '../services/productService';
import { useToast } from './ui/ToastProvider';
import { getProductImage } from '../data/mockData';

const RED_COLOR = '#D13635';
const { width } = Dimensions.get('window');
const THUMBNAIL_GAP = 15; // Gap between thumbnails
// Calculate to show exactly 3 images with equal left/right padding
// Formula: screenWidth = 2*padding + 3*thumbnailWidth + 2*gap
// We want equal padding on both sides, so: padding = (screenWidth - 3*thumbnailWidth - 2*gap) / 2
// Set a reasonable thumbnail width, then calculate equal padding
const THUMBNAIL_WIDTH = Math.floor((width - 2 * 20 - 2 * THUMBNAIL_GAP) / 3); // Approximate width for 3 items
const SIDE_PADDING = Math.floor((width - 3 * THUMBNAIL_WIDTH - 2 * THUMBNAIL_GAP) / 2); // Equal padding on both sides

// Category sections matching Figma design
interface CategorySection {
  title: string;
  products: {
    name: string;
    product?: Product;
  }[];
}

// Header Component
const Header: React.FC<{ onCartPress: () => void }> = ({ onCartPress }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Categories</Text>
      
      <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
        <Ionicons name="cart" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// SearchBar Component
const SearchBar: React.FC<{ searchText: string; setSearchText: (text: string) => void }> = ({ searchText, setSearchText }) => {
  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for Categories"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );
};

// Get product image with proper URL construction
const getProductImageSource = (product?: Product, productName?: string): any => {
  if (product) {
    let imageUrl: string | null = null;
    
    // Try images array first
    if (product.images && product.images.length > 0) {
      imageUrl = product.images[0]?.url || null;
    }
    
    // Fallback to single image field
    if (!imageUrl && product.image) {
      imageUrl = product.image;
    }
    
    if (imageUrl) {
      // Check if it's already a full URL (from backend)
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Ensure HTTPS for Render backend
        const normalizedUrl = imageUrl.replace('http://meat-delivery-backend.onrender.com', 'https://meat-delivery-backend.onrender.com');
        return { uri: normalizedUrl };
      }
      
      // Construct full URL from backend
      const { getCurrentConfig } = require('../config/api');
      const config = getCurrentConfig();
      const baseUrl = config.API_URL.replace('/api', '');
      
      // Ensure baseUrl uses HTTPS for Render
      const httpsBaseUrl = baseUrl.replace('http://meat-delivery-backend.onrender.com', 'https://meat-delivery-backend.onrender.com');
      
      // Handle different URL formats
      if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
        const cleanPath = imageUrl.replace(/^\/?uploads\//, '');
        return { uri: `${httpsBaseUrl}/uploads/${cleanPath}` };
      } else if (imageUrl.startsWith('/')) {
        return { uri: `${httpsBaseUrl}${imageUrl}` };
      } else {
        return { uri: `${httpsBaseUrl}/uploads/${imageUrl}` };
      }
    }
  }
  
  // Fallback to default image or mock data image
  if (productName) {
    return getProductImage(productName);
  }
  
  return require('../assets/images/instant-pic.png');
};

// Product Thumbnail Component
const ProductThumbnail: React.FC<{ 
  productName: string; 
  product?: Product;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ productName, product, onPress, isFirst, isLast }) => {
  const imageSource = getProductImageSource(product, productName);

  return (
    <TouchableOpacity 
      style={[
        styles.thumbnail,
        isFirst && styles.firstThumbnail,
        isLast && styles.lastThumbnail
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource}
          style={styles.thumbnailImage}
          contentFit="cover"
          placeholder={require('../assets/images/instant-pic.png')}
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={product?._id || productName}
        />
      </View>
      <Text style={styles.thumbnailLabel} numberOfLines={2}>
        {productName}
      </Text>
    </TouchableOpacity>
  );
};

// Category Section Component
const CategorySection: React.FC<{ 
  section: CategorySection;
  onProductPress: (product: Product | null, productName: string) => void;
}> = ({ section, onProductPress }) => {
  return (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{section.title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        style={styles.horizontalScroll}
        bounces={true}
        alwaysBounceHorizontal={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
      >
        {section.products.map((item, itemIndex) => (
          <ProductThumbnail
            key={`${item.product?._id || item.product?.id || item.name}-${itemIndex}`}
            productName={item.name}
            product={item.product}
            onPress={() => onProductPress(item.product || null, item.name)}
            isFirst={itemIndex === 0}
            isLast={itemIndex === section.products.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Main CategoriesPage Component
const CategoriesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const router = useRouter();
  const { refreshCartCount } = useCart();
  const { showSuccess, showError } = useToast();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getAllProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper to find product by name
  const findProductByName = (name: string): Product | undefined => {
    return allProducts.find(p => 
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(p.name.toLowerCase())
    );
  };

  // Organize products by category and subcategory
  const organizeProductsByCategory = () => {
    const organized: Record<string, Record<string, Product[]>> = {
      premium: {},
      normal: {},
      exclusive: {},
    };

    allProducts.forEach((product) => {
      if (!product.isActive) return;
      
      const category = product.category || 'normal';
      if (!['premium', 'normal', 'exclusive'].includes(category)) return;

      const subcategory = product.subcategory || 'Uncategorized';
      if (!organized[category][subcategory]) {
        organized[category][subcategory] = [];
      }
      organized[category][subcategory].push(product);
    });

    return organized;
  };

  const organizedProducts = organizeProductsByCategory();

  // Build category sections dynamically
  const categorySections: CategorySection[] = [];

  // Premium Cuts
  if (Object.keys(organizedProducts.premium).length > 0) {
    categorySections.push({
      title: 'Premium Cuts',
      products: Object.values(organizedProducts.premium)
        .flat()
        .slice(0, 9)
        .map((product) => ({ name: product.name, product })),
    });

    // Add subcategory sections for Premium
    Object.entries(organizedProducts.premium).forEach(([subcat, products]) => {
      if (products.length > 0) {
        categorySections.push({
          title: `Premium - ${subcat.charAt(0).toUpperCase() + subcat.slice(1)}`,
          products: products.slice(0, 6).map((product) => ({ name: product.name, product })),
        });
      }
    });
  }

  // Instant Deliverables
  if (Object.keys(organizedProducts.normal).length > 0) {
    categorySections.push({
      title: 'Instant Deliverables',
      products: Object.values(organizedProducts.normal)
        .flat()
        .slice(0, 9)
        .map((product) => ({ name: product.name, product })),
    });

    // Add subcategory sections for Normal
    Object.entries(organizedProducts.normal).forEach(([subcat, products]) => {
      if (products.length > 0) {
        categorySections.push({
          title: `Instant - ${subcat.charAt(0).toUpperCase() + subcat.slice(1)}`,
          products: products.slice(0, 6).map((product) => ({ name: product.name, product })),
        });
      }
    });
  }

  // Exclusive Collection
  if (Object.keys(organizedProducts.exclusive).length > 0) {
    categorySections.push({
      title: 'Exclusive Collection',
      products: Object.values(organizedProducts.exclusive)
        .flat()
        .slice(0, 9)
        .map((product) => ({ name: product.name, product })),
    });

    // Add subcategory sections for Exclusive
    Object.entries(organizedProducts.exclusive).forEach(([subcat, products]) => {
      if (products.length > 0) {
        categorySections.push({
          title: `Exclusive - ${subcat.charAt(0).toUpperCase() + subcat.slice(1)}`,
          products: products.slice(0, 6).map((product) => ({ name: product.name, product })),
        });
      }
    });
  }

  // Handle product press
  const handleProductPress = (product: Product | null, productName: string) => {
    if (product) {
      router.push(`/product-detail?id=${product._id || product.id}` as any);
    } else {
      // Search for the product
      router.push(`/search-results?q=${encodeURIComponent(productName)}` as any);
    }
  };

  // Handle cart press
  const handleCartPress = () => {
    router.push('/cart' as any);
  };

  // Filter sections based on search
  const filteredSections = searchText
    ? categorySections.filter(section =>
        section.title.toLowerCase().includes(searchText.toLowerCase()) ||
        section.products.some(p => p.name.toLowerCase().includes(searchText.toLowerCase()))
      )
    : categorySections;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onCartPress={handleCartPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED_COLOR} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header onCartPress={handleCartPress} />
      
      {/* SearchBar */}
      <SearchBar searchText={searchText} setSearchText={setSearchText} />
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSections.map((section, index) => (
          <CategorySection
            key={index}
            section={section}
            onProductPress={handleProductPress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: RED_COLOR,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 25,
    paddingBottom: 15,
    width: '100%',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  productsGrid: {
    paddingHorizontal: 15,
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  horizontalScroll: {
    marginHorizontal: 0,
    width: '100%',
  },
  horizontalScrollContent: {
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
    paddingVertical: 5,
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    alignItems: 'center',
    flexShrink: 0,
    marginRight: THUMBNAIL_GAP,
  },
  firstThumbnail: {
    marginLeft: 0,
  },
  lastThumbnail: {
    marginRight: 0,
  },
  emptyThumbnail: {
    width: THUMBNAIL_WIDTH,
  },
  imageContainer: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_WIDTH,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 0,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CategoriesPage;
