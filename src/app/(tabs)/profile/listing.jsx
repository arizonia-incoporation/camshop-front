// screens/ListingScreen.js
import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "../../../components/cards/emptyCard";
import OrderItemCard from "../../../components/cards/orderItemCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppCalls from "../../../utils/network";
import { useAuth } from "../../../context/AuthContext";
import { colors } from "../../../theme/theme";
import ChapChapScreen from "../../../components/chapchap/chapchap";

const { width } = Dimensions.get("window");

const ListingScreen = () => {
  const navigation = useRouter();
  const {
    type = "orders", // 'orders', 'products', 'favorites', 'saved'
    title = "My Orders",
    userId = null,
  } = useLocalSearchParams();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [userRole, setUserRole] = useState("user");
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreUrl, setLoadMoreUrl] = useState(null);

  // Fetch data based on type
  useEffect(() => {
    loadItems();
  }, [type, userId]);

  const orderStatus = [
    { id: "all", label: "All" },
    { id: "PENDING", label: "Pending" },
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "ASSIGNED", label: "Assigned" },
    { id: "ASSIGNABLE", label: "Assignable" },
    { id: "ACCEPTED", label: "Accepted" },
    { id: "PICKED_UP", label: "Shipped" },
    { id: "DELIVERED", label: "Delivered" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  const loadItems = async () => {
    setLoading(true);
    try {
      let data = [];
      const role = user.role || "user";
      setUserRole(role);

      switch (type) {
        case "orders":
          data = await fetchOrders(role);
          break;
        case "products":
          data = await fetchProducts(role);
          break;
        case "favorites":
          data = await fetchFavorites();
          break;
        case "saved":
          data = await fetchSavedItems();
          break;
        default:
          data = [];
      }

      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrders = async (role, status, currentPage=0) => {
    try {
      const nextPage = currentPage + 1;
      // GET /orders?status=DELIVERED&page=1&limit=20
      const res = await AppCalls.get(
        "/order?role=" +
          role +
          "&page=" +
          nextPage +
          "&limit=20" +
          "&status=" +
          status,
      );
      setHasMore(res.data.pagination?.hasNextPage || false);
      setPage(res.data.pagination?.page || 1);
      return res.data.items;
    } catch (error) {
      throw new Error("Failed to load orders.");
    }
  };

  const sortOrders = async (term) => {
    setCurrentTab(term)
    setLoading(true);
      setPage(0);
    try {
      const data = await fetchOrders(userRole, term === "all" ? "" : term.toUpperCase());
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async (role) => {
    try {
      const nextPage = page + 1;
      // Get /vendors/:vendorId/products?page=1&limit=20
      const url =
        role.toLocaleLowerCase() === "vendor"
          ? "/vendors/" +
            user.vendor.id +
            "/products?page=" +
            nextPage +
            "&limit=20"
          : "/products";
      const res = await AppCalls.get(url);
      setHasMore(res.data.pagination?.hasNextPage || false);
      setPage(res.data.pagination?.page || 1);
      return res.data.items;
    } catch (error) {
      throw new Error("Failed to load products.");
    }
  };

  const fetchFavorites = async () => {
    try {
      const nextPage = page + 1;
      // Get /vendors/:vendorId/products?page=1&limit=20
      const url = `/favorite?page=${page}`;
      const res = await AppCalls.get(url);
      setHasMore(res.data.pagination?.hasNextPage || false);
      setPage(res.data.pagination?.page || 1);
      return res.data.items;
    } catch (error) {
      throw new Error("Failed to load products.");
    }
  };

  const fetchSavedItems = async () => {
    try {
      const nextPage = page + 1;
      // Get /vendors/:vendorId/products?page=1&limit=20
      const url =
        role.toLocaleLowerCase() === "vendor"
          ? "/vendors/" +
            user.vendor.id +
            "/products?page=" +
            nextPage +
            "&limit=20"
          : "/products";
      const res = await AppCalls.get(url);
      setHasMore(res.data.pagination?.hasNextPage || false);
      setPage(res.data.pagination?.page || 1);
      return res.data.items;
    } catch (error) {
      throw new Error("Failed to load products.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await AppCalls.get("/order/" + orderId);
      loadItems();
      return response.data;
    } catch (error) {
      throw new Error("Failed to cancel order, try again.");
    }
  };

  const handleConfirmOrder = async (data) => {
    try {
      const response = await AppCalls.post("/order/confirm", data);
      loadItems();
      return response.data;
    } catch (error) {
      throw new Error("Failed to confirm order, try again.");
    }
  };

  const renderOrderItem = ({ item }) => (
    <OrderItemCard
      order={item}
      userRole={userRole.toLowerCase()}
      onCancelOrder={handleCancelOrder}
      onConfirmOrder={handleConfirmOrder}
      transporterId={user?.transporter?.id}
      onViewDetails={loadItems}
    />
  );

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !loadMoreUrl) return;
    setIsLoadingMore(true);
    try {
      let data = [];

      switch (type) {
        case "orders":
          data = await fetchOrders(userRole);
          break;
        case "products":
          data = await fetchProducts(userRole);
          break;
        case "favorites":
          data = await fetchFavorites();
          break;
        case "saved":
          data = await fetchSavedItems();
          break;
        default:
          data = [];
      }
      setItems((prevItems) => [...prevItems, ...data]);
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate(`/home/productDetails?productId=${item?.id}`)
      }
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.productPrice}>
          UGX {item.price.toLocaleString()}
        </Text>
        <View style={styles.productStatus}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  item.status === "active" ? "#22c55e" : "#ef4444",
              },
            ]}
          />
          <Text style={styles.productStatusText}>
            {item.status === "active" ? "Out of Stock" : "In Stock"}
          </Text>
          <Text style={styles.productStock}>
            {item.stock || "Enough"} units
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.productEditButton}
        onPress={() =>
          navigation.navigate("EditProduct", { productId: item.id })
        }
      >
        <Ionicons name="pencil" size={20} color="#0ea5e9" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() =>
        navigation.navigate("ProductDetails", { productId: item.id })
      }
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.product.image }}
        style={styles.favoriteImage}
      />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.favoriteSeller}>{item.product.vendor.name}</Text>
        <View style={styles.favoriteRating}>
          <Ionicons name="star" size={14} color={colors.lime} />
          <Text style={styles.favoriteRatingText}>{item.product.rating}</Text>
        </View>
        <Text style={styles.favoritePrice}>
          UGX {item.product.price.toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteRemoveButton}
        onPress={() => {
          setItems(items.filter((i) => i.id !== item.id));
          Alert.alert("Removed", "Item removed from favorites");
        }}
      >
        <Ionicons name="heart" size={24} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSavedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.savedCard}
      onPress={() =>
        navigation.navigate("ProductDetails", { productId: item.id })
      }
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.savedImage} />
      <View style={styles.savedInfo}>
        <Text style={styles.savedName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.savedPrice}>UGX {item.price.toLocaleString()}</Text>
        <Text style={styles.savedTime}>
          Saved {new Date(item.savedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.savedRemoveButton}
        onPress={() => {
          setItems(items.filter((i) => i.id !== item.id));
          Alert.alert("Removed", "Item removed from saved list");
        }}
      >
        <Ionicons name="bookmark" size={24} color="#0ea5e9" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    switch (type) {
      case "orders":
        return renderOrderItem({ item });
      case "products":
        return renderProductItem({ item });
      case "favorites":
        return renderFavoriteItem({ item });
      case "saved":
        return renderSavedItem({ item });
      default:
        return null;
    }
  };

  const getEmptyStateVariant = () => {
    switch (type) {
      case "orders":
        return "orders";
      case "products":
        return "products";
      case "favorites":
        return "favorites";
      case "saved":
        return "default";
      default:
        return "default";
    }
  };

  const getEmptyStateConfig = () => {
    switch (type) {
      case "orders":
        return {
          title: "No orders yet",
          subtitle: "Start shopping to see your orders here.",
          buttonText: "Browse Products",
          onPress: () => navigation.navigate("Market"),
        };
      case "products":
        return {
          title: "No products added",
          subtitle: "Start selling by adding your first product.",
          buttonText: "Add Product",
          onPress: () => navigation.navigate("AddProduct"),
        };
      case "favorites":
        return {
          title: "No favorites yet",
          subtitle: "Start hearting items you love.",
          buttonText: "Explore Products",
          onPress: () => navigation.navigate("Market"),
        };
      case "saved":
        return {
          title: "No saved items",
          subtitle: "Save items to view them here.",
          buttonText: "Browse Products",
          onPress: () => navigation.navigate("Market"),
        };
      default:
        return {
          title: "Nothing here",
          subtitle: "Start exploring to see items here.",
          buttonText: "Explore",
          onPress: () => navigation.goBack(),
        };
    }
  };

  // if (loading) {
  //   return (
  //     <SafeAreaView style={[styles.safeArea, styles.centered]}>
  //       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
  //       <ActivityIndicator size="large" color={colors.lime} />
  //       <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Stats/Info Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {items?.length || 0}{" "}
          {type === "orders"
            ? "orders"
            : type === "products"
              ? "products"
              : "items"}
        </Text>
        {type === "orders" && (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.filterChips}
          >
            {orderStatus.map((item) =>
              user.role === "TRANSPORTER" &&
              ["PENDING", "CONFIRMED", "CANCELLED"].some(
                (it) => item.id === it,
              ) ? (
                ""
              ) : (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    currentTab === item.id && styles.chipActive,
                  ]}
                  onPress={() => sortOrders(item.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      currentTab === item.id && styles.chipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
        )}
      </View>

      {type === "chapchap" && <ChapChapScreen type={type} />}

      {/* Content */}
      {type !== "chapchap" && loading && (
        <View style={[styles.safeArea, styles.centered]}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <ActivityIndicator size="large" color={colors.lime} />
          <Text style={styles.loadingText}>
            Loading {title.toLowerCase()}...
          </Text>
        </View>
      )}
      {type !== "chapchap" && !loading && items && items.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            variant={getEmptyStateVariant()}
            {...getEmptyStateConfig()}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.lime} />
              </View>
            ) : hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>
                  Load More {type === "orders" ? "Orders" : "Products"}
                </Text>
              </TouchableOpacity>
            ) : items.length > 0 ? (
              <Text style={styles.endOfListText}>
                Those are your {type === "orders" ? "orders" : "products"} found
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#334155",
    marginTop: 12,
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
  searchButton: {
    padding: 4,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 6,
  },
  statsText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
    width: "30%"
  },
  filterChips: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  chipActive: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  chipText: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // Product Card Styles
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    marginBottom: 4,
  },
  productStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  productStatusText: {
    fontSize: 12,
    color: "#666666",
  },
  productStock: {
    fontSize: 11,
    color: "#999999",
  },
  productEditButton: {
    padding: 4,
    alignSelf: "flex-start",
  },
  // Favorite Card Styles
  favoriteCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  favoriteSeller: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  favoriteRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  favoriteRatingText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.lime,
  },
  favoritePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  favoriteRemoveButton: {
    padding: 4,
    alignSelf: "flex-start",
  },
  // Saved Card Styles
  savedCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  savedImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  savedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  savedName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  savedPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    marginBottom: 2,
  },
  savedTime: {
    fontSize: 12,
    color: "#999999",
  },
  savedRemoveButton: {
    padding: 4,
    alignSelf: "flex-start",
  },
  loadMoreButton: {
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.lime,
    fontWeight: "500",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadMoreButton: {
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "500",
  },
  endOfListText: {
    textAlign: "center",
    color: "#999999",
    fontSize: 12,
    paddingVertical: 16,
  },
});

export default ListingScreen;
