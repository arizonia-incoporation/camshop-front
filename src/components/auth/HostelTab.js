// components/HostelStep.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors } from "../../theme/theme";

const hostelSchema = z.object({
  hostel: z.string().min(1, "Please select a hostel"),
});

const popularHostels = [
  { id: "ogoola", name: "Ogoola Hall", location: "University Hall" },
  { id: "nyerere", name: "Julius Nyerere", location: "University Hall" },
  { id: "Njuki", name: "Njuki", location: "University Hall" },
  { id: "AC", name: "AC", location: "University Hall" },
  { id: "jamaica", name: "Jamaica", location: "Upper Shayule" },
  { id: "jamaica-2", name: "Jamaica 2", location: "Lower Shayule" },
  { id: "zion", name: "Zion", location: "Upper Shayule" },
  { id: "alexandria", name: "Alexandria", location: "Upper Shayule" },
  { id: "mamiki", name: "Mamiki", location: "Shayule" },
  { id: "triple-t", name: "Triple T", location: "Upper Shayule" },
  { id: "zalen", name: "Zalen", location: "Upper Shayule" },
  { id: "mude", name: "Mude", location: "Upper Shayule" },
  { id: "white-house", name: "White House", location: "Upper Shayule" },
  { id: "elshadai-1", name: "Elshadai 1", location: "Upper Shayule" },
  { id: "elshadai-2", name: "Elshadai 2", location: "Upper Shayule" },
  { id: "precious", name: "Precious", location: "Upper Shayule" },
  { id: "Freedom", name: "Freedom", location: "Upper Shayule" },
  { id: "kings-&-queens", name: "Kings & Queens", location: "Upper Shayule" },
  { id: "new-harriet", name: "New Harriet", location: "Upper Shayule" },
  { id: "old-harriet", name: "Old Harriet", location: "Upper Shayule" },
  { id: "oburu", name: "Oburu", location: "Upper Shayule" },
  { id: "Login", name: "Login", location: "Upper Shayule" },
  { id: "E&J", name: "E&J", location: "Busitema Center" },
  { id: "AA-Guild", name: "AA Guild", location: "Upper Shayule" },
];

const HostelStep = ({ data, onNext, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hostelSchema),
    defaultValues: {
      hostel: data.hostel || "",
    },
  });

  const selectedHostel = watch("hostel");

  // Dynamically filter hostels based on the search query
  const filteredHostels = useMemo(() => {
    if (!searchQuery.trim()) return popularHostels;
    return popularHostels.filter((hostel) =>
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    );
  }, [searchQuery]);

  const onSubmit = (formData) => {
    onNext(formData);
  };

  const handleSelect = (hostelName) => {
    setValue("hostel", hostelName);
    setSearchQuery(hostelName);
    // Auto-advance directly using the selected value
    onNext({ hostel: hostelName });
  };

  const renderHostel = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.hostelItem,
        selectedHostel === item.name && styles.hostelItemSelected,
      ]}
      onPress={() => handleSelect(item.name)}
    >
      <View style={styles.hostelInfo}>
        <Text style={styles.hostelName}>{item.name}</Text>
        <Text style={styles.hostelLocation}>{item.location}</Text>
      </View>
      {selectedHostel === item.name && (
        <MaterialIcons name="check-circle" size={24} color={colors.lime} />
      )}
    </TouchableOpacity>
  );

  // Fallback component when a searched hostel isn't in the list
  const renderEmptyList = () => {
    if (!searchQuery.trim()) return null;
    return (
      <TouchableOpacity
        style={styles.customHostelItem}
        onPress={() => handleSelect(searchQuery.trim())}
      >
        <View style={styles.hostelInfo}>
          <Text style={styles.customHostelTitle}>Can't find your hostel?</Text>
          <Text style={styles.customHostelName}>
            Tap to use "{searchQuery.trim()}"
          </Text>
        </View>
        <MaterialIcons name="add-circle" size={24} color={colors.lime} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where do you reside?</Text>
      <Text style={styles.subtitle}>
        Help us personalize your experience based on your campus location.
      </Text>

      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color="#999999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your hostel..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        {searchQuery.length > 0 ? "Search Results" : "Popular Hostels"}
      </Text>

      <FlatList
        data={filteredHostels}
        renderItem={renderHostel}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList} // Renders the custom option when filtered list is empty
      />

      {errors.hostel && (
        <Text style={styles.errorText}>{errors.hostel.message}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !selectedHostel && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={!selectedHostel}
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
    marginBottom: 20,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  listContainer: {
    gap: 8,
  },
  hostelItem: {
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
  hostelItemSelected: {
    backgroundColor: "#F59E0B10",
    borderColor: colors.lime,
  },
  customHostelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F0FDF4", // Light green background to indicate action
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lime,
    borderStyle: "dashed", // Gives a visual cue that it's a custom entry
  },
  customHostelTitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  customHostelName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.lime,
  },
  hostelInfo: {
    flex: 1,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
  },
  hostelLocation: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
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

export default HostelStep;
