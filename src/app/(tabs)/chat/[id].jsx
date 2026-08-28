import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, typography, radius } from "../../../theme/theme";
import { useNotifications } from "../../../context/NotificationContext";
import AppCalls from "../../../utils/network";
import { showToast } from "../../../utils/toast";

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { markAsRead } = useNotifications();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotification = async () => {
      if (!id) {
        setLoading(false);
        setError("Notification id is missing.");
        return;
      }

      try {
        setLoading(true);
        const response = await AppCalls.get(`/notifications/${id}`);
        const item =
          response?.notification ||
          response?.data ||
          response?.item ||
          response;
        setNotification(item);

        if (item?._id || item?.id) {
          await markAsRead(String(item.id));
        }
      } catch (err) {
        setError(err?.message || "Unable to load notification details.");
      } finally {
        setLoading(false);
      }
    };

    loadNotification();
  }, []);

  const formatDate = (value) => {
    if (!value) return "Just now";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [claiming, setClaiming] = useState(false);

  const claimFromNotification = async () => {
    if (!notification) {
      showToast(
        "error",
        "No notification",
        "No notification details available",
      );
      return;
    }

    const orderId =
      notification?.data?.orderId ||
      notification?.orderId ||
      notification?.data?.order_id ||
      notification?.order?._id ||
      notification?.order?.id;
    if (!orderId) {
      showToast(
        "error",
        "No order id",
        "Notification does not contain order id",
      );
      return;
    }

    try {
      setClaiming(true);
      await AppCalls.post(`/orders/${orderId}/claim`);
      showToast("success", "Claimed", "You have claimed this delivery");
      router.replace("/");
    } catch (err) {
      console.error("Claim error", err);
      showToast(
        "error",
        "Claim failed",
        err?.message || "Could not claim order",
      );
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.lime} />
          <Text style={styles.loadingText}>Loading notification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !notification) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.navy} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={52} color="#ef4444" />
          <Text style={styles.errorText}>
            {error || "Notification not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={[typography.h2, { marginLeft: spacing.sm }]}>
          Notification
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications" size={28} color={colors.white} />
          </View>

          <Text style={styles.title}>
            {notification.title || notification.subject || "Notification"}
          </Text>
          <Text style={styles.date}>
            {formatDate(
              notification.createdAt ||
                notification.date ||
                notification.updatedAt,
            )}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.message}>
            {notification.body ||
              notification.message ||
              "No details available for this notification."}
          </Text>

          {/* Claim button for claimable notifications */}
          {(notification.type === "claimable" ||
            notification.type === "offer" ||
            notification?.data?.action === "claim") && (
            <TouchableOpacity
              onPress={claimFromNotification}
              style={{
                backgroundColor: colors.lime,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                marginTop: spacing.md,
              }}
            >
              {claiming ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text
                    style={[
                      typography.button,
                      { color: colors.white, marginLeft: 8 },
                    ]}
                  >
                    Claiming...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="hand-left" size={18} color="#FFFFFF" />
                  <Text
                    style={[
                      typography.button,
                      { color: colors.white, marginLeft: 8 },
                    ]}
                  >
                    Claim Delivery
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {notification.type && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{notification.type}</Text>
            </View>
          )}

          {notification.category && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{notification.category}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textMuted,
  },
  errorText: {
    marginTop: spacing.md,
    ...typography.h2,
    textAlign: "center",
    color: colors.navy,
  },
  content: { padding: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
    color: colors.navy,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  message: {
    ...typography.body,
    lineHeight: 24,
    color: colors.navy,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  metaValue: {
    ...typography.body,
    color: colors.navy,
    fontWeight: "600",
  },
});
