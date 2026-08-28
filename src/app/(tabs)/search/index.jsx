// screens/SearchScreen.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useRouter } from "expo-router";
import EmptyState from "../../../components/cards/emptyCard";
import AppCalls from "../../../utils/network";
import categories from "../../../data/Category.json";
import { colors, spacing } from "../../../theme/theme";

const { width } = Dimensions.get("window");

// Mock data - Replace with API calls
const mockCategories = [
  { id: "1", name: "Books & Stationery", icon: "book-outline", count: 234 },
  { id: "2", name: "Electronics", icon: "phone-portrait-outline", count: 189 },
  { id: "3", name: "Clothing & Fashion", icon: "shirt-outline", count: 156 },
  { id: "4", name: "Food & Beverages", icon: "restaurant-outline", count: 123 },
  { id: "5", name: "Furniture", icon: "bed-outline", count: 98 },
  { id: "6", name: "Beauty & Health", icon: "medkit-outline", count: 87 },
  { id: "7", name: "Sports & Fitness", icon: "barbell-outline", count: 65 },
  { id: "8", name: "Services", icon: "construct-outline", count: 54 },
];

const mockTopSearches = [
  { id: "1", term: "Calculator", count: 245 },
  { id: "2", term: "Textbooks", count: 189 },
  { id: "3", term: "Laptop", count: 167 },
  { id: "4", term: "Phone accessories", count: 143 },
  { id: "5", term: "Study materials", count: 98 },
  { id: "6", term: "Clothing", count: 76 },
];

// Full mock data without pagination for testing
const allMockProducts = [
  {
    id: "1",
    name: "Premium Engineering Calculator",
    price: 120000,
    image: "https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Calc",
    seller: "Alex's Tech Hub",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "2",
    name: "ErgoLift Laptop Stand",
    price: 85000,
    image: "https://via.placeholder.com/80x80/FF6B35/FFFFFF?text=Stand",
    seller: "Tech Essentials",
    rating: 4.7,
    reviews: 64,
  },
  {
    id: "3",
    name: "SwiftDrive 128GB Flash Drive",
    price: 45000,
    image: "https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Drive",
    seller: "Busitema Electronics",
    rating: 4.8,
    reviews: 42,
  },
  {
    id: "4",
    name: "UniConnect 10-in-1 Hub",
    price: 160000,
    image: "https://via.placeholder.com/80x80/FFD700/FFFFFF?text=Hub",
    seller: "Tech Hub",
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "5",
    name: "Precision Stylus Gen-2",
    price: 120000,
    image: "https://via.placeholder.com/80x80/FF8C00/FFFFFF?text=Stylus",
    seller: "Creative Tools",
    rating: 4.8,
    reviews: 56,
  },
  {
    id: "6",
    name: "SwiftDrive 256GB Flash Drive",
    price: 75000,
    image: "https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Drive",
    seller: "Busitema Electronics",
    rating: 4.9,
    reviews: 38,
  },
];

const allMockVendors = [
  {
    id: "1",
    name: "Alex's Tech Hub",
    owner: "Alex Mukasa",
    rating: 4.9,
    reviews: 128,
    products: 42,
    image: "https://via.placeholder.com/80x80/FFA500/FFFFFF?text=AT",
    verified: true,
  },
  {
    id: "2",
    name: "Tech Essentials",
    owner: "Sarah Nambi",
    rating: 4.7,
    reviews: 64,
    products: 28,
    image: "https://via.placeholder.com/80x80/FF6B35/FFFFFF?text=TE",
    verified: true,
  },
  {
    id: "3",
    name: "Busitema Electronics",
    owner: "David Okello",
    rating: 4.8,
    reviews: 42,
    products: 35,
    image: "https://via.placeholder.com/80x80/FFD700/FFFFFF?text=BE",
    verified: false,
  },
  {
    id: "4",
    name: "Creative Tools",
    owner: "Grace Auma",
    rating: 4.6,
    reviews: 89,
    products: 19,
    image: "https://via.placeholder.com/80x80/FF8C00/FFFFFF?text=CT",
    verified: true,
  },
  {
    id: "5",
    name: "Campus Books",
    owner: "John Mukasa",
    rating: 4.5,
    reviews: 156,
    products: 45,
    image: "https://via.placeholder.com/80x80/FF6B35/FFFFFF?text=CB",
    verified: true,
  },
];

const SearchScreen = () => {
  const navigation = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [nextPage, setNextPage] = useState(1);

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);
  const [tabs, setTabs] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [moreProductsUrl,setMoreProductsUrl] = useState(null);

  // Vendors state
  const [vendors, setVendors] = useState([]);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [vendorsTotal, setVendorsTotal] = useState(0);
  const [vendorsHasMore, setVendorsHasMore] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const performSearch = async (query, page = 1, type = "new") => {
    if (!query.trim()) {
      setSearchPerformed(false);
      setTabs([]);
      return;
    }

    setLoading(true);
    setSearchPerformed(true);


    try {
      // search?q=phone&page=1&limit=10&minPrice=100
      setMoreProductsUrl("/search?q=" + query + "&");
      const res = await AppCalls.get("/search?q=" + query+"&page=" + page + "&limit=20");

      const { items: filteredProducts, pagination: productPagination } = res.data.products;
      const { items: filteredVendors, pagination: vendorPagination } = res.data.vendors;

      // Update tabs based on results
      const newTabs = [];
      if (productPagination.totalItems > 0) {
        newTabs.push({ key: "products", title: "Products" });
      }
      if (vendorPagination.totalItems > 0) {
        newTabs.push({ key: "vendors", title: "Vendors" });
      }
      setTabs(newTabs);

      // Set initial tab
      if (newTabs.length > 0) {
        setTabIndex(0);
      }

      // Paginate products (5 items per page)
        setProducts(filteredProducts);
        setProductsTotal(productPagination.totalItems);
        setProductsHasMore(productPagination.hasNextPage);
        setProductsPage(productPagination.page);

      // Paginate vendors (5 items per page)
        setVendors(filteredVendors);
        setVendorsTotal(vendorPagination.totalItems);
        setVendorsHasMore(vendorPagination.hasNextPage);
        setVendorsPage(vendorPagination.page);

      // Save to recent searches
      if (query.trim()) {
        const newSearch = { id: Date.now().toString(), term: query.trim() };
        setRecentSearches((prev) => {
          const filtered = prev.filter(
            (s) => s.term.toLowerCase() !== query.trim().toLowerCase(),
          );
          return [newSearch, ...filtered].slice(0, 10);
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setIsSearching(true);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingProducts || !productsHasMore) return;
    setLoadingProducts(true);

    try {
      const nextPage = productsPage + 1;
      
      const res = await AppCalls.get(
        moreProductsUrl + "page=" + nextPage + "&limit=20",
      );

      const data = (res.data.products) ? res.data.products : res.data

      const { items: filteredProducts, pagination: productPagination } = data;
      
        setProducts((prev) => [...prev, ...filteredProducts]);
        setProductsTotal(productPagination.totalItems);
        setProductsHasMore(productPagination.hasNextPage);
        setProductsPage(productPagination.page);
    } catch (error) {
      console.error("Load more products error:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadMoreVendors = async () => {
    if (loadingVendors || !vendorsHasMore) return;
    setLoadingVendors(true);

    try {
      const nextPage = vendorsPage + 1;
      const res = await AppCalls.get(
        "/search?q=" + searchQuery + "&page=" + nextPage + "&limit=20",
      );

      const { items: filteredVendors, pagination: vendorPagination } = res.data.vendors;

      if (filteredVendors.length > 0) {
        setVendors((prev) => [...prev, ...filteredVendors]);
        setVendorsTotal(vendorPagination.totalItems);
        setVendorsHasMore(vendorPagination.hasNextPage);
        setVendorsPage(vendorPagination.page);
      }
    } catch (error) {
      console.error("Load more vendors error:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSearch = (query) => {

    if (!query.trim()) {
      setSearchPerformed(false);
      setTabs([]);
      setProducts([]);
      setVendors([]);
      return;
    }
    performSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchPerformed(false);
    setTabs([]);
    setProducts([]);
    setVendors([]);
    setIsSearching(false);
    inputRef.current?.focus();
  };

  const handleSearchItemPress = (item) => {
    setSearchQuery(item.term);
    performSearch(item.term);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleCategoryPress = async (category) => {
    setSearchQuery(category.name);
    

    setLoading(true);
    setSearchPerformed(true);

    try {
      // GET /categories/:categoryId/products?page=1&limit=20
      setMoreProductsUrl("/categories/" + category.id + "/products?")
      const res = await AppCalls.get("/categories/" + category.id + "/products?page=1" + "&limit=20");

      const { items: filteredProducts, pagination: productPagination } = res.data;

      // Update tabs based on results
      const newTabs = [];
      if (productPagination.totalItems > 0) {
        newTabs.push({ key: "products", title: "Products" });
      }
      setTabs(newTabs);

      // Paginate products (5 items per page)
        setProducts(filteredProducts);
        setProductsTotal(productPagination.totalItems);
        setProductsHasMore(productPagination.hasNextPage);
        setProductsPage(productPagination.page);

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setIsSearching(true);
    }
  };

  const handleResultPress = (item) => {
    navigation.navigate("home/productDetails?productId=" + item.id);
  };

  const handleVendorPress = (vendor) => {
    navigation.push("home/vendorDetails?vendorId=" + vendor.id);
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  // Products Tab
  const ProductsTab = () => {
    if (loadingProducts && products.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="cube-outline"
            title="No products found"
            subtitle={`Try adjusting your search terms for "${searchQuery}"`}
            buttonText="Browse Categories"
            onButtonPress={() => {
              setSearchQuery("");
              setSearchPerformed(false);
              setTabs([]);
            }}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsList}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingProducts ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#f59e0b" />
            </View>
          ) : productsHasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreProducts}
            >
              <Text style={styles.loadMoreText}>Load More Products</Text>
            </TouchableOpacity>
          ) : products.length > 0 ? (
            <Text style={styles.endOfListText}>Those are the products found</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.resultSeller}>By - {item.vendor.name}</Text>
              <View style={styles.resultRating}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.resultRatingText}>{item.rating}</Text>
                <Text style={styles.resultReviews}>
                  ({item.reviews} reviews)
                </Text>
              </View>
              <Text style={styles.resultPrice}>{formatPrice(item.price)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cccccc" />
          </TouchableOpacity>
        )}
      />
    );
  };

  // Vendors Tab
  const VendorsTab = () => {
    if (loadingVendors && vendors.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      );
    }

    if (vendors.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="storefront-outline"
            title="No vendors found"
            subtitle={`Try adjusting your search terms for "${searchQuery}"`}
            buttonText="Browse Categories"
            onButtonPress={() => {
              setSearchQuery("");
              setSearchPerformed(false);
              setTabs([]);
            }}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsList}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingVendors ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#f59e0b" />
            </View>
          ) : vendorsHasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreVendors}
            >
              <Text style={styles.loadMoreText}>Load More Vendors</Text>
            </TouchableOpacity>
          ) : vendors.length > 0 ? (
            <Text style={styles.endOfListText}>Those are the vendors found</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vendorItem}
            onPress={() => handleVendorPress(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.image }} style={styles.vendorImage} />
            <View style={styles.vendorInfo}>
              <View style={styles.vendorHeader}>
                <Text style={styles.vendorName}>{item.name}</Text>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#22c55e"
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.vendorOwner}>Owner: {item.owner}</Text>
              <View style={styles.vendorStats}>
                <View style={styles.vendorStat}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.vendorStatText}>{item.rating}</Text>
                </View>
                <Text style={styles.vendorStatDivider}>·</Text>
                <Text style={styles.vendorStatText}>
                  {item.reviews} reviews
                </Text>
                <Text style={styles.vendorStatDivider}>·</Text>
                <Text style={styles.vendorStatText}>
                  {item.products} products
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cccccc" />
          </TouchableOpacity>
        )}
      />
    );
  };

  // Render initial state (before search)
  const renderInitialState = () => (
    <ScrollView
      style={styles.initialContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Previous Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearRecentSearches}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchTags}>
            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchTag}
                onPress={() => handleSearchItemPress(item)}
              >
                <Ionicons name="time-outline" size={14} color="#666666" />
                <Text style={styles.searchTagText}>{item.term}</Text>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => {
                    setRecentSearches((prev) =>
                      prev.filter((s) => s.id !== item.id),
                    );
                  }}
                >
                  <Ionicons name="close" size={14} color="#999999" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Top Searches */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Searches</Text>
          <Text style={styles.trendingBadge}>🔥 Trending</Text>
        </View>
        <View style={styles.topSearchesList}>
          {mockTopSearches.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.topSearchItem}
              onPress={() => handleSearchItemPress(item)}
            >
              <View style={styles.topSearchRank}>
                <Text style={styles.topSearchRankText}>{item.id}</Text>
              </View>
              <Text style={styles.topSearchTerm}>{item.term}</Text>
              <Text style={styles.topSearchCount}>{item.count} searches</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 3).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name={category.icon} size={28} color="#f59e0b" />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
              <Text style={styles.categoryCount}>{category.count} items</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* More Categories */}
      <View style={styles.section}>
        <View style={styles.moreCategoriesGrid}>
          {categories.slice(2,4).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.moreCategoryItem}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.moreCategoryIcon}>
                <Ionicons name={category.icon} size={20} color="#f59e0b" />
              </View>
              <Text style={styles.moreCategoryName} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // Render search results with tabs
  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (tabs.length === 0 && searchQuery.trim()) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={64} color="#cccccc" />
          <Text style={styles.noResultsTitle}>No results found</Text>
          <Text style={styles.noResultsSubtitle}>
            Try adjusting your search terms for "{searchQuery}"
          </Text>
          <View style={styles.suggestionTags}>
            {["Books", "Electronics", "Fashion", "Food"].map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionTag}
                onPress={() => {
                  setSearchQuery(suggestion);
                  performSearch(suggestion);
                }}
              >
                <Text style={styles.suggestionTagText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (tabs.length === 0) return null;

    const renderScene = SceneMap({
      products: ProductsTab,
      vendors: VendorsTab,
    });

    return (
      <TabView
        navigationState={{
          index: tabIndex,
          routes: tabs,
        }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
            activeColor="#f59e0b"
            inactiveColor="#666666"
            pressColor="transparent"
            renderLabel={({ route, focused }) => (
              <View style={styles.tabLabelContainer}>
                <Text
                  style={[
                    styles.tabLabelText,
                    focused && styles.tabLabelActive,
                  ]}
                >
                  {route.title}
                </Text>
                {route.key === "products" && productsTotal > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{productsTotal}</Text>
                  </View>
                )}
                {route.key === "vendors" && vendorsTotal > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{vendorsTotal}</Text>
                  </View>
                )}
              </View>
            )}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999999"
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search products, vendors..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (!text.trim()) {
                  setSearchPerformed(false);
                  setTabs([]);
                  setProducts([]);
                  setVendors([]);
                  setIsSearching(false);
                }
              }}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {searchPerformed || searchQuery.trim()
          ? renderSearchResults()
          : renderInitialState()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    marginTop: StatusBar.currentHeight || 0,
  },
    innerContainer: {
      width: "100%",
      maxWidth: 800,
      alignSelf: "center",
      flex: 1,
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#334155",
  },
  clearButton: {
    padding: 4,
  },
  // Initial State
  initialContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
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
  clearText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
  },
  trendingBadge: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  // Search Tags
  searchTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  searchTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    gap: 6,
  },
  searchTagText: {
    fontSize: 14,
    color: "#334155",
    maxWidth: 120,
  },
  removeTagButton: {
    padding: 2,
  },
  // Top Searches
  topSearchesList: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    overflow: "hidden",
  },
  topSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topSearchRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topSearchRankText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  topSearchTerm: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
  },
  topSearchCount: {
    fontSize: 12,
    color: "#999999",
  },
  // Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: (width - 44) / 4,
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    color: "#334155",
    fontWeight: "500",
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 10,
    color: "#999999",
  },
  moreCategoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moreCategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    gap: 8,
  },
  moreCategoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  moreCategoryName: {
    fontSize: 13,
    color: "#334155",
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#334155",
    marginTop: 12,
  },
  // No Results
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 16,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  suggestionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
    justifyContent: "center",
  },
  suggestionTag: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  suggestionTagText: {
    fontSize: 14,
    color: "#334155",
  },
  // Tab View Styles
  tabBar: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabIndicator: {
    backgroundColor: "#f59e0b",
    height: 3,
  },
  tabLabel: {
    fontWeight: "600",
    fontSize: 14,
  },
  tabLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabLabelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  tabLabelActive: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  tabBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#f59e0b",
  },
  // Results List
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  resultSeller: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  resultRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  resultRatingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#f59e0b",
  },
  resultReviews: {
    fontSize: 11,
    color: "#999999",
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
  },
  // Vendor Items
  vendorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  vendorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f8fafc",
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: "#22c55e",
    fontWeight: "500",
  },
  vendorOwner: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  vendorStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vendorStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  vendorStatText: {
    fontSize: 12,
    color: "#666666",
  },
  vendorStatDivider: {
    fontSize: 12,
    color: "#cccccc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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

export default SearchScreen;
