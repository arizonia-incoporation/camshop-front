import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import Logo from '../../components/Logo';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { validateEmail } from '../../utils/gen';
import AppCalls from '../../utils/network';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginScreen() {
  const navigation = useRouter();
  const { storeUser } = useAuth();

  const [isLogging, setIsLogging] = useState(false);
  const [loggingError, setLoggingError] = useState(null);

  const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(passwordSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState('');

  const handleLogin = async (data) => {
    const email = data.email.trim();
    const password = data.password.trim();
    
    setIsLogging(true);

    try {
      const response = await AppCalls.post(
        "/auth/login",
        { email, password },
      );
      storeUser(response.token, response.user);
      showToast(
        "success",
        "Welcome back " + response.user.username,
        response.message,
      );
      navigation.push("/home");
    } catch (error) {
      showToast("error", "Login error ", error.message);
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ alignItems: "center", marginVertical: spacing.xl }}>
          <Logo size={64} />
          <Text style={[typography.h1, { marginTop: spacing.sm }]}>
            Welcome back
          </Text>
          <Text style={typography.bodyMuted}>Log in to continue shopping</Text>
        </View>

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

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.lg }} />
        
        <Button
          title="Login"
          variant="primary"
          subtitle="Logging in..."
          onPress={handleSubmit(handleLogin)}
          loading={isLogging}
        />

        <View style={styles.footerRow}>
          <Text style={typography.bodyMuted}>New to Camshop? </Text>
          <Text style={styles.link} onPress={() => navigation.push("Signup")}>
            Create account
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  link: {
    color: colors.teal,
    fontWeight: "700"
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.lime,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
