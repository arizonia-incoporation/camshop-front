import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

export default function BusinessMetadata({ value = {}, onChange }) {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Business Profile</Text>

      <Text style={styles.label}>Business Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Campus Quick Laundry"
        value={value.businessName || ""}
        onChangeText={(val) => update("businessName", val)}
      />

      <Text style={styles.label}>Operating Hours</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mon - Sat, 8:00 AM - 9:00 PM"
        value={value.operatingHours || ""}
        onChangeText={(val) => update("operatingHours", val)}
      />

      <Text style={styles.label}>Physical Address / Office</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Main Gate, Shop No. 4"
        value={value.address || ""}
        onChangeText={(val) => update("address", val)}
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
});
