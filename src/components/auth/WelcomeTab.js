// components/WelcomeStep.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, spacing, typography } from "../../theme/theme";

const WelcomeStep = ({ onNext }) => {
  const navigate = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="shopping-bag" size={80} color={colors.lime} />
      </View>
      <Text style={styles.title}>Welcome to Busitema Market</Text>
      <Text style={styles.subtitle}>
        The one-stop shop for everything you need on campus.
      </Text>
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <MaterialIcons name="local-shipping" size={24} color={colors.lime} />
          <Text style={styles.featureText}>Campus Delivery</Text>
          <Text style={styles.featureSubtext}>Right to your hostel door</Text>
        </View>
        <View style={styles.featureDivider} />
        <View style={styles.featureItem}>
          <MaterialIcons name="verified" size={24} color={colors.lime} />
          <Text style={styles.featureText}>Verified Sellers</Text>
          <Text style={styles.featureSubtext}>Trusted student community</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Continue to Sign Up →</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginLink} onPress={() => navigate.push('Login')}>
        <Text style={styles.loginText}>Login In</Text>
      </TouchableOpacity>
      <Text style={styles.termsText}>
        By continuing, you agree to our Terms of Service
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: "#FEF3C7",
    padding: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    width: "100%",
  },
  featureItem: {
    flex: 1,
    alignItems: "center",
  },
  featureDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginTop: 4,
  },
  featureSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.lime,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginText: {
    color: "#0EA5E9",
    fontSize: 16,
    fontWeight: "500",
  },
  termsText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 20,
  },
});

export default WelcomeStep;
