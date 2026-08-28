import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH"];

export default function InfoMetadata({ value = {}, onChange }) {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Announcement & Alert Settings</Text>

      <Text style={styles.label}>Urgency Level</Text>
      <View style={styles.urgencyRow}>
        {URGENCY_LEVELS.map((level) => {
          const isActive = (value.urgency || "MEDIUM") === level;
          return (
            <TouchableOpacity
              key={level}
              style={[styles.urgencyChip, isActive && styles.activeUrgencyChip]}
              onPress={() => update("urgency", level)}
            >
              <Text
                style={[
                  styles.urgencyText,
                  isActive && styles.activeUrgencyText,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.navy },
  urgencyRow: { flexDirection: "row", gap: spacing.sm },
  urgencyChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeUrgencyChip: { backgroundColor: colors.lime, borderColor: colors.lime },
  urgencyText: { ...typography.caption, color: colors.textSecondary },
  activeUrgencyText: { color: colors.white, fontWeight: "700" },
});
