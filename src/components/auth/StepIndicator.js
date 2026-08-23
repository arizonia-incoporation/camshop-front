// components/StepIndicator.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/theme";

const StepIndicator = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.stepRow}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  percentageText: {
    fontSize: 14,
    color: colors.lime,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.lime,
    borderRadius: 2,
  },
});

export default StepIndicator;
