import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventMetadata({ value = {}, onChange }) {
  const [scheduleType, setScheduleType] = useState(
    value.scheduleType || "SINGLE",
  );
  const [venue, setVenue] = useState(value.venue || "");
  const [weeklySchedule, setWeeklySchedule] = useState(
    value.weeklySchedule || {},
  );

  const updateMetadata = (key, val) => {
    const updated = { ...value, venue, scheduleType, [key]: val };
    onChange(updated);
  };

  const toggleDay = (day) => {
    const updatedWeekly = { ...weeklySchedule };
    if (updatedWeekly[day]) {
      delete updatedWeekly[day];
    } else {
      updatedWeekly[day] = { startTime: "09:00", endTime: "17:00" };
    }
    setWeeklySchedule(updatedWeekly);
    updateMetadata("weeklySchedule", updatedWeekly);
  };

  const updateWeeklyTime = (day, field, val) => {
    const updatedWeekly = {
      ...weeklySchedule,
      [day]: { ...weeklySchedule[day], [field]: val },
    };
    setWeeklySchedule(updatedWeekly);
    updateMetadata("weeklySchedule", updatedWeekly);
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Event Details</Text>

      <Text style={styles.label}>Venue / Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Main Hall, Gymnesium, Conference Hall."
        value={venue}
        onChangeText={(text) => {
          setVenue(text);
          onChange({ ...value, venue: text, scheduleType });
        }}
      />

      <Text style={styles.label}>Event Schedule Type</Text>
      <View style={styles.typeRow}>
        {["SINGLE", "DAILY", "WEEKLY"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeChip,
              scheduleType === type && styles.activeTypeChip,
            ]}
            onPress={() => {
              setScheduleType(type);
              updateMetadata("scheduleType", type);
            }}
          >
            <Text
              style={[
                styles.typeChipText,
                scheduleType === type && styles.activeTypeChipText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SINGLE DAY */}
      {scheduleType === "SINGLE" && (
        <View style={styles.timeBlock}>
          <Text style={styles.subLabel}>Date & Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            onChangeText={(val) => updateMetadata("eventDate", val)}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Start Time (e.g. 10:00 AM)"
              onChangeText={(val) => updateMetadata("startTime", val)}
            />
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="End Time (e.g. 04:00 PM)"
              onChangeText={(val) => updateMetadata("endTime", val)}
            />
          </View>
        </View>
      )}

      {/* DAILY */}
      {scheduleType === "DAILY" && (
        <View style={styles.timeBlock}>
          <Text style={styles.subLabel}>Duration Span</Text>
          <TextInput
            style={styles.input}
            placeholder="Start Date & Time"
            onChangeText={(val) => updateMetadata("startDateTime", val)}
          />
          <TextInput
            style={styles.input}
            placeholder="End Date & Time"
            onChangeText={(val) => updateMetadata("endDateTime", val)}
          />
        </View>
      )}

      {/* WEEKLY RECURRING */}
      {scheduleType === "WEEKLY" && (
        <View style={styles.timeBlock}>
          <Text style={styles.subLabel}>Select Active Days</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBox,
                  weeklySchedule[day] && styles.activeDayBox,
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    weeklySchedule[day] && styles.activeDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {Object.keys(weeklySchedule).map((day) => (
            <View key={day} style={styles.dayExpander}>
              <Text style={styles.dayExpanderTitle}>{day} Schedule</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Start Time"
                  value={weeklySchedule[day].startTime}
                  onChangeText={(val) =>
                    updateWeeklyTime(day, "startTime", val)
                  }
                />
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="End Time"
                  value={weeklySchedule[day].endTime}
                  onChangeText={(val) => updateWeeklyTime(day, "endTime", val)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.caption, marginTop: spacing.xs, color: colors.navy },
  subLabel: {
    ...typography.bodyMuted,
    fontWeight: "600",
    marginVertical: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 14,
  },
  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTypeChip: { backgroundColor: colors.lime, borderColor: colors.lime },
  typeChipText: { ...typography.caption, color: colors.textSecondary },
  activeTypeChipText: { color: colors.white, fontWeight: "700" },
  timeBlock: { gap: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm },
  flex1: { flex: 1 },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayBox: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeDayBox: { backgroundColor: colors.lime, borderColor: colors.lime },
  dayText: { ...typography.caption, color: colors.textSecondary },
  activeDayText: { color: colors.white, fontWeight: "700" },
  dayExpander: {
    backgroundColor: colors.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  dayExpanderTitle: {
    ...typography.caption,
    color: colors.navy,
    marginBottom: 4,
  },
});
