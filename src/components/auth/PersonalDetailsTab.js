// components/PersonalDetailsStep.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { colors } from "../../theme/theme";

const personalDetailsSchema = z.object({
  username: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

const PersonalDetailsStep = ({ data, onNext, onBack }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: data.username || "",
      phone: data.phone || "",
    },
  });

  const onSubmit = (formData) => {
    onNext(formData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Details</Text>
      <Text style={styles.subtitle}>
        Please provide your personal information to complete your profile.
      </Text>
      <View style={styles.formContainer}>
        <InputField
          label="Full name"
          icon="person-outline"
          name="username"
          control={control}
          placeholder="e.g. Gloria Nakato"
          keyboardType="default"
          autoCapitalize="words"
          autoComplete="username"
        />
        <InputField
          label="Phone number (MTN/Airtel)"
          icon="call-outline"
          name="phone"
          control={control}
          placeholder="07XXXXXXXX"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.lime,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PersonalDetailsStep;
