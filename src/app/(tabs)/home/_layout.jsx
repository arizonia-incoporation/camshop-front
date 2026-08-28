import { Slot, useRouter } from "expo-router";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from "../../../theme/theme";
import { useCart } from "../../../context/CartContext";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";

export default function HomeLayout() {
  const navigation = useRouter();
  const { items } = useCart();
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    setCartCount(items.length)
  },[items])
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor={colors.lime} />
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.push("home")}>
            <Text style={typography.h2}>Camshop🎁</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.push("/cart")}
          >
            <Ionicons name="cart-outline" size={22} color={colors.navy} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  innerContainer: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.lime,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { fontSize: 10, fontWeight: "800", color: colors.white },
});