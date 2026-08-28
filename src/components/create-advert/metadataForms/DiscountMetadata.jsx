import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

export default function DiscountMetadata({ value = {}, onChange }) {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Discount & Promo Details</Text>

      <Text style={styles.label}>Discount Value / Offer</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 20% OFF or Save UGX 5,000"
        value={value.discountValue || ""}
        onChangeText={(val) => update("discountValue", val)}
      />

      <Text style={styles.label}>Promo / Coupon Code (Optional)</Text>
      <TextInput
        style={[styles.input, styles.codeFormat]}
        placeholder="e.g. CAMSHOP20"
        autoCapitalize="characters"
        value={value.discountCode || ""}
        onChangeText={(val) => update("discountCode", val)}
      />

      <Text style={styles.label}>Expiration Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={value.expiresAt || ""}
        onChangeText={(val) => update("expiresAt", val)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.navy },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  codeFormat: { fontWeight: "700", letterSpacing: 1 },
});
