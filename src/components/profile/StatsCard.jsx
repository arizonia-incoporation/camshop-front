// app/(profile)/components/StatsCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StatsCard = ({ stats }) => {
  if (!stats) return null;

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.statItem}>
            <Ionicons
              name={stat.icon}
              size={20}
              color={stat.color || "#f59e0b"}
            />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginTop: -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: "#f0f0f0",
  },
});

export default StatsCard;
