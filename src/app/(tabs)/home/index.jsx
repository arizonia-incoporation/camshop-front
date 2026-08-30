import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../../theme/theme";
import AppCalls from "../../../utils/network";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import PaymentMethodsBanner from "../../../components/PaymentMethodsBanner";
import { useNotifications } from "../../../context/NotificationContext";
import SEO from "../../../components/SEO";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [deliveryTime, setDeliveryTime] = useState("");
  const [topProducts, setProducts] = useState([]);
  const [topCategories, setCategories] = useState([]);
  const [topVendors, setVendors] = useState([]);
  const [ads, setAds] = useState([]);
  const [ourServices, setServices] = useState([]);

  // Determine delivery time
  const getDeliveryTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Afternoon delivery: 10:00 AM to 12:30 PM
    if (
      (hours === 10 && minutes >= 0) ||
      hours === 11 ||
      (hours === 12 && minutes <= 30)
    ) {
      return "Afternoon Delivery (by 2 PM)";
    } else {
      return "Evening Delivery (by 7 PM)";
    }
  };

  // Get time remaining for next delivery
  const getTimeRemaining = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // If before 10 AM, time until 10 AM
    if (hours < 10 || (hours === 10 && minutes === 0)) {
      const target = new Date();
      target.setHours(10, 0, 0, 0);
      const diff = target - now;
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hoursLeft}h ${minsLeft}m`;
    }

    // If between 10 AM and 12:30 PM
    if (
      (hours === 10 && minutes >= 0) ||
      hours === 11 ||
      (hours === 12 && minutes <= 30)
    ) {
      const target = new Date();
      target.setHours(12, 30, 0, 0);
      const diff = target - now;
      const minsLeft = Math.floor(diff / (1000 * 60));
      return `${minsLeft}m`;
    }

    // If after 12:30 PM, time until next day 10 AM
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(10, 0, 0, 0);
    const diff = target - now;
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hoursLeft}h ${minsLeft}m`;
  };

  useEffect(() => {
    // Set delivery time
    setDeliveryTime(getDeliveryTime());

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await AppCalls.get("/pages/");
      const {
        data: { products, vendors, categories, services, ads, modalads },
      } = res;

      setProducts(products.items);
      setVendors(vendors.items);
      setCategories(categories.items);
      setServices(services);
      setAds(ads);
      setLoadError(false);
    } catch (error) {
      console.error(error);
      setLoadError(error.message || "Failed to load home");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh logic
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  // Animated header interpolation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: "clamp",
  });

  // Render Section Components
  const renderGreetingSection = () => (
    <View style={styles.greetingSection}>
      <View style={styles.greetingContent}>
        <View>
          <Text style={styles.greetingText}>Hello, {user.username}!</Text>
          <Text style={styles.greetingSubtext}>{user.location}</Text>
        </View>
        <View style={styles.greetingActions}>
          <TouchableOpacity style={styles.greetingIconButton}>
            <Ionicons name="scan-outline" size={24} color={colors.lime} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.greetingIconButton}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.lime}
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }}></View>

      {/* Quick Stats */}
      {renderQuickStats()}
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsCard}>
        <Ionicons name="bag-handle" size={20} color={colors.lime} />
        <Text style={styles.statsValue}>{user?.order?.count || 0}</Text>
        <Text style={styles.statsLabel}>Orders</Text>
      </View>
      <View style={styles.statsDivider} />
      <View style={styles.statsCard}>
        <Ionicons name="bookmark" size={20} color="#0ea5e9" />
        <Text style={styles.statsValue}>{user?._count?.favorites || 0}</Text>
        <Text style={styles.statsLabel}>Favourites</Text>
      </View>
      <View style={styles.statsDivider} />
      <View style={styles.statsCard}>
        <Ionicons name="time" size={20} color="#22c55e" />
        <Text style={styles.statsValue}>{user?.order?.pending || 0}</Text>
        <Text style={styles.statsLabel}>Pending</Text>
      </View>
    </View>
  );

  const renderBuyChapChap = () => {
    const timeRemaining = getTimeRemaining();

    return (
      <TouchableOpacity
        style={styles.chapChapSection}
        onPress={() => navigation.navigate("home/BuyChapChap")}
        activeOpacity={0.9}
      >
        <View style={styles.chapChapContent}>
          <View style={styles.chapChapLeft}>
            <View style={styles.chapChapIcon}>
              <Ionicons name="flash" size={28} color={colors.lime} />
            </View>
            <View>
              <Text style={styles.chapChapTitle}>Buy Chap Chap</Text>
              <Text style={styles.chapChapSubtitle}>
                Quick shopping list - {deliveryTime}
              </Text>
            </View>
          </View>
          <View style={styles.chapChapRight}>
            <View style={styles.chapChapTimer}>
              <Ionicons name="time-outline" size={16} color={colors.lime} />
              <Text style={styles.chapChapTimerText}>{timeRemaining}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.lime} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.push({
              pathname: "/home/listing",
              params: {
                type: "categories",
                title: "Categories",
              },
            })
          }
        >
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        {topCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() =>
              navigation.push({
                pathname: "/home/listing",
                params: {
                  type: "categories",
                  categoryId: category.id,
                  categoryDetails: category,
                  title: category.name,
                },
              })
            }
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={category.image} size={28} color={colors.lime} />
            </View>
            <Text style={styles.categoryName} numberOfLines={2}>
              {category.name}
            </Text>
            <Text style={styles.categoryCount}>
              {category._count.productCategories} items
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAdBanner = (ad) => (
    <View
      key={ad.id}
      style={[styles.adBanner, { backgroundColor: ad.bgColor }]}
    >
      <View style={styles.adContent}>
        <View style={styles.adText}>
          <Text style={styles.adTitle}>{ad.title}</Text>
          <Text style={styles.adDescription}>{ad.description}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.back(ad.targetUrl)}
          style={styles.adButton}
        >
          <Text style={styles.adButtonText}>Learn More</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeaturedProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.push({
              pathname: "/home/listing",
              params: {
                type: "products",
                title: "Top Products",
              },
            })
          }
        >
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productsScroll}
      >
        {topProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() =>
              navigation.push(`/home/productDetails?productId=${product?.id}`)
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
              <Text style={styles.productSeller}>{product.vendor.name}</Text>
              <View style={styles.productRating}>
                <Ionicons name="star" size={12} color={colors.lime} />
                <Text style={styles.productRatingText}>
                  {product?._count?.ratings}
                </Text>
                <Text style={styles.productReviews}>({product?.visits})</Text>
              </View>
              <Text style={styles.productPrice}>
                {formatPrice(product.price)}
              </Text>
            </View>
            {user?.vendor?.id !== product?.vendorId && (
              <TouchableOpacity
                style={styles.productAddButton}
                onPress={() => addToCart(product?.id, product?.vendorId)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTopVendors = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Campus Sellers</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.push({
              pathname: "/home/listing",
              params: {
                type: "vendors",
                title: "All Vendors",
              },
            })
          }
        >
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.vendorsScroll}
      >
        {topVendors.map((vendor) => (
          <TouchableOpacity
            key={vendor.id}
            style={styles.vendorCard}
            onPress={() =>
              navigation.push(`/home/vendorDetails?vendorId=${vendor?.id}`)
            }
          >
            <Image source={{ uri: vendor.image }} style={styles.image} />
            <View style={styles.vendorInfo}>
              <View style={styles.vendorNameRow}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                {vendor.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                )}
              </View>
              <View style={styles.vendorRating}>
                <Ionicons name="star" size={14} color={colors.lime} />
                <Text style={styles.vendorRatingText}>
                  {vendor?._count?.ratings}
                </Text>
              </View>
              <Text style={styles.vendorProducts}>
                {vendor?._count?.products} products
              </Text>
            </View>
            {/* <TouchableOpacity style={styles.vendorFollowButton}>
              <Text style={styles.vendorFollowText}>Follow</Text>
            </TouchableOpacity> */}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickServices = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Services</Text>
      <View style={styles.servicesGrid}>
        {ourServices.map((service) => (
          <TouchableOpacity
            onPress={() => navigation.push(service.route)}
            key={service.id}
            style={styles.serviceCard}
          >
            <View
              style={[styles.serviceIcon, { backgroundColor: service.color }]}
            >
              <Ionicons name={service.icon} size={24} color={colors.lime} />
            </View>
            <Text style={styles.serviceName}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loadError) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.lime} />

      <SEO />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Busitema Market</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#FFFFFF"
              />
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("Cart")}
            >
              <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>2</Text>
              </View>
            </TouchableOpacity> */}
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      {loading ? (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={colors.lime} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
        >
          {/* Greeting Section */}
          {renderGreetingSection()}

          {/* Buy Chap Chap */}
          {renderBuyChapChap()}

          <PaymentMethodsBanner />

          {/* Categories */}
          {renderCategories()}

          {/* Ad Banner 1 */}
          {renderAdBanner(ads[0])}

          {/* Featured Products */}
          {renderFeaturedProducts()}

          {/* Top Vendors */}
          {renderTopVendors()}

          {/* Ad Banner 2 */}
          {renderAdBanner(ads[1])}

          {/* Quick Services */}
          {renderQuickServices()}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lime,
  },
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.lime,
    paddingTop: 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 100,
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    position: "relative",
    padding: 4,
  },
  headerBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
    marginTop: 0,
  },
  // Greeting Section
  greetingSection: {
    backgroundColor: colors.lime,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greetingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  greetingSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  greetingActions: {
    flexDirection: "row",
    gap: 8,
  },
  greetingIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // Stats Section
  statsSection: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -15,
    backgroundColor: "#fef3c7c3",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: "#000000af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  statsCard: {
    flex: 1,
    alignItems: "center",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 4,
  },
  statsLabel: {
    fontSize: 11,
    color: "#000",
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
  },
  // Buy Chap Chap
  chapChapSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  chapChapContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapChapLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chapChapIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  chapChapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  chapChapSubtitle: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  chapChapRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chapChapTimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  chapChapTimerText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.lime,
  },
  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
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
  },
  seeAllText: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  // Ad Banner
  adBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  adContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adText: {
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  adButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Categories
  categoriesScroll: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  categoryCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
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
  },
  categoryCount: {
    fontSize: 10,
    color: "#999999",
    marginTop: 2,
  },
  // Products
  productsScroll: {
    flexDirection: "row",
    marginHorizontal: 4,
  },
  productCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f8fafc",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  productSeller: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 2,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
  productRatingText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.lime,
  },
  productReviews: {
    fontSize: 10,
    color: "#999999",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  productAddButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.lime,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  // Vendors
  vendorsScroll: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  vendorCard: {
    width: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: "center",
    backgroundColor: "#f8fafc",
  },
  vendorInfo: {
    alignItems: "center",
    marginTop: 8,
  },
  vendorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  vendorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  vendorRatingText: {
    fontSize: 13,
    color: colors.lime,
    fontWeight: "500",
  },
  vendorProducts: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  vendorFollowButton: {
    marginTop: 8,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
  },
  vendorFollowText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.lime,
  },
  // Services
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  serviceCard: {
    width: "49%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 12,
    textAlign: "center",
    color: "#334155",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default HomeScreen;
