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
  RefreshControl,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../../theme/theme";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "expo-router";
import OrderItemCard from "../../../components/cards/orderItemCard";
import AppCalls from "../../../utils/network";
import EmptyState from "../../../components/cards/emptyCard";
import PaymentMethodsBanner from "../../../components/PaymentMethodsBanner";

const { width } = Dimensions.get("window");
const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    recentOrders: [],
    recommendations: [],
    products: [],
    stats: {},
  });
  const [userRole, setUserRole] = useState("user");

  const handleCancelOrder = async (orderId) => {
    // API call to cancel ordertry
    try {
      const response = await AppCalls.get("/order/cancel/" + orderId);
      loadDashboardData();
      return response.data;
    } catch (error) {
      throw new Error("Failed to cancel order, try again.");
    }
  };

  const handleConfirmOrder = async (data) => {
    // API call to confirm order with delivery fee
    try {
      const response = await AppCalls.post("/order/confirm", data);
      // loadDashboardData();
      return response.data;
    } catch (error) {
      throw new Error("Failed to confirm order, try again.");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const role = user.role || "user";
      setUserRole(role);
      setLoading(true);
      setLoadingProducts(true);
      const orders = await loadOrders(role);
      await loadProducts(role);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOrders = async (role) => {
    try {
      const res = await AppCalls.get("/order?role=" + role);

      // Because AppCalls already returns the data payload, we access it directly.
      // Optional chaining (?.) prevents crashes if the API returns an unexpected shape.
      const result = res?.items || res?.data?.items || [];
      const pendingOrders = result.filter(
        (item) => item.status === "PENDING",
      ).length;

      const statis = {
        orders:
          res?.pagination?.totalItems || res?.data?.pagination?.totalItems || 0,
        revenue: 3420000,
        pendingOrders: pendingOrders,
      };

      const recentOrders = result.length ? result.splice(0, 5) : [];

      setData((prev) => ({
        ...prev,
        recentOrders,
        stats: statis,
      }));
    } catch (error) {
      console.log("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (role) => {
    try {
      // Added optional chaining to user?.vendor?.id to prevent crashes if vendor object is missing
      const url =
        role.toLocaleLowerCase() === "vendor"
          ? "/vendors/" + user?.vendor?.id
          : "/products";

      const res = await AppCalls.get(url);

      const result = res?.products || res?.data?.products || [];
      const products = result.length ? result.splice(0, 5) : [];

      setData((c) => ({
        ...c,
        products,
        stats: {
          ...c.stats,
          // Safely target the count object without crashing
          products: res?._count?.products || res?.data?._count?.products || 0,
        },
      }));
    } catch (error) {
      console.log("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatPrice = (price) => {
    return `UGX ${price?.toLocaleString()}`;
  };

  const getInitials = (name) => {
    return name?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "#22c55e";
      case "processing":
        return "#0ea5e9";
      case "pending":
        return colors.lime;
      default:
        return "#666666";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return "checkmark-circle";
      case "processing":
        return "time";
      case "pending":
        return "hourglass";
      default:
        return "ellipse";
    }
  };

  // Render User Dashboard
  const renderUserDashboard = () => {
    const { stats, recentOrders, products } = data;

    return (
      <>
        {/* User Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.lime }]}>
          <View style={styles.profileContent}>
            <View style={styles.profileLeft}>
              <View style={styles.avatarContainer}>
                {user?.profilepicture ? (
                  <Image
                    source={{ uri: user?.profilepicture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {getInitials(user?.username)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.username}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.userMeta}>
                  Member since {new Date(user?.createdAt).getMonth()}{" "}
                  {new Date(user?.createdAt).getFullYear()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.push("/profile")}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
                <MaterialIcons
                  name="shopping-bag"
                  size={24}
                  color={colors.lime}
                />
              </View>
              <Text style={styles.statValue}>{stats.orders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}>
                <MaterialIcons
                  name="delivery-dining"
                  size={24}
                  color="#22c55e"
                />
              </View>
              <Text style={styles.statValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending Delivery</Text>
            </View>
          </View>

          <PaymentMethodsBanner />

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.push("/home")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="storefront" size={24} color={colors.lime} />
                </View>
                <Text style={styles.quickActionLabel}>Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate("/cart")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#dbeafe" },
                  ]}
                >
                  <Ionicons name="cart" size={24} color="#0ea5e9" />
                </View>
                <Text style={styles.quickActionLabel}>Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate("/profile/listing")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#dcfce7" },
                  ]}
                >
                  <Ionicons name="receipt" size={24} color="#22c55e" />
                </View>
                <Text style={styles.quickActionLabel}>Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  navigation.push({
                    pathname: "/profile/listing",
                    params: {
                      type: "favorites",
                      title: "My Favorites",
                    },
                  })
                }
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fce4ec" },
                  ]}
                >
                  <Ionicons name="heart-outline" size={24} color="#ef4444" />
                </View>
                <Text style={styles.quickActionLabel}>Favourites</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.push({
                    pathname: "/profile/listing",
                    params: {
                      type: "chapchap",
                      title: "My Quick-ies",
                    },
                  })
                }
                style={styles.quickAction}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="flash" size={24} color="#ef4444" />
                </View>
                <Text style={styles.quickActionLabel}>ChapChap</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={styles.quickAction}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="person" size={24} color="#ef4444" />
                </View>
                <Text style={styles.quickActionLabel}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.push("/profile/(vendor)/registerVendor")
                }
                style={styles.quickAction}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="person" size={24} color="#ef4444" />
                </View>
                <Text style={styles.quickActionLabel}>Start selling</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Orders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("/profile/listing")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {loading && (
              <View style={[styles.safeArea, styles.centered]}>
                <ActivityIndicator size="large" color={colors.lime} />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
              </View>
            )}
            {!loading && recentOrders && (
              <FlatList
                data={recentOrders}
                contentContainerStyle={{
                  paddingBottom: 0,
                }}
                ListEmptyComponent={
                  <EmptyState
                    variant="orders"
                    onButtonPress={() => navigation.push("/home")}
                  />
                }
                renderItem={({ item }) => (
                  <OrderItemCard
                    key={item.id}
                    order={item}
                    userRole={userRole.toLowerCase()}
                    onCancelOrder={handleCancelOrder}
                    onViewDetails={loadDashboardData}
                  />
                )}
              />
            )}
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <TouchableOpacity onPress={() => navigation.push("/home")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recommendationsScroll}
            >
              {loading && (
                <View style={[styles.safeArea, styles.centered]}>
                  <ActivityIndicator size="large" color={colors.lime} />
                  <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
              )}
              {/* {!loading &&
              products &&
              products.map((order) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendationCard}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.recommendationImage}
                  />
                  <Text style={styles.recommendationName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.recommendationPrice}>
                    {formatPrice(item.price)}
                  </Text>
                </TouchableOpacity>
              ))} */}
            </ScrollView>
          </View>
        </ScrollView>
      </>
    );
  };

  // Render Vendor Dashboard
  const renderVendorDashboard = () => {
    const { stats, recentOrders, products } = data;
    return (
      <>
        {/* Vendor Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.lime }]}>
          <View style={styles.profileContent}>
            <View style={styles.profileLeft}>
              <View style={styles.avatarContainer}>
                {user?.vendor?.image ? (
                  <Image
                    source={{ uri: user?.vendor?.image }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {getInitials(user?.username)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.username}</Text>
                <Text style={styles.userEmail}>{user?.vendor.name}</Text>
                <View style={styles.vendorRating}>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.userMeta}>
                    {user?.rating} ({user?.reviews} reviews)
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate("VendorProfile")}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="cube" size={24} color={colors.lime} />
              </View>
              <Text style={styles.statValue}>{stats?.products || 0}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="receipt" size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.statValue}>{stats?.orders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}>
                <Ionicons name="cash" size={24} color="#22c55e" />
              </View>
              <Text style={styles.statValue}>{formatPrice(stats.revenue)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#fce4ec" }]}>
                <Ionicons name="time" size={24} color="#ef4444" />
              </View>
              <Text style={styles.statValue}>{stats?.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending Orders</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  navigation.navigate("/profile/(vendor)/addProduct")
                }
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="add-circle" size={24} color={colors.lime} />
                </View>
                <Text style={styles.quickActionLabel}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate("/profile/listing")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#dbeafe" },
                  ]}
                >
                  <Ionicons name="receipt" size={24} color="#0ea5e9" />
                </View>
                <Text style={styles.quickActionLabel}>Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={logout}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#dcfce7" },
                  ]}
                >
                  <Ionicons name="analytics" size={24} color="#22c55e" />
                </View>
                <Text style={styles.quickActionLabel}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  navigation.navigate(
                    "/profile/listing?type=products&title=My Products",
                  )
                }
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fce4ec" },
                  ]}
                >
                  <Ionicons name="grid" size={24} color="#ef4444" />
                </View>
                <Text style={styles.quickActionLabel}>Products</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Orders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("/profile/listing")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {loading && (
              <View style={[styles.safeArea, styles.centered]}>
                <ActivityIndicator size="large" color={colors.lime} />
                <Text style={styles.loadingText}>Loading recent orders...</Text>
              </View>
            )}
            {!loading && recentOrders && (
              <FlatList
                data={recentOrders}
                contentContainerStyle={{
                  paddingBottom: 0,
                }}
                ListEmptyComponent={
                  <EmptyState
                    variant="products"
                    onButtonPress={() =>
                      navigation.push("/profile/(vendor)/addProduct")
                    }
                  />
                }
                renderItem={({ item }) => (
                  <OrderItemCard
                    key={item?.id}
                    order={item}
                    userRole={userRole.toLowerCase()}
                    onCancelOrder={handleCancelOrder}
                    onConfirmOrder={handleConfirmOrder}
                    onViewDetails={loadDashboardData}
                  />
                )}
                ListFooterComponent={
                  recentOrders.length > 1 && (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={() => navigation.navigate("/profile/listing")}
                    >
                      <Text style={styles.loadMoreText}>Sell orders</Text>
                    </TouchableOpacity>
                  )
                }
              />
            )}
          </View>

          {/* Top Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Products</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    `/profile/listing?type=products&title=My Products`,
                  )
                }
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {loadingProducts && (
              <View style={[styles.safeArea, styles.centered]}>
                <ActivityIndicator size="large" color={colors.lime} />
                <Text style={styles.loadingText}>Loading top products...</Text>
              </View>
            )}
            {!loadingProducts && products && (
              <FlatList
                data={products}
                contentContainerStyle={{
                  padding: spacing.lg,
                  paddingBottom: 0,
                }}
                ListEmptyComponent={
                  <EmptyState
                    variant="products"
                    onButtonPress={() =>
                      navigation.push("/profile/(vendor)/addProduct")
                    }
                  />
                }
                renderItem={({ item, index }) => (
                  <TouchableOpacity key={item.id} style={styles.productItem}>
                    <View style={styles.productRank}>
                      <Text style={styles.productRankText}>#{index + 1}</Text>
                    </View>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productSales}>
                        {item?.sales} sales
                      </Text>
                    </View>
                    <Text style={styles.productRevenue}>
                      {formatPrice(item.price)}
                    </Text>
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  products.length > 1 && (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={() =>
                        navigation.push(
                          "/profile/listing?type=products&title=My Products",
                        )
                      }
                    >
                      <Text style={styles.loadMoreText}>See all products</Text>
                    </TouchableOpacity>
                  )
                }
              />
            )}
          </View>
        </ScrollView>
      </>
    );
  };

  // Render Delivery guy Dashboard
  const renderTransporterDashboard = () => {
    const { stats, recentOrders } = data;
    // Today's deliveries: if orders include a deliveryDate field, match to today; otherwise show recentOrders
    const todaysDeliveries = (recentOrders || []).filter((o) => {
      try {
        if (!o.deliveryDate) return false;
        return (
          new Date(o.deliveryDate).toDateString() === new Date().toDateString()
        );
      } catch (e) {
        return false;
      }
    });

    const deliveriesToShow = todaysDeliveries.length
      ? todaysDeliveries
      : recentOrders || [];

    return (
      <>
        {/* Transporter Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: "#06b6d4" }]}>
          <View style={styles.profileContent}>
            <View style={styles.profileLeft}>
              <View style={styles.avatarContainer}>
                {user?.profilepicture ? (
                  <Image
                    source={{ uri: user?.profilepicture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {getInitials(user?.username)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.username}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.userMeta}>
                  Delivery Partner • Member since{" "}
                  {new Date(user.createdAt).getFullYear()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.push("/profile")}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                // onPress={() => navigation.push("/profile/shift")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="bicycle" size={24} color={colors.lime} />
                </View>
                <Text style={styles.quickActionLabel}>Start Shift</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate("/profile/listing")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#dbeafe" },
                  ]}
                >
                  <Ionicons name="navigate" size={24} color="#0ea5e9" />
                </View>
                <Text style={styles.quickActionLabel}>Today's Deliveries</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                // onPress={() => navigation.push("/profile/earnings")}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#dcfce7" },
                  ]}
                >
                  <Ionicons name="cash" size={24} color="#22c55e" />
                </View>
                <Text style={styles.quickActionLabel}>Earnings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickAction} onPress={logout}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: "#fce4ec" },
                  ]}
                >
                  <Ionicons name="exit" size={24} color="#ef4444" />
                </View>
                <Text style={styles.quickActionLabel}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Deliveries */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Deliveries</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("/profile/listing?title=My Deliveries")
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={[styles.safeArea, styles.centered]}>
                <ActivityIndicator size="large" color={colors.lime} />
                <Text style={styles.loadingText}>Loading deliveries...</Text>
              </View>
            )}

            {!loading && deliveriesToShow && (
              <FlatList
                data={deliveriesToShow}
                contentContainerStyle={{ paddingBottom: 0 }}
                ListEmptyComponent={
                  <EmptyState
                    variant="orders"
                    onButtonPress={() => navigation.push("/home")}
                  />
                }
                renderItem={({ item }) => (
                  <OrderItemCard
                    key={item.id}
                    order={item}
                    userRole={"transporter"}
                    onCancelOrder={handleCancelOrder}
                    onViewDetails={loadDashboardData}
                    transporterId={user?.transporter?.id}
                  />
                )}
              />
            )}
          </View>

          {/* Delivery History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery History</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("/profile/listing?title=Delivery History")
                }
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {!loading && recentOrders && (
              <FlatList
                data={recentOrders}
                contentContainerStyle={{ paddingBottom: 0 }}
                ListEmptyComponent={
                  <EmptyState
                    variant="orders"
                    onButtonPress={() => navigation.push("/home")}
                  />
                }
                renderItem={({ item }) => (
                  <OrderItemCard
                    key={item.id}
                    order={item}
                    userRole={"transporter"}
                    onCancelOrder={handleCancelOrder}
                    onViewDetails={() => {}}
                    transporterId={user?.transporter?.id}
                  />
                )}
              />
            )}
          </View>
        </ScrollView>
      </>
    );
  };

  const renderItem = () => {
    switch (userRole.toLocaleLowerCase()) {
      case "vendor":
        return renderVendorDashboard();
      case "transporter":
        return renderTransporterDashboard();
      default:
        return renderUserDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#f59e0b" />
      {renderItem()}
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
  // Profile Header
  profileHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  userMeta: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  vendorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
  },
  // Quick Actions
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  seeAllText: {
    fontSize: 14,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  // Recent Orders
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  orderIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  orderInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.lime,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  orderCustomer: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  orderPrice: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.lime,
    marginBottom: 2,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  orderDate: {
    fontSize: 11,
    color: "#999999",
  },
  orderRight: {
    alignItems: "flex-end",
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    marginBottom: 2,
  },
  // Recommendations
  recommendationsScroll: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  recommendationCard: {
    width: 120,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  recommendationImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.lime,
  },
  // Top Products
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productRankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.lime,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 2,
  },
  productSales: {
    fontSize: 12,
    color: "#666666",
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
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
});

export default DashboardScreen;
