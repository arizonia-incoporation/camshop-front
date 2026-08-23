import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TextInput,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppCalls from "../../../utils/network";
import { useCart } from "../../../context/CartContext";
import { colors } from "../../../theme/theme";
import EmptyState from "../../../components/cards/emptyCard";
import { useAuth } from "../../../context/AuthContext";

const { width } = Dimensions.get("window");

const ListingScreen = () => {
  const navigation = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Get params from route
  const {
    type = "products",
    categoryId = null,
    categoryDetails = null,
    title = "Products",
  } = useLocalSearchParams();

  const { addToCart } = useCart();
  const { user } = useAuth();

  // State
  const [loadingData, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    hasNextPage: false,
    total: 0,
  });
  const [categoryData, setCategoryData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showCategory, setShowCategory] = useState(false);
    const [loading, setCartLoading] = useState(false);

  // Animated header values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [-60, 0],
    extrapolate: "clamp",
  });

  // Load initial data
  useEffect(() => {
    console.log(
      "*****************************************************\n",
      type,
      "*****************************************************\n",
      categoryId,
    );
    loadData();
  }, [type, categoryId]);

  const loadData = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;
      let result;

      if (type === "categories" && categoryId) {
        // categories/:categoryId/products
        response = await AppCalls.get(`/categories/${categoryId}/products?page=${page}`);
        console.log(response.data)
        result = response.data;
        setCategoryData(categoryDetails);
      } else {
        response = await AppCalls.get(`/pages/listing?type=${type}&page=${page}`);
        result = response.data;
      }

      console.log(result)

      if (page === 1) {
        setData(result.items || result.products || result.vendors || []);
      } else {
        setData((prev) => [
          ...prev,
          ...(result.items || result.products || result.vendors || []),
        ]);
      }

      setPagination({
        page: result.pagination.page || page,
        hasNextPage: result.pagination.hasNextPage || false,
        total: result.pagination.totalPages || 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleEdit = () => {
    console.log("Damnnnnnnnnn yeeeeeeeeeeeeeee"); };
  
  const handleAddCart = async (id,vendorId) => {
    // setCartLoading(true);
    console.log("Damnnnnnnnnn")
    try {
      await addToCart(id, vendorId);
    } catch (error) {
      console.log(error);
    } finally {
      setCartLoading(false);
    }
  };

  const getCategoriesList = async (params) => {
    // /pages/listing?type=categories&page=2
    const response = await AppCalls.get(`/pages/listing?tpye=categories`, { params });
    return response.data;
  };

  const getCategoryDetails = async (categoryId, params) => {
    const response = await AppCalls.get(`/categories/${categoryId}`, { params });
    return response.data;
  };

  const getProducts = async (params) => {
    const response = await AppCalls.get("/products", { params });
    return response.data;
  };

  const getVendors = async (params) => {
    const response = await AppCalls.get(`/pages/listing?type=vendors`);
    return response.data;
  };

  const onRefresh = () => {
    loadData(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && pagination.hasNextPage) {
      loadData(pagination.page + 1);
    }
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  // Render Category List Item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.push({
          pathname: "/home/listing",
          params: {
            type: "categories",
            categoryId: item.id,
            categoryDetails: item,
            title: item.name,
          },
        })
      }
    >
      <View style={styles.categoryItemIcon}>
        <Ionicons
          name={item.icon || "folder-outline"}
          size={32}
          color={colors.lime}
        />
      </View>
      <Text style={styles.categoryItemName}>{item.name}</Text>
      <Text style={styles.categoryItemCount}>
        {item._count.productCategories || 0} items
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#cccccc"
        style={styles.categoryItemArrow}
      />
    </TouchableOpacity>
  );

  // Render Product List Item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() =>
        navigation.push(`/home/productDetails?productId=${item?.id}`)
      }
    >
      <Image source={{ uri: item.image }} style={styles.productItemImage} />
      <View style={styles.productItemInfo}>
        <Text style={styles.productItemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productItemSeller}>
          {item.seller?.name || "Unknown Seller"}
        </Text>
        <View style={styles.productItemRating}>
          <Ionicons name="star" size={14} color={colors.lime} />
          <Text style={styles.productItemRatingText}>{item.rating || 0}</Text>
          <Text style={styles.productItemReviews}>
            ({item.reviews || 0} reviews)
          </Text>
        </View>
        <Text style={styles.productItemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          user?.vendor?.id === item?.vendorId ||
          user?.vendor?.id === item?.vendor?.id
          ? null
          : handleAddCart(item?.id, item?.vendorId || item?.vendor?.id)
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {user?.vendor?.id === item?.vendorId ||
        user?.vendor?.id === item?.vendor?.id ? (
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={{ color: colors.white }}>Edit</Text>
          </View>
        ) : loading ? (
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={{ color: colors.white }}>Adding</Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={{ color: colors.white }}>Cart</Text>
          </View>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render Vendor List Item
  const renderVendorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.vendorItem}
      onPress={() =>
        navigation.push(`/home/vendorDetails?vendorId=${item?.id}`)
      }
    >
      <Image source={{ uri: item.image }} style={styles.vendorItemImage} />
      <View style={styles.vendorItemInfo}>
        <View style={styles.vendorItemHeader}>
          <Text style={styles.vendorItemName}>{item.name}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          )}
        </View>
        <View style={styles.vendorItemStats}>
          <View style={styles.vendorItemStat}>
            <Ionicons name="star" size={14} color={colors.lime} />
            <Text style={styles.vendorItemStatText}>{item.visits || 0}</Text>
          </View>
          <Text style={styles.vendorItemStatDivider}>·</Text>
          <Text style={styles.vendorItemStatText}>
            {item._count.ratings || 0} reviews
          </Text>
          <Text style={styles.vendorItemStatDivider}>·</Text>
          <Text style={styles.vendorItemStatText}>
            {item._count.products || 0} products
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.vendorItemFollowButton}>
        <Text style={styles.vendorItemFollowText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render Category Detail View (with horizontal lists)
  const renderCategoryDetail = () => {
    if (!categoryData) return null;

    // Separate products and vendors from data
    const products = data;
    // const vendors = data.filter(
    //   (item) => item.type === "vendor" || item._type === "vendor",
    // );
    return (
      <View style={styles.categoryDetailContainer}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <View style={styles.categoryHeaderIcon}>
            <Ionicons
              name={categoryData.icon || "folder-outline"}
              size={40}
              color={colors.lime}
            />
          </View>
          <View style={styles.categoryHeaderInfo}>
            <Text style={styles.categoryHeaderName}>{categoryData.name}</Text>
            <Text style={styles.categoryHeaderCount}>
              {categoryData?._count?.productCategories || 0} products ·{" "}
              {/* {categoryData.totalVendors || 0} vendors */}
            </Text>
          </View>
        </View>

        {/* Ad Placement 1 */}
        <View style={styles.adBanner}>
          <View style={styles.adContent}>
            <Text style={styles.adTitle}>Shop {categoryData.name}</Text>
            <Text style={styles.adDescription}>
              Find the best deals in this category
            </Text>
          </View>
          <TouchableOpacity style={styles.adButton}>
            <Text style={styles.adButtonText}>Explore</Text>
          </TouchableOpacity>
        </View>

        {/* Products in Category */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products in {title}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Listing", {
                    type: "products",
                    categoryId: categoryData.id,
                    title: `All ${categoryData.name} Products`,
                  })
                }
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => `product-${item.id}`}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<EmptyState variant="products"
                title="No products found"
                subtitle="Products have not yet been added to this category."
                buttonText="Go to home"
                onPress={() => navigation.navigate("/home")}
              />}
            />
          </View>

        {/* Ad Placement 2 */}
        <View style={[styles.adBanner, { backgroundColor: "#dbeafe" }]}>
          <View style={styles.adContent}>
            <Text style={styles.adTitle}>🚀 Sell in {categoryData.name}</Text>
            <Text style={styles.adDescription}>
              List your products in this category
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.adButton, { backgroundColor: "#0ea5e9" }]}
          >
            <Text style={styles.adButtonText}>Sell Now</Text>
          </TouchableOpacity>
        </View>

        {/* Vendors in Category */}
        {/* {vendors.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Vendors in {categoryData.name}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Listing", {
                    type: "vendors",
                    categoryId: categoryData.id,
                    title: `All ${categoryData.name} Vendors`,
                  })
                }
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={vendors}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderVendorItem}
              keyExtractor={(item) => `vendor-${item.id}`}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )} */}
      </View>
    );
  };

  // Render Loading State
  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.lime} />
        <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
      </View>
    );
  }

  // Render Categories List
  if (type === "categories" && !categoryId) {
    return (
      <View style={styles.container}>
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
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={data}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => `category-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.lime} />
              </View>
            ) : pagination.hasNextPage ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
              >
                <Text style={styles.loadMoreText}>Load More Categories</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    );
  }

  // Render Category Detail
  if ((type === "categories" && categoryId)) {
    return (
      <View style={styles.container}>
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
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryDetailScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderCategoryDetail()}
        </ScrollView>
      </View>
    );
  }

  // Render Products or Vendors List
  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.headerFilterButton}>
          <Ionicons name="options-outline" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Ad Placement */}
      <View style={styles.adBanner}>
        <View style={styles.adContent}>
          <Text style={styles.adTitle}>Special Offers</Text>
          <Text style={styles.adDescription}>
            Check out these amazing deals
          </Text>
        </View>
        <TouchableOpacity style={styles.adButton}>
          <Text style={styles.adButtonText}>View Deals</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={type === "products" ? renderProductItem : renderVendorItem}
        keyExtractor={(item) => `${type}-${item.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={colors.lime} />
            </View>
          ) : pagination.hasNextPage ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More {type}</Text>
            </TouchableOpacity>
          ) : data.length > 0 ? (
            <Text style={styles.endOfListText}>End of {type}</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#334155",
    marginTop: 12,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  headerRight: {
    width: 32,
  },
  headerFilterButton: {
    padding: 4,
  },
  // Ad Banner
  adBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adContent: {
    flex: 1,
    marginRight: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  adDescription: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  adButton: {
    backgroundColor: colors.lime,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // List Content
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  // Category Item
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  categoryItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
  },
  categoryItemCount: {
    fontSize: 13,
    color: "#666666",
    marginRight: 8,
  },
  categoryItemArrow: {
    marginLeft: 4,
  },
  // Product Item
  productItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    width: width - 32,
  },
  productItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  productItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  productItemSeller: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  productItemRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
  productItemRatingText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.lime,
  },
  productItemReviews: {
    fontSize: 11,
    color: "#999999",
  },
  productItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  productItemAddButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: colors.lime,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
    addBtn: {
      width: 70, height: 28, borderRadius: 14,
      backgroundColor: colors.lime,
      alignItems: 'center', justifyContent: 'center',
    },
  // Vendor Item
  vendorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    width: width - 32,
  },
  vendorItemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f8fafc",
  },
  vendorItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vendorItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  vendorItemOwner: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  vendorItemStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vendorItemStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  vendorItemStatText: {
    fontSize: 12,
    color: "#666666",
  },
  vendorItemStatDivider: {
    fontSize: 12,
    color: "#cccccc",
  },
  vendorItemFollowButton: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vendorItemFollowText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.lime,
  },
  // Category Detail
  categoryDetailContainer: {
    paddingBottom: 20,
  },
  categoryDetailScroll: {
    paddingBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  categoryHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryHeaderName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
  },
  categoryHeaderCount: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  seeAllText: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  horizontalList: {
    gap: 8,
    paddingRight: 16,
  },
  // Load More
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
    color: colors.lime,
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
