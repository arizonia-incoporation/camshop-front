import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";

// Schema handles conditional validation: campus is only required if isStudent is true
const campusSchema = z
  .object({
    isStudent: z.boolean({
      required_error: "Please indicate if you are a student",
    }),
    campus: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.isStudent === true &&
      (!data.campus || data.campus.trim() === "")
    ) {
      ctx.addIssue({
        path: ["campus"],
        code: z.ZodIssueCode.custom,
        message: "Please select a campus",
      });
    }
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
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      isStudent: data.isStudent ?? null, // Use null to track unselected state
      campus: data.campus || "",
    },
  });

  const isStudent = watch("isStudent");
  const selectedCampus = watch("campus");

  const onSubmit = (formData) => {
    onNext(formData);
  };

  const handleStudentSelect = (status) => {
    setValue("isStudent", status);
    if (!status) {
      // If not a student, clear campus and auto-advance immediately
      setValue("campus", "");
      onNext({ isStudent: false, campus: "" });
    }
  };

  const handleCampusSelect = (campusName) => {
    setValue("campus", campusName);
    // Auto-advance after selecting a campus
    onNext({ isStudent: true, campus: campusName });
  };

  const isNextDisabled =
    isStudent === null || (isStudent === true && !selectedCampus);

  const renderCampus = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.campusItem,
        selectedCampus === item.name && styles.campusItemSelected,
      ]}
      onPress={() => handleCampusSelect(item.name)}
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
      <Text style={styles.title}>Are you a student?</Text>
      <Text style={styles.subtitle}>
        Let us know to help us customize your marketplace experience.
      </Text>

      <View style={styles.studentTypeContainer}>
        <TouchableOpacity
          style={[
            styles.typeCard,
            isStudent === true && styles.typeCardSelected,
          ]}
          onPress={() => handleStudentSelect(true)}
        >
          <Text
            style={[
              styles.typeText,
              isStudent === true && styles.typeTextSelected,
            ]}
          >
            Yes, I am
          </Text>
          {isStudent === true && (
            <MaterialIcons name="check-circle" size={20} color={colors.lime} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeCard,
            isStudent === false && styles.typeCardSelected,
          ]}
          onPress={() => handleStudentSelect(false)}
        >
          <Text
            style={[
              styles.typeText,
              isStudent === false && styles.typeTextSelected,
            ]}
          >
            No, I'm not
          </Text>
          {isStudent === false && (
            <MaterialIcons name="check-circle" size={20} color={colors.lime} />
          )}
        </TouchableOpacity>
      </View>

      {errors.isStudent && (
        <Text style={styles.errorText}>{errors.isStudent.message}</Text>
      )}

      {/* Conditionally render the campus list */}
      {isStudent === true && (
        <View style={styles.campusSection}>
          <Text style={styles.sectionTitle}>Which campus are you from?</Text>
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
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isNextDisabled && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isNextDisabled}
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
  studentTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  typeCardSelected: {
    backgroundColor: "#F59E0B10",
    borderColor: colors.lime,
  },
  typeText: {
    fontSize: 16,
    color: "#334155",
  },
  typeTextSelected: {
    color: colors.lime,
    fontWeight: "500",
  },
  campusSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
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
    marginTop: "auto",
    paddingTop: 24,
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
