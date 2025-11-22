
import BannerCarousel from "@/components/BannerCarousel";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Image } from "expo-image";
import { getProductImageSource } from "../../data/mockData";
import { SafeAreaView } from 'react-native-safe-area-context';
import BannerSection from "../../components/BannerSection";
import ProductCard from "../../components/ProductCard";
import SessionMonitor from "../../components/SessionMonitor";
import { getCurrentConfig } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from '../../contexts/CartContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { Address, addressService } from "../../services/addressService";
import { Product, productService } from "../../services/productService";
import { cartService } from "../../services/cartService";
import { orderService } from "../../services/orderService";
import { notificationService } from "../../services/notificationService";
import { couponService } from "../../services/couponService";
import { authService } from "../../services/authService";







export default function HomeScreen() {
  const { isAuthenticated } = useAuth();

    // Fetch all services on app reload/mount (only if authenticated)
  useEffect(() => {
    // Only fetch protected services if user is authenticated
    if (!isAuthenticated) {
      return; // Don't fetch protected endpoints if not logged in
    }

    // Fetch non-critical services in parallel without blocking UI
    const fetchAllServices = async () => {
      try {
        // Use static imports - call services directly without dynamic imports
        // Call common exported methods if present
        // Only call protected endpoints if authenticated
        addressService.getSavedAddresses().catch(() => {});
        productService.getAllProducts().catch(() => {});
        cartService.getCart().catch(() => {});
        
        // Protected endpoints - only call if authenticated
        if (isAuthenticated) {
          orderService.getUserOrders().catch(() => {});
          notificationService.getNotifications().catch(() => {});
          couponService.getActiveCoupons().catch(() => {});
          authService.getMe().catch(() => {});
        }
      } catch (error) {
        // Silently handle errors - don't show to user
        console.debug('Error fetching services:', error);
      }
    };
    fetchAllServices();
  }, [isAuthenticated]);
  // Always fetch /api/addresses when homepage opens
  useEffect(() => {
    const fetchAllAddresses = async () => {
      try {
        const API_BASE_URL = getCurrentConfig().API_URL;
        const token = await authService.getToken();
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        await fetch(`${API_BASE_URL}/addresses`, {
          method: 'GET',
          headers,
        });
        // You can use the response if needed
      } catch (error) {
        console.error('Error fetching all addresses:', error);
      }
    };
    fetchAllAddresses();
  }, []);
  const router = useRouter();
  const { user } = useAuth();
  const { incrementCartCount } = useCart();
  const { unreadCount } = useNotificationContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [loadingPremium, setLoadingPremium] = useState(true);
  const [instantProducts, setInstantProducts] = useState<Product[]>([]);
  const [loadingInstant, setLoadingInstant] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch premium products on component mount
  useEffect(() => {
    const fetchPremiumProducts = async () => {
      try {
        setLoadingPremium(true);
        const products = await productService.getProductsByCategory("premium");
        // Limit to 4 products for the grid
        setPremiumProducts(products);
      } catch (error) {
        console.error("Error fetching premium products:", error);
        // Set empty array if fetch fails
        setPremiumProducts([]);
      } finally {
        setLoadingPremium(false);
      }
    };

    fetchPremiumProducts();
  }, []);

  // Fetch instant delivery products - Get products with category 'normal' (Instant Deliverables)
  useEffect(() => {
    const fetchInstantProducts = async () => {
      try {
        setLoadingInstant(true);
        const allProducts = await productService.getAllProducts();
        
        // Filter for Instant Deliverables (category === 'normal' and isActive)
        const instantProductsList = allProducts
          .filter(p => 
            p.category === 'normal' && 
            p.isActive !== false
          )
          .slice(0, 4); // Get first 4 products
        
        setInstantProducts(instantProductsList);
      } catch (error) {
        console.error("Error fetching instant products:", error);
        // Set empty array if fetch fails
        setInstantProducts([]);
      } finally {
        setLoadingInstant(false);
      }
    };

    fetchInstantProducts();
  }, []);

  // Function to fetch user's default address
  const fetchDefaultAddress = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setCurrentAddress(null);
      return;
    }

    try {
      setLoadingAddress(true);
      let defaultAddress = await addressService.getDefaultAddress();
      // If no default address, try to fetch all and use the first one
      if (!defaultAddress) {
        const allAddresses = await addressService.getSavedAddresses();
        if (allAddresses && allAddresses.length > 0) {
          defaultAddress = allAddresses[0];
        }
      }
      setCurrentAddress(defaultAddress);
    } catch (error) {
      console.error("Error fetching default address:", error);
      setCurrentAddress(null);
    } finally {
      setLoadingAddress(false);
    }
  }, [user, isAuthenticated]);


  // Fetch user's default address when user changes or on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDefaultAddress();
    } else {
      setCurrentAddress(null);
    }
  }, [isAuthenticated, user, fetchDefaultAddress]);

  const handleNotificationPress = () => {
    // Refresh notifications before navigating
    const { useNotificationContext } = require('../../contexts/NotificationContext');
    // Note: Can't use hooks here, but the polling will catch it
    router.push('/other/notifications');
  };



  // Handle search input change with debounce for suggestions
  useEffect(() => {
    const query = searchQuery.trim();
    
    // Immediately show/hide suggestions based on query length
    if (query.length >= 2) {
      setShowSuggestions(true);
      // Debounce the actual API call
      const timer = setTimeout(() => {
        loadSearchSuggestions(query);
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const loadSearchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      setSearchLoading(true);
      setShowSuggestions(true); // Show container while loading
      const results = await productService.searchProducts(query);
      setSearchSuggestions(results.slice(0, 5)); // Show top 5 suggestions
      setShowSuggestions(true); // Keep showing if we have results or are still loading
    } catch (error) {
      console.error('Error loading search suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/search-results?q=${encodeURIComponent(searchQuery.trim())}` as any);
    }
  };

  const handleSearchInputSubmit = () => {
    handleSearch();
  };

  const handleSuggestionPress = (product: Product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    router.push(`/product-detail?id=${product._id || product.id}` as any);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
      // If we have suggestions already, show them. Otherwise, trigger a search
      if (searchSuggestions.length === 0) {
        loadSearchSuggestions(searchQuery.trim());
      }
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for suggestion press
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handlePremiumProductPress = (product: Product) => {
    router.push(`/product-detail?id=${product._id || product.id}` as any);
  };


  // Add to cart handler for instant products
  const handleAddInstantProductToCart = async (product: Product) => {
    try {
      // Add 1 quantity by default
      cartService.addToCart(product._id || product.id, 1);
      incrementCartCount();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Optionally show a toast or alert
    }
  };

  // Helper function to get address label with fallback
  const getAddressLabel = () => {
    if (currentAddress?.label) {
      return `${currentAddress.label} • `;
    }
    return '';
  };

  // Helper function to format user location
  const getLocationText = () => {
    // Show loading if address is being fetched
    if (loadingAddress) {
      return "Loading...";
    }

    // If we have a fetched default address from backend, use it
    if (currentAddress) {
      const { city, state, zipCode, street, label } = currentAddress;
      
      // Show a more complete address format for default address
      if (city && state) {
        return `${getAddressLabel()}${city}, ${state} ${zipCode || ''}`.trim();
      } else if (city && zipCode) {
        return `${getAddressLabel()}${city}, ${zipCode}`;
      } else if (city) {
        return `${getAddressLabel()}${city}`;
      } else if (street) {
        // If only street is available, show a truncated version
        const truncatedStreet = street.length > 25 ? `${street.substring(0, 25)}...` : street;
        return `${getAddressLabel()}${truncatedStreet}`;
      } else if (label) {
        return label;
      }
    }

    // Fallback to user profile data if available
    if (user?.city && user?.zipCode) {
      return `${user.city}, ${user.zipCode}`;
    }
    
    if (user?.city) {
      return user.city;
    }
    
    if (user?.address) {
      if (typeof user.address === 'string') {
        return user.address.length > 30 ? `${user.address.substring(0, 30)}...` : user.address;
      }
      
      // Handle address object
      const addressObj = user.address as any;
      const city = addressObj.city || '';
      const location = addressObj.zipCode || addressObj.state || '';
      
      if (city && location) {
        return `${city}, ${location}`;
      } else if (city) {
        return city;
      } else if (location) {
        return location;
      }
    }
    
    // Default fallback - encourage user to add address
    return "Add your address";
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <SessionMonitor />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Location + Notifications */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location-sharp" size={18} color="#fff" />
            </View>
            <View style={styles.locationTextContainer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.locationText}>Current location</Text>
                <Ionicons name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.cityText} numberOfLines={1}>
                {loadingAddress 
                  ? "Loading..." 
                  : currentAddress && (currentAddress.city || currentAddress.zipCode || currentAddress.street) 
                    ? (() => {
                        const parts = [];
                        if (currentAddress.label) parts.push(currentAddress.label);
                        if (currentAddress.city) parts.push(currentAddress.city);
                        if (currentAddress.state) parts.push(currentAddress.state);
                        if (currentAddress.zipCode) parts.push(currentAddress.zipCode);
                        return parts.length > 0 ? parts.join(', ') : (currentAddress.street || 'Add your address');
                      })()
                    : getLocationText()
                }
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress} 
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            placeholder="Search for Tenderloin Cut"
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchInputSubmit}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && searchQuery.trim().length >= 2 && (
          <View style={styles.suggestionsContainer}>
            {searchLoading ? (
              <View style={styles.suggestionItem}>
                <ActivityIndicator size="small" color="#D13635" />
                <Text style={styles.suggestionText}>Searching...</Text>
              </View>
            ) : searchSuggestions.length > 0 ? (
              <>
                <Text style={styles.suggestionsTitle}>Suggestions</Text>
                {searchSuggestions.map((product) => (
                  <TouchableOpacity
                    key={product._id || product.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(product)}
                  >
                    <Ionicons name="search-outline" size={16} color="#666" style={styles.suggestionIcon} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {product.discountedPrice && (
                      <Text style={styles.suggestionPrice}>
                        ₹{product.discountedPrice}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.suggestionItem, styles.viewAllItem]}
                  onPress={handleSearch}
                >
                  <Text style={styles.viewAllText}>
                    View all results for "{searchQuery}"
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#D13635" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>No results found</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Banner */}
      <BannerCarousel />


      {/* Premium Cuts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.sectionTitle}>Premium Cuts</Text>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>(Pre-Orders Only)</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/other/categories' as any)}>
            <Ionicons name="chevron-forward" size={24} color="#D13635" />
          </TouchableOpacity>
        </View>

        {loadingPremium ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D13635" />
            <Text style={styles.loadingText}>Loading premium cuts...</Text>
          </View>
        ) : premiumProducts.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.premiumScrollContent}
          >
            {premiumProducts.map((product, index) => (
              <TouchableOpacity 
                key={`premium-${product._id || product.id || index}`} 
                style={styles.premiumCard}
                onPress={() => handlePremiumProductPress(product)}
              >
                <View style={styles.premiumImageContainer}>
                  <Image
                    source={getProductImageSource(product)}
                    style={styles.premiumImage}
                    contentFit="cover"
                    placeholder={require("../../assets/images/categories-demo.png")}
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </View>
                <Text style={styles.premiumText} numberOfLines={1}>
                  {product.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No premium cuts available</Text>
          </View>
        )}
      </View>

      {/* Instant Deliverables */}
      <View style={styles.section}>
        <LinearGradient
          colors={["#D13635", "#FFFFFF"]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradientBackground}
        >
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.sectionTitle}>Instant Deliverables</Text>
              <Text style={styles.lightningIcon}>⚡</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/other/categories' as any)}>
              <Ionicons name="chevron-forward" size={24} color="#D13635" />
            </TouchableOpacity>
          </View>

          {loadingInstant ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D13635" />
              <Text style={styles.loadingText}>Loading instant products...</Text>
            </View>
          ) : instantProducts.length > 0 ? (
            <View style={styles.instantGridContainer}>
              {/* Row 1 */}
              <View style={styles.instantRow}>
                {instantProducts.slice(0, 2).map((product, index) => (
                  <View 
                    key={`instant-row0-${index}-${product._id || product.id || `prod-${index}`}`} 
                    style={styles.instantCard}
                  >
                    <ProductCard
                      name={product.name}
                      price={`₹${parseInt((product.discountedPrice || product.price).toString(), 10)}/kg`}
                      rating={String(product.ratings?.average || product.rating || 4.8)}
                      time="30 min"
                      image={getProductImageSource(product)}
                      onAdd={() => handleAddInstantProductToCart(product)}
                    />
                  </View>
                ))}
              </View>
              {/* Row 2 */}
              <View style={styles.instantRow}>
                {instantProducts.slice(2, 4).map((product, index) => (
                  <View 
                    key={`instant-row1-${index}-${product._id || product.id || `prod-${index + 2}`}`} 
                    style={styles.instantCard}
                  >
                    <ProductCard
                      name={product.name}
                      price={`₹${parseInt((product.discountedPrice || product.price).toString(), 10)}/kg`}
                      rating={String(product.ratings?.average || product.rating || 4.8)}
                      time="30 min"
                      image={getProductImageSource(product)}
                      onAdd={() => handleAddInstantProductToCart(product)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No instant products available</Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Exclusive Collection: Only data from premium category */}
      <BannerSection />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#D13635",
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 60,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  locationText: { 
    fontSize: 11, 
    color: "#fff",
    fontWeight: "400",
  },
  cityText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#fff",
    marginTop: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#D13635",
  },
  notificationBadgeText: {
    color: "#D13635",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    position: "relative",
    backgroundColor: "#D13635",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    justifyContent: "center",
  },
  // Premium Cuts - Horizontal Scroll with Circular Images
  premiumScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
  },
  premiumCard: {
    alignItems: "center",
    marginRight: 15,
    width: 90,
  },
  premiumImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  premiumImage: {
    width: "100%",
    height: "100%",
    borderRadius: 41,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#1a1a1a",
  },
  pillBadge: {
    backgroundColor: "#D13635",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  lightningIcon: {
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  searchInputWrapper: {
    position: "relative",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1000,
    overflow: "hidden",
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  suggestionPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D13635",
    marginLeft: 8,
  },
  viewAllItem: {
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 0,
  },
  viewAllText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#D13635",
  },
  gradientBackground: {
    padding: 12,
  },
  instantGridContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  instantRow: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 15,
  },
  instantCard: {
    flex: 1,
    maxWidth: (Dimensions.get('window').width - 55) / 2, // 2 columns with gap
    minHeight: 180, // Ensure minimum height for square cards
  },

  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingLeft: 38,
    paddingRight: 50,
    color: "#222",
    height: 56,
    fontSize: 16,
  },
  searchIconContainer: {
    position: "absolute",
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    width: 40,
    paddingRight: 8,
  },
  searchIcon: {
    // Icon styling handled by parent container
  },
  banner: { marginHorizontal: 15, marginBottom: 20, marginTop: 10 },
  bannerImage: { width: "100%", height: 160, borderRadius: 10 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  sectionSub: { color: "#d62828", fontSize: 12 },
});
