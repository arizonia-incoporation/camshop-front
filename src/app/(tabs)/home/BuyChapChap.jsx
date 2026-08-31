// app/(profile)/shared/BuyChapChapScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../../theme/theme";
import AppCalls from "../../../utils/network";

// --- CUSTOM ALERT COMPONENT ---
const WebSafeAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  showCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertActions}>
          {showCancel && (
            <TouchableOpacity style={styles.alertBtnCancel} onPress={onCancel}>
              <Text style={styles.alertBtnCancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.alertBtnConfirm} onPress={onConfirm}>
            <Text style={styles.alertBtnConfirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const BuyChapChapScreen = () => {
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    estimatedTotal: "",
  });
  const [note, setNote] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDestination, setShowDestination] = useState(false);
  const [destination, setDestination] = useState("");

  // Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    showCancel: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const getDeliveryInfo = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (
      (hours === 10 && minutes >= 0) ||
      hours === 11 ||
      (hours === 12 && minutes <= 30)
    ) {
      if (hours === 12 && minutes > 0 && minutes <= 30) {
        return {
          type: "afternoon",
          label: "Afternoon Delivery",
          time: "by 2:00 PM",
          cutoff: "12:30 PM",
          cutoffTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            12,
            30,
            0,
          ),
          isAvailable: true,
          icon: "sunny-outline",
          color: colors.lime,
        };
      } else if (
        hours === 10 ||
        hours === 11 ||
        (hours === 12 && minutes === 0)
      ) {
        return {
          type: "afternoon",
          label: "Afternoon Delivery",
          time: "by 2:00 PM",
          cutoff: "12:30 PM",
          cutoffTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            12,
            30,
            0,
          ),
          isAvailable: true,
          icon: "sunny-outline",
          color: colors.lime,
        };
      }
    }
    if (hours >= 13 && hours < 17) {
      return {
        type: "evening",
        label: "Evening Delivery",
        time: "by 7:00 PM",
        cutoff: "5:00 PM",
        cutoffTime: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          17,
          0,
          0,
        ),
        isAvailable: true,
        icon: "moon-outline",
        color: "#0ea5e9",
      };
    }
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(10, 0, 0, 0);
    return {
      type: "next_afternoon",
      label: "Tomorrow Afternoon",
      time: "by 2:00 PM",
      cutoff: "tomorrow 10:00 AM",
      cutoffTime: nextDay,
      isAvailable: true,
      icon: "today-outline",
      color: "#22c55e",
    };
  };

  const getTimeRemaining = (cutoffTime) => {
    const now = new Date();
    const diff = cutoffTime - now;
    if (diff <= 0) return "Time expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  useEffect(() => {
    setDeliveryInfo(getDeliveryInfo());
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (deliveryInfo) {
      const interval = setInterval(
        () => setDeliveryInfo(getDeliveryInfo()),
        60000,
      );
      return () => clearInterval(interval);
    }
  }, [deliveryInfo]);

  const showAlert = (
    title,
    message,
    onConfirm,
    onCancel = null,
    showCancel = false,
    confirmText = "OK",
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      },
      showCancel,
      confirmText,
    });
  };

  const addItem = () => {
    if (currentItem.name.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          name: currentItem.name,
          estimatedTotal: currentItem.estimatedTotal,
          quantity: 1,
        },
      ]);
      setCurrentItem({ name: "", estimatedTotal: "" });
      inputRef.current?.focus();
    }
  };

  const removeItem = (id) => {
    showAlert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      () => {
        setItems(items.filter((item) => item.id !== id));
      },
      () => {},
      true,
      "Remove",
    );
  };

  const updateQuantity = (id, change) => {
    setItems(
      items.map((item) => {
        if (item.id === id)
          return { ...item, quantity: Math.max(1, item.quantity + change) };
        return item;
      }),
    );
  };

  const updateItemField = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      showAlert(
        "Empty List",
        "Please add at least one item to your shopping list.",
      );
      return;
    }
    if (!deliveryInfo.isAvailable) {
      showAlert(
        "Delivery Not Available",
        "Please wait for the next delivery window.",
      );
      return;
    }
    setShowDestination(true);
  };

  const confirmOrder = async () => {
    setLoading(true);
    const mappedItems = items.map((tx) => ({
      name: tx.name,
      estimatedTotal: Number(tx.estimatedTotal) || 0,
      quantity: Number(tx.quantity),
    }));
    const orderData = { items: mappedItems, note: note, location: destination };

    try {
      await AppCalls.post("/order/chap", orderData);
      setShowConfirmation(false);
      showAlert(
        "✅ Order Placed!",
        `Your Chap Chap order has been placed successfully!\n\nItems: ${items.length}\nDelivery: ${deliveryInfo.label}`,
        () => {
          setItems([]);
          setNote("");
          navigation.navigate("/home");
        },
      );
    } catch (error) {
      showAlert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const itemTotal = (Number(item.estimatedTotal) || 0) * item.quantity;
    return (
      <Animated.View style={[styles.listItem, { opacity: fadeAnim }]}>
        <View style={styles.itemContent}>
          <View style={styles.itemLeft}>
            <View style={styles.itemNumber}>
              <Text style={styles.itemNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.itemInputs}>
              <TextInput
                style={styles.editableName}
                value={item.name}
                onChangeText={(val) => updateItemField(item.id, "name", val)}
                placeholder="Item name"
              />
              <TextInput
                style={styles.editablePrice}
                value={String(item.estimatedTotal)}
                onChangeText={(val) =>
                  updateItemField(item.id, "estimatedTotal", val)
                }
                placeholder="Est. Price (UGX)"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.itemRight}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Ionicons name="remove" size={16} color={colors.lime} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Ionicons name="add" size={16} color={colors.lime} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Ionicons name="close" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemFooter}>
          <Text style={styles.itemTotalText}>
            Subtotal: UGX {itemTotal.toLocaleString()}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Chap Chap</Text>

        {/* Only show delete icon if items exist */}
        {items.length > 0 ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              showAlert(
                "Clear List",
                "Are you sure you want to clear your shopping list?",
                () => {
                  setItems([]);
                  setCurrentItem({ name: "", estimatedTotal: "" });
                },
                () => {},
                true,
                "Clear",
              );
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.deliveryCard,
              { borderColor: deliveryInfo?.color || colors.lime },
            ]}
          >
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryIconContainer}>
                <Ionicons
                  name={deliveryInfo?.icon || "sunny-outline"}
                  size={28}
                  color={deliveryInfo?.color || colors.lime}
                />
              </View>
              <View style={styles.deliveryText}>
                <Text style={styles.deliveryLabel}>
                  {deliveryInfo?.label || "Delivery"}
                </Text>
                <Text style={styles.deliveryTime}>
                  {deliveryInfo?.time || ""}
                </Text>
              </View>
              <View style={styles.deliveryTimer}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={deliveryInfo?.color || colors.lime}
                />
                <Text
                  style={[
                    styles.deliveryTimerText,
                    { color: deliveryInfo?.color || colors.lime },
                  ]}
                >
                  {deliveryInfo
                    ? getTimeRemaining(deliveryInfo.cutoffTime)
                    : ""}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Item..."
                placeholderTextColor="#999999"
                value={currentItem.name}
                onChangeText={(key) =>
                  setCurrentItem((prev) => ({ ...prev, name: key }))
                }
                returnKeyType="next"
              />
              <TextInput
                style={styles.inputPrice}
                placeholder="Est. Price"
                placeholderTextColor="#999999"
                value={currentItem.estimatedTotal}
                onChangeText={(key) =>
                  setCurrentItem((prev) => ({ ...prev, estimatedTotal: key }))
                }
                onSubmitEditing={addItem}
                returnKeyType="done"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !currentItem.name.trim() && styles.addButtonDisabled,
                ]}
                onPress={addItem}
                disabled={!currentItem.name.trim()}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {items.length > 0 ? (
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Your Shopping List</Text>
                <Text style={styles.listCount}>{items.length} items</Text>
              </View>
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color="#cccccc" />
              <Text style={styles.emptyStateTitle}>Your list is empty</Text>
            </View>
          )}

          {items.length > 0 && (
            <View style={styles.noteContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note for vendors (optional)"
                placeholderTextColor="#999999"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          )}

          {items.length > 0 && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                !deliveryInfo?.isAvailable && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!deliveryInfo?.isAvailable || loading}
            >
              <Text style={styles.submitButtonText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- ROOT LEVEL MODALS FOR WEB SAFETY --- */}

      {/* 1. Destination Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDestination}
        onRequestClose={() => setShowDestination(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Where should we Deliver?</Text>
              <TouchableOpacity onPress={() => setShowDestination(false)}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.destinationInputContainer}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={colors.lime}
                  style={styles.destinationIcon}
                />
                <TextInput
                  style={styles.destinationInput}
                  placeholder="Hostel, block, room..."
                  value={destination}
                  onChangeText={setDestination}
                  autoFocus
                />
              </View>
              <View style={styles.destinationInfoCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#0ea5e9"
                />
                <Text style={styles.destinationInfoText}>
                  This helps vendors know where to deliver your items.
                </Text>
              </View>
              <View style={styles.destinationActions}>
                <TouchableOpacity
                  style={[
                    styles.destinationButton,
                    styles.destinationCancelButton,
                  ]}
                  onPress={() => setShowDestination(false)}
                >
                  <Text style={styles.destinationCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.destinationButton,
                    styles.destinationNextButton,
                    (!destination || loading) &&
                      styles.destinationButtonDisabled,
                  ]}
                  onPress={() => {
                    setShowConfirmation(true);
                    setShowDestination(false);
                  }}
                  disabled={loading || !destination}
                >
                  <Text style={styles.destinationNextText}>
                    Next <Ionicons name="checkmark" size={18} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Review Order Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmation}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Your Order</Text>
              <TouchableOpacity onPress={() => setShowConfirmation(false)}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.confirmationLabel}>
                Items ({items.length})
              </Text>
              {items.map((item, index) => (
                <View key={item.id} style={styles.confirmationItem}>
                  <Text style={styles.confirmationItemName}>
                    {index + 1}. {item.name}
                  </Text>
                  <Text style={styles.confirmationItemQty}>
                    ×{item.quantity} (UGX{" "}
                    {(
                      (Number(item.estimatedTotal) || 0) * item.quantity
                    ).toLocaleString()}
                    )
                  </Text>
                </View>
              ))}
              <View style={styles.confirmationTotalRow}>
                <Text style={styles.confirmationTotalLabel}>
                  Est. Grand Total:
                </Text>
                <Text style={styles.confirmationTotalValue}>
                  UGX{" "}
                  {items
                    .reduce(
                      (sum, item) =>
                        sum +
                        (Number(item.estimatedTotal) || 0) * item.quantity,
                      0,
                    )
                    .toLocaleString()}
                </Text>
              </View>

              {note ? (
                <>
                  <Text style={[styles.confirmationLabel, { marginTop: 16 }]}>
                    Note
                  </Text>
                  <Text style={styles.confirmationNote}>{note}</Text>
                </>
              ) : null}

              <Text style={[styles.confirmationLabel, { marginTop: 16 }]}>
                Delivery Location
              </Text>
              <Text style={styles.confirmationNote}>{destination}</Text>

              <View style={styles.confirmationNoteCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#0ea5e9"
                />
                <Text style={styles.confirmationNoteText}>
                  Vendors will review your list and reach out with exact market
                  pricing and availability.
                </Text>
              </View>
            </ScrollView>
            <View style={styles.destinationActions}>
              <TouchableOpacity
                style={[
                  styles.destinationButton,
                  styles.destinationCancelButton,
                ]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.destinationCancelText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.destinationButton, styles.destinationNextButton]}
                onPress={confirmOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.destinationNextText}>
                    Place Order <Ionicons name="checkmark" size={18} />
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Custom Alert */}
      <WebSafeAlert {...alertConfig} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  clearButton: { padding: 4 },
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Delivery Card
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
  },
  deliveryHeader: { flexDirection: "row", alignItems: "center" },
  deliveryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deliveryText: { flex: 1 },
  deliveryLabel: { fontSize: 16, fontWeight: "bold", color: "#334155" },
  deliveryTime: { fontSize: 13, color: "#666666", marginTop: 2 },
  deliveryTimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deliveryTimerText: { fontSize: 12, fontWeight: "600" },

  // Input Area
  inputContainer: { marginTop: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingLeft: 16,
  },
  input: { flex: 1.5, paddingVertical: 14, fontSize: 16, color: "#334155" },
  inputPrice: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#334155",
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
    paddingLeft: 10,
  },
  addButton: {
    backgroundColor: colors.lime,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  addButtonDisabled: { backgroundColor: "#cccccc" },

  // List Section
  listSection: { marginTop: 20 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: { fontSize: 16, fontWeight: "bold", color: "#334155" },
  listCount: { fontSize: 13, color: "#666666" },
  listContent: { gap: 8 },
  listItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itemNumberText: { fontSize: 12, fontWeight: "bold", color: colors.lime },
  itemInputs: { flex: 1, gap: 4 },
  editableName: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
    padding: 0,
  },
  editablePrice: { fontSize: 13, color: "#666", padding: 0 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 34,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: { padding: 4 },
  itemFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    alignItems: "flex-end",
  },
  itemTotalText: { fontSize: 13, fontWeight: "600", color: colors.lime },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 12,
  },

  // Note & Submit
  noteContainer: { marginTop: 16 },
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: colors.lime,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: { backgroundColor: "#cccccc" },
  submitButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  bottomSpacing: { height: 20 },

  // Redesigned Modals (Web-Safe & Scalable)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 500,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  modalContent: { padding: 20 },

  destinationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  destinationIcon: { marginRight: 12 },
  destinationInput: { flex: 1, fontSize: 16, color: "#334155" },
  destinationInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 24,
  },
  destinationInfoText: { flex: 1, fontSize: 13, color: "#0ea5e9" },

  destinationActions: { flexDirection: "row", gap: 12, paddingHorizontal: 20 },
  destinationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  destinationCancelButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  destinationCancelText: { fontSize: 15, fontWeight: "600", color: "#334155" },
  destinationNextButton: { backgroundColor: colors.lime },
  destinationButtonDisabled: { backgroundColor: "#ccc" },
  destinationNextText: { fontSize: 15, fontWeight: "600", color: "#FFF" },

  confirmationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
  },
  confirmationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  confirmationItemName: { fontSize: 15, color: "#334155", fontWeight: "500" },
  confirmationItemQty: { fontSize: 14, color: "#64748b" },
  confirmationTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 8,
  },
  confirmationTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  confirmationTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.lime,
  },
  confirmationNote: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#334155",
  },
  confirmationNoteCard: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  confirmationNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#0ea5e9",
    lineHeight: 18,
  },

  // Custom Alert Specifics
  alertBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  alertActions: { flexDirection: "row", gap: 12, width: "100%" },
  alertBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  alertBtnCancelText: { color: "#475569", fontWeight: "600", fontSize: 15 },
  alertBtnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.lime,
    alignItems: "center",
  },
  alertBtnConfirmText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
});

export default BuyChapChapScreen;
