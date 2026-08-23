// components/CampusStep.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";

const campusSchema = z.object({
  campus: z.string().min(1, "Please select a campus"),
});

const campuses = [
  { id: "palisa", name: "Palisa" },
  { id: "main", name: "Main" },
  { id: "nangongera", name: "Nangongera" },
  { id: "arapai", name: "Arapai" },
  { id: "namasagali", name: "Namasagali" },
  { id: "mbale", name: "Mbale" },
];

const CampusStep = ({ data, onNext, onBack }) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      campus: data.campus || "",
    },
  });

  const selectedCampus = watch("campus");

  const onSubmit = (formData) => {
    onNext(formData);
  };

  const renderCampus = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.campusItem,
        selectedCampus === item.name && styles.campusItemSelected,
      ]}
      onPress={() => setValue("campus", item.name)}
    >
      <Text
        style={[
          styles.campusText,
          selectedCampus === item.name && styles.campusTextSelected,
        ]}
      >
        {item.name}
      </Text>
      {selectedCampus === item.name && (
        <MaterialIcons name="check-circle" size={24} color="#F59E0B" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which campus are you from?</Text>
      <Text style={styles.subtitle}>
        Select your primary learning location to help us customize your
        marketplace experience.
      </Text>
      <FlatList
        data={campuses}
        renderItem={renderCampus}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
      {errors.campus && (
        <Text style={styles.errorText}>{errors.campus.message}</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !selectedCampus && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={!selectedCampus}
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
  listContainer: {
    gap: 8,
  },
  campusItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#F59E0B1A",
  },
  campusItemSelected: {
    backgroundColor: "#F59E0B10",
    borderColor: colors.lime,
  },
  campusText: {
    fontSize: 16,
    color: "#334155",
  },
  campusTextSelected: {
    color: colors.lime,
    fontWeight: "500",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.lime,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
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

export default CampusStep;
