import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { useNavigation, useRoute } from "@react-navigation/native";

import Button from '../../../components/Button';
import { useCart } from "../../../context/CartContext";
import { colors, spacing, typography, radius } from "../../../theme/theme";

// Constants
const TABS = {
  DELIVERY: 0,
  REVIEW: 1,
};

// Validation schema
const checkoutSchema = z.object({
  location: z.string().min(5, 'Please enter a valid location'),
  note: z.string().optional(),
});

export default function CheckoutScreen() {
  const navigation = useRouter();
  const { total, items } = useCart();
  const [placing, setPlacing] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      location: '',
      note: '',
    },
  });

  const handlePlaceOrder = () => {
    setPlacing(true);
    // TODO: call POST /api/orders/checkout on your backend (pay-on-delivery, no card/MoMo input needed here)
    setTimeout(() => {
      setPlacing(false);
      navigation.push('/cart/OrderConfirmed');
    }, 1200);
  };
  
    const renderDeliveryTab = () => (
      <View style={styles.tabContent}>
        <View style={styles.tabHeader}>
          <View style={styles.tabIconContainer}>
            <Ionicons name="location-sharp" size={40} color="#f59e0b" />
          </View>
          <Text style={styles.tabTitle}>Where to deliver?</Text>
          <Text style={styles.tabSubtitle}>
            Let us know where to send your items
          </Text>
        </View>
  
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value, onBlur } }) => (
              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, errors.location && styles.inputWrapperError]}>
                  <Ionicons name="location-outline" size={22} color="#f59e0b" />
                  <TextInput
                    style={styles.input}
                    placeholder="Hostel or location"
                    placeholderTextColor="#999999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location.message}</Text>
                )}
              </View>
            )}
          />
  
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value, onBlur } }) => (
              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, styles.noteWrapper]}>
                  <Ionicons name="chatbubble-outline" size={22} color="#f59e0b" style={styles.noteIcon} />
                  <TextInput
                    style={[styles.input, styles.noteInput]}
                    placeholder="Any special instructions? (optional)"
                    placeholderTextColor="#999999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}
          />
  
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#0ea5e9" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Delivery Fees</Text>
              <Text style={styles.infoText}>
                Vendors will confirm delivery fees when they accept your order
              </Text>
            </View>
          </View>
        </View>
      </View>
    );

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
