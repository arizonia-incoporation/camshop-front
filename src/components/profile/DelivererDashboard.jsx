// app/(profile)/components/DelivererDashboard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";

const DelivererDashboard = ({ data }) => {
  const router = useRouter();
  const deliverer = data?.deliverer;
  const [isAvailable, setIsAvailable] = React.useState(
    deliverer?.availability || false,
  );

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // TODO: Update availability on backend
  };

  // Stats configuration
  const stats = [
    {
      icon: "bicycle-outline",
      value: data?.stats?.todayDeliveries || 0,
      label: "Today's Deliveries",
      color: "#f59e0b",
    },
    {
      icon: "star-outline",
      value: data?.stats?.averageRating || "0.0",
      label: "Rating",
      color: "#0ea5e9",
    },
    {
      icon: "cash-outline",
      value: `UGX ${(data?.stats?.todayEarnings || 0).toLocaleString()}`,
      label: "Today's Earnings",
      color: "#22c55e",
    },
  ];

  // Quick Actions configuration
  const actions = [
    {
      icon: "search-outline",
      label: "Find Delivery",
      route: "/(profile)/deliverer/available",
      color: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      icon: "list-outline",
      label: "My Deliveries",
      route: "/(profile)/deliverer/deliveries",
      color: "#dbeafe",
      iconColor: "#0ea5e9",
    },
    {
      icon: "trending-up-outline",
      label: "Earnings",
      route: "/(profile)/deliverer/earnings",
      color: "#dcfce7",
      iconColor: "#22c55e",
    },
    {
      icon: "location-outline",
      label: "Routes",
      route: "/(profile)/deliverer/routes",
      color: "#fce4ec",
      iconColor: "#ef4444",
    },
  ];

  // Available deliveries
  const renderAvailableDeliveries = () => {
    const deliveries = data?.availableDeliveries || [];

    if (deliveries.length === 0) {
      return (
        <View style={styles.emptyDeliveries}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#cccccc" />
          <Text style={styles.emptyDeliveriesText}>
            No deliveries available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.deliveriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Deliveries</Text>
          <TouchableOpacity
            onPress={() => router.push("/(profile)/deliverer/available")}
          >
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {deliveries.slice(0, 3).map((delivery) => (
          <TouchableOpacity
            key={delivery.id}
            style={styles.deliveryItem}
            onPress={() =>
              router.push(
                `/(profile)/deliverer/deliveries?deliveryId=${delivery.id}`,
              )
            }
          >
            <View style={styles.deliveryLeft}>
              <View style={styles.deliveryIcon}>
                <Ionicons name="location" size={18} color="#f59e0b" />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLocation}>
                  {delivery.dropoff?.address || "Unknown"}
                </Text>
                <Text style={styles.deliveryDetails}>
                  {delivery.pickup?.vendor || "Vendor"} ·{" "}
                  {delivery.distance || "0m"}
                </Text>
              </View>
            </View>
            <View style={styles.deliveryRight}>
              <Text style={styles.deliveryEarnings}>
                UGX {(delivery.earnings || 0).toLocaleString()}
              </Text>
              <TouchableOpacity style={styles.acceptButton}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View>
      {/* Availability Toggle */}
      <View style={styles.availabilityContainer}>
        <View style={styles.availabilityLeft}>
          <Ionicons
            name="radio-button-on"
            size={20}
            color={isAvailable ? "#22c55e" : "#ef4444"}
          />
          <Text style={styles.availabilityText}>
            {isAvailable ? "Online" : "Offline"}
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={handleToggleAvailability}
          trackColor={{ false: "#e5e5e5", true: "#fef3c7" }}
          thumbColor={isAvailable ? "#f59e0b" : "#999999"}
        />
      </View>

      <StatsCard stats={stats} />
      <QuickActions actions={actions} />
      {renderAvailableDeliveries()}
    </View>
  );
};

const styles = StyleSheet.create({
  availabilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  availabilityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  availabilityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  deliveriesContainer: {
    marginTop: 20,
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
  deliveryItem: {
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
  deliveryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deliveryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLocation: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  deliveryDetails: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },
  deliveryRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  deliveryEarnings: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
  },
  acceptButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  emptyDeliveries: {
    backgroundColor: "#f8fafc",
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
  },
  emptyDeliveriesText: {
    fontSize: 14,
    color: "#999999",
    marginTop: 8,
  },
});

export default DelivererDashboard;
