import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, typography, radius } from "../../../theme/theme";
import { useNotifications } from "../../../context/NotificationContext";
import EmptyState from "../../../components/cards/emptyCard";
import SEO from "../../../components/SEO";

export default function NotificationListScreen() {
  const navigation = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const openNotification = async (item) => {
    const notificationId = item?._id || item?.id;
    if (!notificationId) return;

    navigation.push({
      pathname: "/chat/[id]",
      params: { id: String(notificationId) },
    });

    if (!item.isRead) {
      await markAsRead(notificationId);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Just now";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SEO title="Notifications | Camshop Busitema University" noindex={true} />
      <View style={styles.header}>
        <Text style={[typography.display, { marginTop: spacing.sm }]}>
          Notifications
        </Text>
        {unreadCount > 0 && <Text>({unreadCount} unread)</Text>}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.lime} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => String(item?._id || item?.id || index)}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
          ListEmptyComponent={<EmptyState variant="notifications" />}
          renderItem={({ item }) => {
            const notificationId = item?._id || item?.id;
            const title = item?.title || item?.subject || "Notification";
            const body = item?.body || item?.message || "No details available.";
            const unread = item?.isRead === false || item?.read === false;

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => openNotification(item)}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={colors.white}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <View style={styles.topLine}>
                    <Text
                      style={[typography.h2, unread && { color: colors.navy }]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <Text style={typography.caption}>
                      {formatDate(item?.createdAt || item?.date)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.bodyMuted,
                      unread && { color: colors.navy, fontWeight: "600" },
                    ]}
                    numberOfLines={2}
                  >
                    {body}
                  </Text>
                </View>
                {unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  loadingText: { marginTop: spacing.sm, ...typography.bodyMuted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.lime,
    marginLeft: spacing.xs,
  },
});
