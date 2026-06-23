import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function CheckoutScreen({ navigation }) {
  const { total, items } = useCart();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = () => {
    setPlacing(true);
    // TODO: call POST /api/orders/checkout on your backend (pay-on-delivery, no card/MoMo input needed here)
    setTimeout(() => {
      setPlacing(false);
      navigation.navigate('OrderConfirmed');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[typography.display, { padding: spacing.lg, paddingBottom: 0 }]}>Checkout</Text>

      <View style={{ padding: spacing.lg }}>
        <View style={styles.codCard}>
          <Ionicons name="cash-outline" size={28} color={colors.navy} />
          <Text style={[typography.h2, { marginTop: spacing.sm }]}>Pay on delivery</Text>
          <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: 4 }]}>
            Pay cash or send Mobile Money directly to your delivery person when your order arrives.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={typography.bodyMuted}>Items ({items.length})</Text>
            <Text style={typography.body}>UGX {(total - 2000).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={typography.bodyMuted}>Camshop service fee</Text>
            <Text style={typography.body}>UGX 2,000</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
            <Text style={typography.h2}>Total to pay on delivery</Text>
            <Text style={styles.total}>UGX {total.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={[typography.caption, { marginTop: spacing.sm, textAlign: 'center' }]}>
          The seller and a delivery partner will message you in-app to arrange handoff.
        </Text>

        <Button title="Place order" loading={placing} onPress={handlePlaceOrder} style={{ marginTop: spacing.lg }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  codCard: { alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  summaryBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  total: { fontSize: 17, fontWeight: '800', color: colors.navy },
});
