// app/(profile)/components/QuickActions.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const QuickActions = ({ actions }) => {
  const router = useRouter();

  const handlePress = (action) => {
    if (action.route) {
      router.push(action.route);
    } else if (action.onPress) {
      action.onPress();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={() => handlePress(action)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: action.color || "#fef3c7" },
              ]}
            >
              <Ionicons
                name={action.icon}
                size={24}
                color={action.iconColor || "#f59e0b"}
              />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: "22%",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    textAlign: "center",
    color: "#334155",
  },
});

export default QuickActions;
