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
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. Register Device Token & sync with backend (Platform Aware)
  const initializePushNotifications = useCallback(async () => {
    if (!user) return;
    try {
      let token = null;

      if (Platform.OS === "web") {
        // Handle Web Token via Firebase
        token = await requestWebNotificationPermission();
      } else {
        // Handle Mobile Token via Expo
        token = await registerForPushNotificationsAsync();
      }

      if (!token) return;
      setPushToken(token);

      // Sync if the token is new or missing from the user object
      if (user.pushToken !== token) {
        console.log(
          `Syncing new ${Platform.OS} push token with backend:`,
          token,
        );
        await AppCalls.post("/auth/edit/push-token", {
          pushToken: token,
          deviceType: Platform.OS === "web" ? "WEB" : "EXPO",
        });
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
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
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
          console.log("Web foreground notification received:", payload);
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
