import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const RED_COLOR = '#D13635';
const LIGHT_PINK = '#FFE5E5';
const GREEN_COLOR = '#4CAF50';

// Sample product data
const products = [
  {
    id: "101",
    name: "Beef (With Bone)",
    price: "₹400/kg",
    rating: 4.8,
    deliveryTime: "30 min",
    image: require("../assets/images/instant-pic.png"), // Placeholder - replace with actual beef image
  },
  {
    id: "102",
    name: "Chicken Breast",
    price: "₹300/kg",
    rating: 4.5,
    deliveryTime: "25 min",
    image: require("../assets/images/instant-pic.png"), // Placeholder - replace with actual chicken image
  },
  {
    id: "103",
    name: "Lamb Chops",
    price: "₹600/kg",
    rating: 4.7,
    deliveryTime: "40 min",
    image: require("../assets/images/instant-pic.png"), // Placeholder - replace with actual lamb image
  },
  {
    id: "104",
    name: "Pork Ribs",
    price: "₹500/kg",
    rating: 4.6,
    deliveryTime: "35 min",
    image: require("../assets/images/instant-pic.png"), // Placeholder - replace with actual pork image
  },
];

// Sample recent searches
const recentSearches = [
  { id: 1, text: "Tenderloin", image: require("../assets/images/sejas-logo.png") },
  { id: 2, text: "Chicken Wings", image: require("../assets/images/sejas-logo.png") },
  { id: 3, text: "Lamb Curry Cut", image: require("../assets/images/sejas-logo.png") },
  { id: 4, text: "Beef Steaks", image: require("../assets/images/sejas-logo.png") },
];

const SearchScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [searches, setSearches] = useState(recentSearches);

  const handleBack = () => {
    // Add navigation logic here
  };

  const handleClearSearches = () => {
    setSearches([]);
  };

  const handleAddProduct = (productId: string) => {
  };

  const renderRecentSearchTag = ({ item }: { item: typeof recentSearches[0] }) => (
    <TouchableOpacity style={styles.searchTag}>
      <Image source={item.image} style={styles.tagImage} />
      <Text style={styles.tagText}>{item.text}</Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: { item: typeof products[0] }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddProduct(item.id)}
        >
          <AntDesign name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        
        <View style={styles.productDetails}>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          
          <View style={styles.deliveryContainer}>
            <Ionicons name="time-outline" size={14} color={GREEN_COLOR} />
            <Text style={styles.deliveryText}>{item.deliveryTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Tenderloin Cut"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Searches Section */}
        {searches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={handleClearSearches}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={searches}
              renderItem={renderRecentSearchTag}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tagsContainer}
              columnWrapperStyle={styles.tagRow}
            />
          </View>
        )}

        {/* Recommendation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You might like</Text>
          
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
            columnWrapperStyle={styles.productRow}
          />
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  backButton: {
    marginRight: 15,
  },

  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  searchIcon: {
    marginLeft: 10,
  },

  content: {
    flex: 1,
  },

  section: {
    marginTop: 25,
    paddingHorizontal: 20,
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
    color: '#333',
    marginBottom: 10,
  },

  clearText: {
    fontSize: 16,
    color: RED_COLOR,
    fontWeight: '500',
  },

  tagsContainer: {
    paddingRight: 20,
  },

  tagRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  searchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_PINK,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.48,
  },

  tagImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },

  tagText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  productsContainer: {
    paddingRight: 20,
  },

  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  productCard: {
    flex: 0.48,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  productImageContainer: {
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },

  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: RED_COLOR,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productInfo: {
    padding: 12,
  },

  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: RED_COLOR,
    marginBottom: 8,
  },

  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },

  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryText: {
    fontSize: 14,
    color: GREEN_COLOR,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default SearchScreen;