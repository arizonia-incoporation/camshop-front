// components/PasswordStep.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { colors } from "../../theme/theme";
import Button from "../Button";

const passwordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const PasswordStep = ({ data, onNext, onBack, loading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: data.email || "",
      password: data.password || "",
    },
  });

  const onSubmit = (formData) => {
    onNext(formData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure your account</Text>
      <Text style={styles.subtitle}>
        Enter your email and a strong password to finish setting up your
        university marketplace profile.
      </Text>
      <View style={styles.formContainer}>
        <InputField
          label="Email"
          icon="mail-outline"
          name="email"
          control={control}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <InputField
          label="Password"
          icon="lock-closed-outline"
          secure
          name="password"
          control={control}
          placeholder="Create a password"
          autoCapitalize="none"
          autoComplete="tel"
        />
        <Text style={styles.termsText}>
          By clicking "Sign Up", you agree to our Terms of Service and Privacy
          Policy.
          {"\n"}Standard university marketplace protocols apply.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Button
          title="Sign UP"
          subtitle="Signning Up"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />
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
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 38,
    zIndex: 1,
  },
  termsText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
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

export default PasswordStep;
