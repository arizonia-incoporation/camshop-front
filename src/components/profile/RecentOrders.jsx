// app/(profile)/components/RecentOrders.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const RecentOrders = ({
  orders,
  title = "Recent Orders",
  viewAllRoute = "/(profile)/shared/orders",
}) => {
  const router = useRouter();

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "processing":
        return "#0ea5e9";
      case "delivered":
        return "#22c55e";
      case "cancelled":
        return "#ef4444";
      default:
        return "#666666";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={() => router.push(viewAllRoute)}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {orders.slice(0, 3).map((order, index) => (
        <TouchableOpacity
          key={order.id || index}
          style={styles.orderItem}
          onPress={() =>
            router.push(`/(profile)/shared/orders?orderId=${order.id}`)
          }
        >
          <View style={styles.orderLeft}>
            {order.items && order.items.length > 0 && (
              <Image
                source={{ uri: order.items[0].image }}
                style={styles.orderImage}
              />
            )}
            <View style={styles.orderInfo}>
              <Text style={styles.orderName} numberOfLines={1}>
                {order.items?.map((item) => item.name).join(", ") || "Order"}
              </Text>
              <Text style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
              <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
            </View>
          </View>
          <View style={styles.orderRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {getStatusLabel(order.status)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#cccccc" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  seeAllText: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orderName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  orderDate: {
    fontSize: 11,
    color: "#999999",
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f59e0b",
    marginTop: 2,
  },
  orderRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  emptyContainer: {
    backgroundColor: "#f8fafc",
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999999",
  },
});

export default RecentOrders;
