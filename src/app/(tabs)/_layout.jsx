import { router, Tabs } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';

const ICONS = {
  Shop: "storefront",
  Cart: "cart",
  Messages: "chatbubble-ellipses",
  Profile: "person",
};

export default function RootLayout() {
  const navigation = useRouter();
  const { isAuthenticated, authing } = useAuth();
  // const { initializePushNotifications, fetchNotifications, unreadCount } = useNotifications();

  useEffect(() => {
    if (isAuthenticated) {
      // 1. Request permission, generate token & send to backend
      // initializePushNotifications();
      
      // 2. Fetch notification history from backend
      // fetchNotifications();
    }
    if (!isAuthenticated) {
      setTimeout(() => {
        navigation.replace("/");
      }, 0);
    }
  }, [isAuthenticated]);
  
    if (authing) {
      return (
        <SafeAreaView style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={colors.lime} />
          <Text style={styles.loadingText}>Loading cart items...</Text>
        </SafeAreaView>
      );
    }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name={`storefront-outline`} size={28} color={color} />
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
            <Ionicons name={`search-outline`} size={28} color={color} />
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
            <Ionicons name={`cart-outline`} size={28} color={color} />
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
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name={`chatbubble-ellipses-outline`}
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
            <Ionicons name={`person-outline`} size={28} color={color} />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
})