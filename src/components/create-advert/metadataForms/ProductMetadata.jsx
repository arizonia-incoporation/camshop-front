import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

export default function ProductMetadata({ value = {}, onChange }) {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Product Details</Text>

      <Text style={styles.label}>Price (UGX)</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.currencyPrefix}>UGX</Text>
        <TextInput
          style={styles.priceInput}
          keyboardType="numeric"
          placeholder="0.00"
          value={value.price || ""}
          onChangeText={(val) => update("price", val)}
        />
      </View>

      <Text style={styles.label}>Item Condition</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Brand New, Slightly Used"
        value={value.condition || ""}
        onChangeText={(val) => update("condition", val)}
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    ...typography.body,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  priceInput: { flex: 1, paddingVertical: spacing.md, fontSize: 15 },
});
