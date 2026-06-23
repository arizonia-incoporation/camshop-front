import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function CartScreen({ navigation }) {
  const { items, updateQty, removeFromCart, subtotal, serviceFee, total } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="cart-outline" size={56} color={colors.textMuted} />
        <Text style={[typography.h2, { marginTop: spacing.md }]}>Your cart is empty</Text>
        <Text style={typography.bodyMuted}>Add items to see them here</Text>
        <Button title="Start shopping" style={{ marginTop: spacing.lg, width: 200 }} onPress={() => navigation.navigate('BuyerHome')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[typography.display, { paddingHorizontal: spacing.lg, marginTop: spacing.sm }]}>Your cart</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.product.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 0 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.product.image }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={typography.h2}>{item.product.name}</Text>
              <Text style={styles.price}>UGX {item.product.price.toLocaleString()}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.qty - 1)}>
                  <Ionicons name="remove" size={16} color={colors.navy} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.qty + 1)}>
                  <Ionicons name="add" size={16} color={colors.navy} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={typography.bodyMuted}>Subtotal</Text>
          <Text style={typography.body}>UGX {subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={typography.bodyMuted}>Service fee</Text>
          <Text style={typography.body}>UGX {serviceFee.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
          <Text style={typography.h2}>Total</Text>
          <Text style={styles.total}>UGX {total.toLocaleString()}</Text>
        </View>
        <Button title="Proceed to checkout" onPress={() => navigation.navigate('Checkout')} style={{ marginTop: spacing.md }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  thumb: { width: 60, height: 60, borderRadius: radius.sm },
  price: { color: colors.teal, fontWeight: '700', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  qtyText: { ...typography.body, minWidth: 18, textAlign: 'center' },
  summary: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  total: { fontSize: 18, fontWeight: '800', color: colors.navy },
});
