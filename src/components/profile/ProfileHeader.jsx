// app/(profile)/components/ProfileHeader.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ProfileHeader = ({ user, role }) => {
  const router = useRouter();

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const getRoleBadge = () => {
    switch (role) {
      case "vendor":
        return { label: "Vendor", color: "#f59e0b", icon: "storefront" };
      case "deliverer":
        return { label: "Deliverer", color: "#0ea5e9", icon: "bicycle" };
      case "admin":
        return { label: "Admin", color: "#ef4444", icon: "shield" };
      default:
        return { label: "Student", color: "#22c55e", icon: "school" };
    }
  };

  const badge = getRoleBadge();

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || "User"}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name={badge.icon} size={14} color={badge.color} />
            <Text style={[styles.roleText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>

          {user?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666666" />
              <Text style={styles.locationText}>{user.location}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(profile)/shared/edit-profile")}
          >
            <Ionicons name="create-outline" size={20} color="#f59e0b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(profile)/shared/settings")}
          >
            <Ionicons name="settings-outline" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f8fafc",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#666666",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
});

export default ProfileHeader;
