import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";

const AdListingCard = ({ item, onPress }) => {
  const isEvent = item.type === "EVENT";
  const isLost = item.type === "LOST";
  const meta = item.metadata || {};
  const imageUri = item.images?.[0];

  return (
    <TouchableOpacity
      style={styles.adCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Banner Image & Status Badge */}
      {imageUri ? (
        <View style={styles.adCardImageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.adCardImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.adBadge,
              isEvent
                ? styles.badgeEvent
                : isLost
                  ? styles.badgeLost
                  : styles.badgeFound,
            ]}
          >
            <Text style={styles.adBadgeText}>{item.type}</Text>
          </View>
        </View>
      ) : null}

      {/* Card Body */}
      <View style={styles.adCardBody}>
        <Text style={styles.adCardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* EVENT Metadata Preview */}
        {isEvent && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.lime} />
            <Text style={styles.metaText} numberOfLines={1}>
              {meta.venue || "Venue TBD"}
            </Text>
          </View>
        )}

        {/* LOST & FOUND Metadata Preview */}
        {!isEvent && (
          <View style={styles.metaRow}>
            <Ionicons name="compass-outline" size={16} color="#64748B" />
            <Text style={styles.metaText} numberOfLines={1}>
              Last seen: {meta.lastSeenLocation || "Unknown Location"}
            </Text>
          </View>
        )}

        <Text style={styles.adCardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Quick Action Footer */}
        <View style={styles.adCardFooter}>
          <Text style={styles.viewDetailsText}>View Full Details</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={colors.lime} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  adCardImageWrapper: { position: "relative", width: "100%", height: 160 },
  adCardImage: { width: "100%", height: "100%" },
  adBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeEvent: { backgroundColor: "#2563EB" },
  badgeLost: { backgroundColor: "#E0473C" },
  badgeFound: { backgroundColor: "#2BAE66" },
  adBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  adCardBody: { padding: 16 },
  adCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metaText: { fontSize: 13, color: "#64748B" },
  adCardDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  adCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  viewDetailsText: { fontSize: 13, fontWeight: "600", color: colors.lime },
});

export default AdListingCard;
