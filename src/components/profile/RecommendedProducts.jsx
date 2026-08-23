// app/(profile)/components/RecommendedProducts.js
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const RecommendedProducts = ({ products }) => {
  const router = useRouter();

  if (!products || products.length === 0) {
    return null;
  }

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>You May Like</Text>
        <TouchableOpacity onPress={() => router.push("/listing?type=products")}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() =>
              router.push(`/product-details?productId=${product.id}`)
            }
          >
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>
                {formatPrice(product.price)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  seeAllText: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  scroll: {
    flexDirection: "row",
  },
  productCard: {
    width: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  productImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f8fafc",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
  },
});

export default RecommendedProducts;
