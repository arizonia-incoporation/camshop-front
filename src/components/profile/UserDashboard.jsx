// app/(profile)/components/UserDashboard.js
import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
import RecentOrders from "./RecentOrders";
import RecommendedProducts from "./RecommendedProducts";

const UserDashboard = ({ data }) => {
  // Stats configuration
  const stats = [
    {
      icon: "shopping-bag-outline",
      value: data?.stats?.totalOrders || 0,
      label: "Orders",
      color: "#f59e0b",
    },
    {
      icon: "bookmark-outline",
      value: data?.stats?.savedItems || 0,
      label: "Saved",
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
      icon: "list-outline",
      label: "My Orders",
      route: "/(profile)/shared/orders",
      color: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      icon: "heart-outline",
      label: "Favorites",
      route: "/(profile)/user/favorites",
      color: "#fce4ec",
      iconColor: "#ef4444",
    },
    {
      icon: "storefront-outline",
      label: "Become Vendor",
      route: "/(profile)/user/become-vendor",
      color: "#dbeafe",
      iconColor: "#0ea5e9",
    },
    {
      icon: "bicycle-outline",
      label: "Become Deliverer",
      route: "/(profile)/user/become-deliverer",
      color: "#dcfce7",
      iconColor: "#22c55e",
    },
  ];

  return (
    <View>
      <StatsCard stats={stats} />
      <QuickActions actions={actions} />
      <RecentOrders orders={data?.recentOrders} />
      <RecommendedProducts products={data?.recommendations} />
    </View>
  );
};

export default UserDashboard;
