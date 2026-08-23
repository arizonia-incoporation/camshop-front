import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Button from "../../../components/Button";
import { useCart } from "../../../context/CartContext";
import { colors, spacing, typography, radius } from "../../../theme/theme";
import CartItemCard from "../../../components/cards/cartItemCard";
import EmptyState from "../../../components/cards/emptyCard";

export default function CartScreen() {
  const navigation = useRouter();
  const {
    items,
    updateQty,
    removeFromCart,
    subtotal,
    serviceFee,
    total,
    loading,
    error,
    loadCart,
  } = useCart();
  const [expandedId, setExpandedId] = useState(null);

  const handleProceed = () => {
    navigation.push("/cart/checkOutScreen");
  };

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleSelect = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.lime} />
        <Text style={styles.loadingText}>Loading cart items...</Text>
      </SafeAreaView>
    );
  }

  if (error && items.length < 1) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load cart</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCart}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text
        style={[
          typography.display,
          { paddingHorizontal: spacing.lg, marginTop: spacing.sm },
        ]}
      >
        Your cart
      </Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.product.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 0 }}
        ListEmptyComponent={
          <EmptyState
            variant="cart"
            onButtonPress={() => navigation.push("/home")}
          />
        }
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            isExpanded={expandedId === item.id}
            onToggleExpand={() => handleToggleExpand(item.id)}
            onUpdateQuantity={updateQty}
            onDelete={removeFromCart}
            onToggleSelect={handleToggleSelect}
          />
        )}
      />

      {items.length > 0 && (
        <View style={styles.summary}>
          {/* <View style={styles.summaryRow}>
            <Text style={typography.bodyMuted}>Subtotal</Text>
            <Text style={typography.body}>UGX {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={typography.bodyMuted}>De fee</Text>
            <Text style={typography.body}>UGX {serviceFee.toLocaleString()}</Text>
          </View> */}
          <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
            <Text style={typography.h2}>Total</Text>
            <Text style={styles.total}>UGX {total.toLocaleString()}</Text>
          </View>
          <Button
            title="Proceed to checkout"
            onPress={handleProceed}
            style={{ marginTop: spacing.md }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumb: { width: 60, height: 60, borderRadius: radius.sm },
  price: { color: colors.teal, fontWeight: "700", marginTop: 2 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyText: { ...typography.body, minWidth: 18, textAlign: "center" },
  summary: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  total: { fontSize: 18, fontWeight: "800", color: colors.navy },
});
