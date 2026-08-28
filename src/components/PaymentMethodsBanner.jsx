import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing, typography } from "../theme/theme";

export const PAYMENT_METHODS = [
  {
    id: "mtn-momo",
    title: "MTN Mobile Money",
    detail: "Merchant code",
    value: "21437834",
    icon: "phone-portrait-outline",
    color: "#F5B700",
  },
  {
    id: "airtel-money",
    title: "Airtel Money",
    detail: "Merchant code",
    value: "7183791",
    icon: "phone-portrait-outline",
    color: "#E0473C",
  },
  {
    id: "cash-on-delivery",
    title: "Cash on delivery",
    detail: "Pay our trusted delivery partner",
    value: null,
    icon: "cash-outline",
    color: colors.success,
  },
];

export default function PaymentMethodsBanner({ style }) {
  return (
    <View style={[styles.banner, style]}>
      <View style={styles.headingRow}>
        <View style={styles.headingIcon}>
          <Ionicons name="wallet-outline" size={20} color={colors.white} />
        </View>
        <View style={styles.headingText}>
          <Text style={styles.title}>Payment methods</Text>
          <Text style={styles.subtitle}>Choose the option that works best for you</Text>
        </View>
      </View>

      <View style={styles.methods}>
        {PAYMENT_METHODS.map((method) => (
          <View key={method.id} style={styles.method}>
            <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
              <Ionicons name={method.icon} size={21} color={method.color} />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodDetail}>{method.detail}</Text>
              {method.value && (
                <Text style={styles.merchantCode} selectable>
                  {method.value}
                </Text>
              )}
            </View>
            <Ionicons name="checkmark-circle" size={19} color={colors.success} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headingIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  headingText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.navy,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  methods: {
    gap: spacing.sm,
  },
  method: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  methodContent: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  methodTitle: {
    ...typography.body,
    fontWeight: "700",
  },
  methodDetail: {
    ...typography.caption,
    marginTop: 1,
  },
  merchantCode: {
    marginTop: 2,
    color: colors.navy,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
