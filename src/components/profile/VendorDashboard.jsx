// app/(profile)/components/VendorDashboard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
import RecentOrders from "./RecentOrders";

const VendorDashboard = ({ data }) => {
  const router = useRouter();
  const vendor = data?.vendor;
  const subscription = data?.subscription;

  // Stats configuration
  const stats = [
    {
      icon: "cube-outline",
      value: data?.stats?.totalProducts || 0,
      label: "Products",
      color: "#f59e0b",
    },
    {
      icon: "receipt-outline",
      value: data?.stats?.totalOrders || 0,
      label: "Orders",
      color: "#0ea5e9",
    },
    {
      icon: "time-outline",
      value: data?.stats?.pendingOrders || 0,
      label: "Pending",
      color: "#22c55e",
    },
  ];

  // Quick Actions configuration
  const actions = [
    {
      icon: "grid-outline",
      label: "Products",
      route: "/(profile)/vendor/products",
      color: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      icon: "add-circle-outline",
      label: "Add Product",
      route: "/(profile)/vendor/add-product",
      color: "#dbeafe",
      iconColor: "#0ea5e9",
    },
    {
      icon: "list-outline",
      label: "Orders",
      route: "/(profile)/shared/orders",
      color: "#dcfce7",
      iconColor: "#22c55e",
    },
    {
      icon: "card-outline",
      label: "Subscription",
      route:
        subscription?.status === "active"
          ? "/(profile)/vendor/subscription"
          : "/(profile)/vendor/subscribe",
      color: "#fce4ec",
      iconColor: "#ef4444",
    },
  ];

  // Verification status
  const renderVerificationStatus = () => {
    if (vendor?.verified) {
      return (
        <View style={styles.verifiedContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          <Text style={styles.verifiedText}>Verified Business</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => router.push("/(profile)/vendor/verify-business")}
      >
        <Ionicons name="shield-outline" size={18} color="#f59e0b" />
        <Text style={styles.verifyText}>Verify Your Business</Text>
        <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
      </TouchableOpacity>
    );
  };

  // Subscription card
  const renderSubscription = () => {
    if (!subscription) return null;

    const isActive = subscription.status === "active";
    const daysLeft = subscription.expiryDate
      ? Math.ceil(
          (new Date(subscription.expiryDate) - new Date()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    return (
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionPlan}>
            <Ionicons name="diamond-outline" size={20} color="#f59e0b" />
            <Text style={styles.subscriptionPlanText}>
              {subscription.plan || "Basic"} Plan
            </Text>
          </View>
          <View
            style={[
              styles.subscriptionStatus,
              {
                backgroundColor: isActive ? "#dcfce7" : "#fce4ec",
              },
            ]}
          >
            <Text
              style={[
                styles.subscriptionStatusText,
                {
                  color: isActive ? "#22c55e" : "#ef4444",
                },
              ]}
            >
              {isActive ? "Active" : "Expired"}
            </Text>
          </View>
        </View>

        {isActive && (
          <Text style={styles.subscriptionDays}>{daysLeft} days remaining</Text>
        )}

        <TouchableOpacity
          style={styles.subscriptionButton}
          onPress={() => router.push("/(profile)/vendor/subscription")}
        >
          <Text style={styles.subscriptionButtonText}>
            {isActive ? "Manage Subscription" : "Subscribe Now"}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {/* Store Name */}
      <View style={styles.storeContainer}>
        <Text style={styles.storeName}>
          {vendor?.storeName || "Your Store"}
        </Text>
        {vendor?.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{vendor.rating}</Text>
            <Text style={styles.reviewText}>
              ({vendor.reviews || 0} reviews)
            </Text>
          </View>
        )}
      </View>

      {renderVerificationStatus()}
      <StatsCard stats={stats} />
      {renderSubscription()}
      <QuickActions actions={actions} />
      <RecentOrders
        orders={data?.recentOrders}
        title="Recent Orders"
        viewAllRoute="/(profile)/shared/orders"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storeContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
  },
  reviewText: {
    fontSize: 13,
    color: "#666666",
  },
  verifiedContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    color: "#22c55e",
    fontWeight: "500",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  verifyText: {
    fontSize: 13,
    color: "#f59e0b",
    fontWeight: "500",
  },
  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subscriptionPlan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subscriptionPlanText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  subscriptionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  subscriptionStatusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  subscriptionDays: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 8,
  },
  subscriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  subscriptionButtonText: {
    fontSize: 13,
    color: "#f59e0b",
    fontWeight: "500",
  },
});

export default VendorDashboard;
