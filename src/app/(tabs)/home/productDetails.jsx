import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppCalls from "../../../utils/network";
import { useCart } from "../../../context/CartContext";
import { colors } from "../../../theme/theme";
import { showToast } from "../../../utils/toast";
import SEO from "../../../components/SEO";

const { width } = Dimensions.get("window");

const ProductDetailsScreen = () => {
  const navigation = useRouter();
  const { productId } = useLocalSearchParams();

  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const flatListRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const slideHeight = Math.min(sliderWidth * 0.8, 450);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const addTofavorite = async (productId) => {
    if (!productId) return null;
    try {
      const res = await AppCalls.post("/favorite/", {
        productId,
      });
      showToast(
        "success",
        "Product favorited!",
        "You can add to cart and pruchase later.",
      );
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        error.message || "Failed to add favorite",
        "Please try again.",
      );
    } finally {
    }
  };

  const loadProductDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await AppCalls.get("/products/" + productId);
      setProduct(res.data);
    } catch (err) {
      setError(err.messag || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const selectImage = (index) => {
    setSelectedImageIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== selectedImageIndex) {
      setSelectedImageIndex(index);
    }
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.lime} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadProductDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SEO 
        title={`${product.name} | Camshop Busitema University`}
        description={`Buy ${product.name} from ${product.vendor.name}. Fast campus delivery available.`}
      />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#334155" />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image Slider Section */}
        <View
          style={styles.imageSection}
          onLayout={(event) => {
            // Captures the exact width of this container, respecting any maxWidth
            setSliderWidth(event.nativeEvent.layout.width);
          }}
        >
          {/* Only render the slider once we have the container width */}
          {sliderWidth > 0 && (
            <FlatList
              ref={flatListRef}
              data={product.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => `image-${index}`}
              renderItem={({ item }) => (
                // Apply the dynamic width directly to the slide { width: sliderWidth, height: slideHeight }
                <View
                  style={[
                    styles.imageSlide,
                    { width: sliderWidth, height: slideHeight },
                  ]}
                >
                  <View style={styles.imageBorderContainer}>
                    <Image
                      source={{ uri: item }}
                      style={styles.mainImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
            />
          )}

          {/* Image Indicator Dots */}
          <View style={styles.dotsContainer}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  selectedImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Thumbnail Navigation */}
          <View style={styles.thumbnailsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsScroll}
            >
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnailWrapper,
                    selectedImageIndex === index &&
                      styles.thumbnailWrapperActive,
                  ]}
                  onPress={() => selectImage(index)}
                >
                  <Image
                    source={{ uri: image }}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive,
                    ]}
                    resizeMode="cover"
                  />
                  {selectedImageIndex === index && (
                    <View style={styles.thumbnailOverlay} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={colors.lime} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.reviewsText}>({product.reviews} Reviews)</Text>
          </View>

          {/* Price and Meta */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>Location</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{product.vendor.address}</Text>
            </View>
          </View>

          {/* Vendor Info */}
          <View style={styles.vendorContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.push(
                  "home/vendorDetails?vendorId=" + product.vendor.id,
                )
              }
              style={styles.vendorInfo}
            >
              <View style={styles.vendorAvatar}>
                <Text style={styles.vendorAvatarText}>
                  {product.vendor.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.vendorName}>{product.vendor.name}</Text>
                <View style={styles.vendorBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                  <Text style={styles.vendorBadgeText}>
                    Verified Campus Vendor
                    {/* {product.vendor.verified ? "Verified" : ""}{" "}
                    {product.vendor.type} */}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#0ea5e9" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          {product.categories.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name={feature.category.image}
                  size={16}
                  color={colors.lime}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.category.name}</Text>
                <Text style={styles.featureDescription}>
                  {feature.category.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <View style={styles.deliveryContainer}>
            <Ionicons name="location-outline" size={24} color="#0ea5e9" />
            <Text style={styles.deliveryText}>
              {product.delivery ||
                "Free delivery within 24 hours to all campus halls."}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              styles.buyNowButton,
              { marginLeft: 8 },
            ]}
            onPress={() => addTofavorite(product.id)}
          >
            <Ionicons name="heart-outline" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              styles.buyNowButton,
              { marginLeft: 8 },
            ]}
            onPress={() => addToCart(product.id, product.vendorId)}
          >
            <Ionicons name="cart-outline" size={22} color={colors.white} />
            <Text style={styles.buyNowText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#334155",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.lime,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  shareButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  // Image Section
  imageSection: {
    backgroundColor: "#f8fafc",
  },
  imageSlide: {
    // Width and height are now entirely handled by inline styles
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16, // Adjusted slightly to ensure border fits well
    paddingVertical: 10,
  },
  imageBorderContainer: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#F97316",
    borderRadius: 12,
    padding: 8,
    backgroundColor: "#ffffff",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cccccc",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.lime,
    width: 24,
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  thumbnailsScroll: {
    gap: 8,
  },
  thumbnailWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },
  thumbnailWrapperActive: {
    borderColor: colors.lime,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailActive: {
    opacity: 0.7,
  },
  thumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  // Product Info
  productInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: "#666666",
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.lime,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    color: "#666666",
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666666",
    marginHorizontal: 8,
  },
  // vendor Info
  vendorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  vendorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  vendorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vendorAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.lime,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 2,
  },
  vendorBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  vendorBadgeText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  messageButtonText: {
    fontSize: 14,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  // Section
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 24,
  },
  // Features
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666666",
  },
  // Delivery
  deliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  deliveryText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  // Action Buttons
  actionContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.lime,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: colors.lime,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ProductDetailsScreen;
