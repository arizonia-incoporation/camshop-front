import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import AppCalls from "../utils/network";
import { useAuth } from "./AuthContext";

// Native Imports
import { registerForPushNotificationsAsync } from "../utils/notifications";
// Web Imports (Assuming you created this from the previous web steps)
import {
  requestWebNotificationPermission,
  messaging,
} from "../utils/webNotifications";
import { onMessage } from "firebase/messaging";

// Configure native foreground notifications (Ignored on web)
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [pushToken, setPushToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const notificationListener = useRef();
  const responseListener = useRef();

  // 1. Fetch user notifications from Express backend (Shared)
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await AppCalls.get("/notifications");
      const payload = data?.data?.items;
      const normalized = Array.isArray(payload) ? payload : [];
      setNotifications(normalized);
      setUnreadCount(
        typeof data?.unreadCount === "number"
          ? data.unreadCount
          : normalized.filter((item) => !item.isRead).length,
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getNotificationById = useCallback(async (notificationId) => {
    if (!notificationId) return null;

    try {
      const response = await AppCalls.get(`/notifications/${notificationId}`);
      const notification =
        response?.notification || response?.data || response?.item || response;

      if (!notification) return null;

      setNotifications((prev) => {
        const next = [...prev];
        const index = next.findIndex(
          (item) =>
            (item?._id && item._id === notificationId) ||
            (item?.id && item.id === notificationId),
        );

        if (index >= 0) {
          next[index] = { ...next[index], ...notification };
          return next;
        }

        return [notification, ...next];
      });

      return notification;
    } catch (error) {
      console.error("Error fetching notification by id:", error);
      return null;
    }
  }, []);

  // 2. Register Device Token & sync with backend (Platform Aware)
  const initializePushNotifications = useCallback(async () => {
    if (!user) return;
    try {
      let token = null;

      if (Platform.OS === "web") {
        token = await requestWebNotificationPermission();
      } else {
        token = await registerForPushNotificationsAsync();
      }

      if (!token) return;
      setPushToken(token);

      // Check against the correct token property on the user object
      const existingToken =
        Platform.OS === "web" ? user.webPushToken : user.pushToken;

      if (existingToken !== token) {

        const payload =
          Platform.OS === "web"
            ? { webPushToken: token }
            : { pushToken: token };

        await AppCalls.post("/auth/edit/push-token", payload);
      }
    } catch (error) {
      console.error(`Error registering push token on ${Platform.OS}:`, error);
    }
  }, [user]);

  // 3. Auto-initialize when authenticated user becomes available
  useEffect(() => {
    if (user) {
      initializePushNotifications();
      fetchNotifications();
    }
  }, [user, initializePushNotifications, fetchNotifications]);

  // 4. Mark a notification as read (Shared)
  const markAsRead = async (notificationId) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => {
          const matches =
            (n?._id && n._id === notificationId) ||
            (n?.id && n.id === notificationId);
          return matches ? { ...n, isRead: true } : n;
        }),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await AppCalls.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Centralized deep link router (Shared)
  const handleNotificationNavigation = useCallback((data) => {
    if (!data) return;

    const notificationId =
      data.notificationId || data.id || data._id || data.notification_id;

    if (notificationId) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: String(notificationId) },
      });
      return;
    }

    if (data.url) {
      router.push(data.url);
      return;
    }
    if (data.screen) {
      router.push({
        pathname: data.screen,
        params: data.params || {},
      });
    }
  }, []);

  // 5. Setup Platform-Specific Event Listeners
  useEffect(() => {
    if (Platform.OS === "web") {
      // --- WEB LISTENERS (Firebase) ---
      if (messaging) {
        const unsubscribe = onMessage(messaging, (payload) => {
          const newNotificationItem = {
            _id: payload.messageId || Date.now().toString(),
            title: payload.notification.title,
            body: payload.notification.body,
            data: payload.data,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications((prev) => [newNotificationItem, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
        return () => unsubscribe();
      }
    } else {
      // --- MOBILE LISTENERS (Expo) ---
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          const { title, body, data } = notification.request.content;
          const newNotificationItem = {
            _id: notification.request.identifier,
            title,
            body,
            data,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications((prev) => [newNotificationItem, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          handleNotificationNavigation(data);
        });

      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) {
          const data = response.notification.request.content.data;
          handleNotificationNavigation(data);
        }
      });

      return () => {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      };
    }
  }, [handleNotificationNavigation]);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        getNotificationById,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
