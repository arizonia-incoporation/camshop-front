// app/(profile)/components/ChapChapPriceEditor.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ChapChapPriceEditor = ({ item, onPriceChange, isEditable, onApply }) => {
  const [price, setPrice] = useState(
    String(item.actualPrice || item.estimatedPrice || ""),
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleApply = () => {
    const newPrice = parseFloat(price);
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceChange(item.id, newPrice);
      onApply(item.id, newPrice);
      setIsEditing(false);
    }
  };

  if (!isEditable) {
    return (
      <Text style={styles.priceText}>
        UGX {(item.actualPrice || item.estimatedPrice || 0).toLocaleString()}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyLabel}>UGX</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Enter price"
              placeholderTextColor="#999999"
              autoFocus
            />
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.priceDisplay}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.priceText}>
            UGX{" "}
            {(item.actualPrice || item.estimatedPrice || 0).toLocaleString()}
          </Text>
          <Ionicons name="pencil-outline" size={14} color="#f59e0b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  priceDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currencyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
    marginRight: 4,
  },
  priceInput: {
    fontSize: 14,
    color: "#334155",
    minWidth: 80,
    padding: 0,
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ChapChapPriceEditor;
