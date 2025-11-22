import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

interface ProductCardProps {
  name: string;
  price: string;
  rating: string;
  time: string;
  image?: any;
  onAdd?: () => void;
}

export default function ProductCard({
  name,
  price,
  rating,
  time,
  image,
  onAdd,
}: ProductCardProps) {
  return (
    <View style={styles.card}>
      {/* Product Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={image || require("../assets/images/instant-pic.png")}
          style={styles.image}
          contentFit="cover"
          placeholder={require("../assets/images/instant-pic.png")}
          transition={200}
          cachePolicy="memory-disk"
        />

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <View>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={11} color="#FFD700" />
            <Text style={styles.rating}>{rating}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons
              name="time-outline"
              size={11}
              color="#4CAF50"
            />
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 180, // More square/rectangular shape
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120, // Fixed height for square look
    backgroundColor: "#f5f5f5",
    padding: 6,
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  addButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#D13635",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  info: {
    padding: 8,
    paddingTop: 6,
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#D13635",
    fontWeight: "700",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rating: {
    fontSize: 11,
    marginLeft: 3,
    color: "#333",
    fontWeight: "600",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  time: {
    fontSize: 11,
    marginLeft: 3,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
