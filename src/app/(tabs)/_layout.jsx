import { router, Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, checkAuth, authing } = useAuth();

  // Responsive layout hooks
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 768;

  useEffect(() => {
    if (authing) return; // Wait until initial checkAuth finishes

    const inAuthGroup = segments[0] === "(auth)" || segments[0] === undefined;

    if (!isAuthenticated && !inAuthGroup) {
      // User is not logged in and trying to access protected route
      router.replace("/");
    } else if (isAuthenticated && inAuthGroup) {
      // User is logged in but stuck on login/welcome screen
      router.replace("/(tabs)"); // Adjust to your initial authenticated screen
    }
  }, [isAuthenticated, authing, segments]);

  if (authing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.lime} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.lime,
          tabBarInactiveTintColor: "#6b7280",

          // Constrains and centers active screen content on web
          sceneContainerStyle: isDesktop
            ? styles.desktopScene
            : styles.mobileScene,

          // Constrains and styles the tab navigation bar on web
          tabBarStyle: isDesktop ? styles.desktopTabBar : styles.mobileTabBar,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="storefront-outline" size={28} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/home");
            },
          }}
        />

        <Tabs.Screen
          name="search/index"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search-outline" size={28} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/search");
            },
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ color }) => (
              <Ionicons name="cart-outline" size={28} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/cart");
            },
          }}
        />

        <Tabs.Screen
          name="chat"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/chat");
            },
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={28} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/profile");
            },
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#f3f4f6" : colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4b5563",
  },

  // Screen views
  mobileScene: {
    backgroundColor: colors.bg,
  },
  desktopScene: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    backgroundColor: colors.bg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  // Navigation tab bar
  mobileTabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  desktopTabBar: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    height: 64,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
});
