import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

export default function LostFoundMetadata({ value = {}, onChange }) {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Lost & Found Details</Text>

      <Text style={styles.label}>Last Seen Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Near Library Block B or Lecture Hall 3"
        value={value.lastSeenLocation || ""}
        onChangeText={(val) => update("lastSeenLocation", val)}
      />

      <Text style={styles.label}>Date Occurred</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={value.dateOccurred || ""}
        onChangeText={(val) => update("dateOccurred", val)}
      />

      <Text style={styles.label}>Contact Phone / WhatsApp</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="e.g. +256 700 000 000"
        value={value.contactPhone || ""}
        onChangeText={(val) => update("contactPhone", val)}
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
