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
import SEO from "../../../components/SEO";

const { width } = Dimensions.get("window");

// Mock data items can remain for fallback or initial categories JSON
const mockTopSearches = [
  { id: "1", term: "Calculator", count: 245 },
  { id: "2", term: "Textbooks", count: 189 },
  { id: "3", term: "Laptop", count: 167 },
  { id: "4", term: "Phone accessories", count: 143 },
  { id: "5", term: "Study materials", count: 98 },
  { id: "6", term: "Clothing", count: 76 },
];

const SearchScreen = () => {
  const navigation = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);
  const [tabs, setTabs] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [moreProductsUrl, setMoreProductsUrl] = useState(null);

  // Vendors state
  const [vendors, setVendors] = useState([]);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [vendorsTotal, setVendorsTotal] = useState(0);
  const [vendorsHasMore, setVendorsHasMore] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null); // Ref to manage debounce timer

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const performSearch = async (query, page = 1) => {
    if (!query.trim()) {
      setSearchPerformed(false);
      setTabs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      setMoreProductsUrl("/search?q=" + query + "&");
      const res = await AppCalls.get(
        "/search?q=" + query + "&page=" + page + "&limit=20",
      );

      const { items: filteredProducts, pagination: productPagination } =
        res.data.products;
      const { items: filteredVendors, pagination: vendorPagination } =
        res.data.vendors;

      // Update tabs based on results
      const newTabs = [];
      if (productPagination.totalItems > 0) {
        newTabs.push({ key: "products", title: "Products" });
      }
      if (vendorPagination.totalItems > 0) {
        newTabs.push({ key: "vendors", title: "Vendors" });
      }
      setTabs(newTabs);

      if (newTabs.length > 0) {
        setTabIndex(0);
      }

      setProducts(filteredProducts);
      setProductsTotal(productPagination.totalItems);
      setProductsHasMore(productPagination.hasNextPage);
      setProductsPage(productPagination.page);

      setVendors(filteredVendors);
      setVendorsTotal(vendorPagination.totalItems);
      setVendorsHasMore(vendorPagination.hasNextPage);
      setVendorsPage(vendorPagination.page);

      // Save to recent searches if query yields results or is submitted
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

  // Debounced text handler
  const handleTextChange = (text) => {
    setSearchQuery(text);

    // Clear any existing timeout to prevent firing search on every keystroke
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setSearchPerformed(false);
      setTabs([]);
      setProducts([]);
      setVendors([]);
      setIsSearching(false);
      setLoading(false);
      return;
    }

    // Set loading indicator immediately to show user background activity is happening
    setLoading(true);
    setSearchPerformed(true);

    // Wait for 400ms pause before hitting backend
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 400);
  };

  const loadMoreProducts = async () => {
    if (loadingProducts || !productsHasMore) return;
    setLoadingProducts(true);

    try {
      const nextPage = productsPage + 1;
      const res = await AppCalls.get(
        moreProductsUrl + "page=" + nextPage + "&limit=20",
      );

      const data = res.data.products ? res.data.products : res.data;
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

      const { items: filteredVendors, pagination: vendorPagination } =
        res.data.vendors;

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
    if (!query.trim()) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    performSearch(query);
  };

  const handleClearSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchQuery("");
    setSearchPerformed(false);
    setTabs([]);
    setProducts([]);
    setVendors([]);
    setIsSearching(false);
    setLoading(false);
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
      setMoreProductsUrl("/categories/" + category.id + "/products?");
      const res = await AppCalls.get(
        "/categories/" + category.id + "/products?page=1&limit=20",
      );

      const { items: filteredProducts, pagination: productPagination } =
        res.data;

      const newTabs = [];
      if (productPagination.totalItems > 0) {
        newTabs.push({ key: "products", title: "Products" });
      }
      setTabs(newTabs);

      setProducts(filteredProducts);
      setProductsTotal(productPagination.totalItems);
      setProductsHasMore(productPagination.hasNextPage);
      setProductsPage(productPagination.page);
    } catch (error) {
      console.error("Category fetch error:", error);
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

  // Products Tab Component
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
            <Text style={styles.endOfListText}>
              Those are the products found
            </Text>
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
              <Text style={styles.resultSeller}>
                By - {item.vendor?.name || "Vendor"}
              </Text>
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

  // Vendors Tab Component
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
            <Text style={styles.endOfListText}>
              Those are the vendors found
            </Text>
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

  const renderInitialState = () => (
    <ScrollView
      style={styles.initialContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 4).map((category) => (
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
    </ScrollView>
  );

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

      <SEO title={`Search | Camshop Busitema University`} />

      <View style={styles.innerContainer}>
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
              onChangeText={handleTextChange} // Utilizing debounced handler
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

        {searchPerformed || searchQuery.trim()
          ? renderSearchResults()
          : renderInitialState()}
      </View>
    </SafeAreaView>
  );
};

// Styles remain unchanged
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
