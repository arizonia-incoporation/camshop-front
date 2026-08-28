import React, { useState, useEffect } from "react";
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
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppCalls from "../../../utils/network";
import { colors } from "../../../theme/theme";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import EmptyState from "../../../components/cards/emptyCard";

const VendorProfileScreen = () => {
  const navigation = useRouter();
  const { vendorId } = useLocalSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Low-High");
  const [loadingMore, setLoadingMore] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  useEffect(() => {
    loadVendorProfile();
  }, [vendorId]);

  const loadVendorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AppCalls.get("/vendors/" + vendorId);
      setVendor(res.data);
    } catch (err) {
      setError(err.message || "Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // API call to follow/unfollow
    Alert.alert(
      isFollowing ? "Unfollowed" : "Followed",
      isFollowing
        ? `You have unfollowed ${vendor.shopName}`
        : `You are now following ${vendor.shopName}`,
    );
  };

  const handleMessage = () => {
    Alert.alert("Message", `Start a conversation with ${vendor.shopName}`);
  };

  const handleAddToCart = async (id) => {
    setAddingCart(true);
    try {
      await addToCart(id);
    } catch (error) {
      console.log(error);
    } finally {
      setAddingCart(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading more products
    setTimeout(() => {
      setLoadingMore(false);
      Alert.alert("More Products", "Loading more products...");
    }, 1500);
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  const renderTopProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.push("home/productDetails?productId=" + item?.id)}
      style={styles.topProductCard}
    >
      <View style={styles.topProductImageContainer}>
        <Image source={{ uri: item?.image }} style={styles.topProductImage} />
      </View>
      <View style={styles.topProductInfo}>
        <Text style={styles.topProductName}>{item?.name}</Text>
        <Text style={styles.topProductPrice}>{formatPrice(item?.price)}</Text>
        <Text style={styles.topProductDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(item?.id)}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAllProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.push("home/productDetails?productId=" + item?.id)
      }
      style={styles.productItem}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>Category: {item.category}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() =>
          user?.vendor?.id === vendor.id
            ? navigation.push()
            : handleAddToCart(item?.id)
        }
      >
        {user?.vendor?.id === vendor.id ? (
          <Text style={styles.addToCartText}>Edit</Text>
        ) : addingCart ? (
          <Text style={styles.addToCartText}>Adding Cart</Text>
        ) : (
          <Text style={styles.addToCartText}>Add to Cart</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.lime} />
        <Text style={styles.loadingText}>Loading vendor profile...</Text>
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
          onPress={loadVendorProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Busitema Market</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#334155" />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: vendor.image }} style={styles.coverImage} />
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: vendor.image }} style={styles.profileImage} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{vendor.name}</Text>
            <Text style={styles.shopName}>{vendor.address}</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{vendor.description}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>RATING</Text>
            <Text style={styles.statValue}>
              {Math.floor(vendor.stars || 0)} ★
            </Text>
            <Text style={styles.statSubtext}>
              ({vendor._count.ratings} reviews)
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>MEMBER SINCE</Text>
            <Text style={styles.statValue}>
              {new Date(vendor.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PRODUCTS</Text>
            <Text style={styles.statValue}>{vendor._count.products}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={handleMessage}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#0ea5e9" />
            <Text style={styles.messageButtonText}>MESSAGE SELLER</Text>
            <View style={styles.actionBadge}></View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.followButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={handleFollow}
          >
            <Ionicons
              name={isFollowing ? "checkmark-circle" : "person-add-outline"}
              size={20}
              color={isFollowing ? "#22c55e" : colors.lime}
            />
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "FOLLOWING" : "FOLLOW"}
            </Text>
            <View style={styles.actionBadge}></View>
          </TouchableOpacity>
        </View>

        {/* Top Products Section */}
        {vendor?.products?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            <FlatList
              data={[vendor.products[0]]}
              renderItem={renderTopProduct}
              keyExtractor={(item) => `top-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.topProductsList}
            />
          </View>
        )}

        {/* All Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            {/* <View style={styles.filterContainer}>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>
                  Category: {selectedCategory}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Price: {sortBy}</Text>
                <Ionicons name="chevron-down" size={16} color="#666666" />
              </TouchableOpacity>
            </View> */}
          </View>

          <FlatList
            data={vendor.products}
            renderItem={renderAllProduct}
            keyExtractor={(item) => `all-${item.id}`}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <EmptyState
                variant="orders"
                onButtonPress={() => navigation.push("/home")}
              />
            }
          />

          {vendor?.products?.length > vendor._count.products && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color={colors.lime} size="small" />
              ) : (
                <Text style={styles.loadMoreText}>LOAD MORE PRODUCTS</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
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
    color: colors.danger,
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
  coverContainer: {
    height: 120,
    backgroundColor: "#f8fafc",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#fef3c7",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileInfo: {
    marginLeft: 16,
    marginTop: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
  },
  shopName: {
    fontSize: 16,
    color: colors.lime,
    fontWeight: "500",
  },
  bioContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#999999",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  statSubtext: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e5e5",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    position: "relative",
  },
  messageButton: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  messageButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0ea5e9",
  },
  followButton: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: colors.lime,
  },
  followingButton: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.lime,
  },
  followingButtonText: {
    color: "#22c55e",
  },
  actionBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  actionBadgeText: {
    fontSize: 10,
    color: "#666666",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  filterText: {
    fontSize: 12,
    color: "#666666",
  },
  topProductsList: {
    gap: 12,
  },
  topProductCard: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  topProductImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  topProductImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  topProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  topProductPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    marginBottom: 4,
  },
  topProductDescription: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
  },
  addToCartButton: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.lime,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  loadMoreButton: {
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    letterSpacing: 0.5,
  },
});

export default VendorProfileScreen;
