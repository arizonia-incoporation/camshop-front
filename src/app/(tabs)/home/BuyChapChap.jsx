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
  Alert,
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

const BuyChapChapScreen = () => {
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ name: "", amount: 0 });
  const [note, setNote] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDestination, setShowDestination] = useState(false);
  const [destination, setDestination] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  // Delivery time detection
  const getDeliveryInfo = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Afternoon delivery: 10:00 AM to 12:30 PM
    if (
      (hours === 10 && minutes >= 0) ||
      hours === 11 ||
      (hours === 12 && minutes <= 30)
    ) {
      // Check if it's after 11:30 AM (cutoff for afternoon delivery)
      if (hours === 12 && minutes > 0 && minutes <= 30) {
        // Still within afternoon window
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
        // Before 12:30 PM
        const cutoffTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          12,
          30,
          0,
        );
        return {
          type: "afternoon",
          label: "Afternoon Delivery",
          time: "by 2:00 PM",
          cutoff: "12:30 PM",
          cutoffTime: cutoffTime,
          isAvailable: true,
          icon: "sunny-outline",
          color: colors.lime,
        };
      }
    }

    // Evening delivery: After 12:30 PM, before 5:00 PM (cutoff for evening)
    if (hours >= 13 && hours < 17) {
      const cutoffTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        17,
        0,
        0,
      );
      return {
        type: "evening",
        label: "Evening Delivery",
        time: "by 7:00 PM",
        cutoff: "5:00 PM",
        cutoffTime: cutoffTime,
        isAvailable: true,
        icon: "moon-outline",
        color: "#0ea5e9",
      };
    }

    // After 5:00 PM - Next day afternoon
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

  // Get time remaining
  const getTimeRemaining = (cutoffTime) => {
    const now = new Date();
    const diff = cutoffTime - now;

    if (diff <= 0) return "Time expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  useEffect(() => {
    const info = getDeliveryInfo();
    setDeliveryInfo(info);

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Update timer every minute
  useEffect(() => {
    if (deliveryInfo) {
      const interval = setInterval(() => {
        const updatedInfo = getDeliveryInfo();
        setDeliveryInfo(updatedInfo);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [deliveryInfo]);

  const addItem = () => {
    if (currentItem.name.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          ...currentItem,
          quantity: 1,
        },
      ]);
      setCurrentItem({ name: "", amount: 0 });
      inputRef.current?.focus();
    }
  };

  const removeItem = (id) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setItems(items.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const updateQuantity = (id, change) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      Alert.alert(
        "Empty List",
        "Please add at least one item to your shopping list.",
      );
      return;
    }

    if (!deliveryInfo.isAvailable) {
      Alert.alert(
        "Delivery Not Available",
        "Please wait for the next delivery window.",
      );
      return;
    }

    setShowDestination(true);
  };

  const confirmOrder = async () => {
    setLoading(true);
    
    const vrr = items.map((tx) => ({ name: tx.name, amount: Number(tx.amount), quantity: Number(tx.quantity) }));

    // Prepare order data
    const orderData = {
      items: vrr,
      note: note,
      location: destination,
      total: 0,
    };

    console.log("Order Data:", orderData);

    // Simulate API call
    try {
      await AppCalls.post("/order/chap", orderData);

      Alert.alert(
        "✅ Order Placed!",
        `Your Chap Chap order has been placed successfully!\n\nItems: ${items.length}\nDelivery: ${deliveryInfo.label}\n\nVendors will review your list and get back to you.`,
        [
          {
            text: "View Orders",
            onPress: () => {
              setShowConfirmation(false);
              setItems([]);
              setNote("");
              navigation.navigate("/home");
            },
          },
          {
            text: "Continue Shopping",
            onPress: () => {
              setShowConfirmation(false);
              setItems([]);
              setNote("");
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderDeliveryInfo = () => (
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
          <Text style={styles.deliveryTime}>{deliveryInfo?.time || ""}</Text>
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
            {deliveryInfo ? getTimeRemaining(deliveryInfo.cutoffTime) : ""}
          </Text>
        </View>
      </View>
      <Text style={styles.deliveryCutoff}>
        Cutoff: {deliveryInfo?.cutoff || ""}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.listItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          animation: {
            delay: index * 100,
          },
        },
      ]}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemLeft}>
          <View style={styles.itemNumber}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemName}>{item.amount}</Text>
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
    </Animated.View>
  );

  const renderConfirmationModal = () => (
    <View style={styles.confirmationOverlay}>
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationHeader}>
          <Text style={styles.confirmationTitle}>Review Your Order</Text>
          <TouchableOpacity
            style={styles.confirmationClose}
            onPress={() => setShowConfirmation(false)}
          >
            <Ionicons name="close" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.confirmationContent}>
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>Items ({items.length})</Text>
            {items.map((item, index) => (
              <View key={item.id} style={styles.confirmationItem}>
                <Text style={styles.confirmationItemName}>
                  {index + 1}. {item.name}
                </Text>
                <Text style={styles.confirmationItemQty}>×{item.quantity}</Text>
              </View>
            ))}
          </View>

          {note && (
            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationLabel}>Note</Text>
              <Text style={styles.confirmationNote}>{note}</Text>
            </View>
          )}

          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>Delivery</Text>
            <View style={styles.confirmationDelivery}>
              <Ionicons
                name={deliveryInfo?.icon || "sunny-outline"}
                size={20}
                color={deliveryInfo?.color || colors.lime}
              />
              <Text style={styles.confirmationDeliveryText}>
                {deliveryInfo?.label} - {deliveryInfo?.time}
              </Text>
            </View>
          </View>

          <View style={styles.confirmationNote}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#0ea5e9"
            />
            <Text style={styles.confirmationNoteText}>
              Vendors will review your list and reach out with pricing and
              availability.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.confirmationActions}>
          <TouchableOpacity
            style={[styles.confirmationButton, styles.confirmationCancel]}
            onPress={() => setShowConfirmation(false)}
          >
            <Text style={styles.confirmationCancelText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmationButton, styles.confirmationConfirm]}
            onPress={confirmOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.confirmationConfirmText}>Place Order</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Destination Modal with Styling
  const renderDestinationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDestination}
      onRequestClose={() => setShowDestination(false)}
    >
      <View style={[styles.modalOverlay, styles.confirmationOverlay]}>
        <View style={[styles.modalContainer, { width: "100%", height: "36%",  }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Where should we Deliver?</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDestination(false)}
            >
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.modalKeyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100}
          >
            <View style={styles.modalContent}>
              {/* Location Input */}
              <View style={styles.destinationInputWrapper}>
                <View style={styles.destinationInputContainer}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={colors.lime}
                    style={styles.destinationIcon}
                  />
                  <TextInput
                    ref={inputRef}
                    style={styles.destinationInput}
                    placeholder="Enter your hostel, block, room number..."
                    placeholderTextColor="#999999"
                    value={destination}
                    onChangeText={setDestination}
                    returnKeyType="done"
                    autoFocus={true}
                  />
                </View>
                {!destination && (
                  <Text style={styles.destinationHint}>
                    ⚠️ Please enter your delivery location
                  </Text>
                )}
              </View>

              {/* Info Card */}
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

              {/* Action Buttons */}
              <View style={styles.destinationActions}>
                <TouchableOpacity
                  style={[
                    styles.destinationButton,
                    styles.destinationCancelButton,
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "Clear List",
                      "Are you sure you want to clear your shopping list?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear",
                          style: "destructive",
                          onPress: () => {
                            setItems([]);
                            setCurrentItem({ name: "", amount: 0 });
                            setShowDestination(false);
                          },
                        },
                      ],
                    );
                  }}
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
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.destinationNextText}>Next</Text>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Delivery Info */}
              <View style={styles.deliveryInfoContainer}>
                <View style={styles.deliveryInfoRow}>
                  <Ionicons name="time-outline" size={16} color={colors.lime} />
                  <Text style={styles.deliveryInfoLabel}>
                    {deliveryInfo?.label || "Delivery"}
                  </Text>
                </View>
                <View style={styles.deliveryInfoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.lime}
                  />
                  <Text style={styles.deliveryInfoLabel}>
                    {deliveryInfo?.time || ""}
                  </Text>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            if (items.length > 0) {
              Alert.alert(
                "Clear List",
                "Are you sure you want to clear your shopping list?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                      setItems([]);
                      setCurrentItem({ name: "", amount: 0 });
                    },
                  },
                ],
              );
            }
          }}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={items.length > 0 ? "#ef4444" : "#cccccc"}
          />
        </TouchableOpacity>
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
          {/* Delivery Info */}
          {renderDeliveryInfo()}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="bulb-outline" size={20} color={colors.lime} />
            <Text style={styles.infoText}>
              Type what you need and we'll find it for you. No need to browse
              through the app!
            </Text>
          </View>

          {/* Input Area */}
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
                returnKeyType="done"
              />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Price..."
                placeholderTextColor="#999999"
                value={currentItem.amount}
                onChangeText={(key) =>
                  setCurrentItem((prev) => ({ ...prev, amount: key }))
                }
                onSubmitEditing={addItem}
                returnKeyType="done"
                keyboardType="number-pad"
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

          {/* Items List */}
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
              <Text style={styles.emptyStateSubtitle}>
                Start typing items you need and tap the + button to add them
              </Text>
            </View>
          )}

          {/* Note Input */}
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

          {/* Submit Button */}
          {items.length > 0 && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                !deliveryInfo?.isAvailable && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!deliveryInfo?.isAvailable || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Proceed to Checkout</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      {showConfirmation && renderConfirmationModal()}
      {renderDestinationModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  clearButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  // Delivery Card
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deliveryText: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  deliveryTime: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  deliveryTimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deliveryTimerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deliveryCutoff: {
    fontSize: 12,
    color: "#999999",
    marginTop: 8,
    marginLeft: 56,
  },
  // Info Card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  // Input Area
  inputContainer: {
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingLeft: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#334155",
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
  addButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  // List Section
  listSection: {
    marginTop: 20,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  listCount: {
    fontSize: 13,
    color: "#666666",
  },
  listContent: {
    gap: 8,
  },
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
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.lime,
  },
  itemName: {
    fontSize: 15,
    color: "#334155",
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 50,
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
  removeButton: {
    padding: 4,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  // Note Container
  noteContainer: {
    marginTop: 16,
  },
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#334155",
    minHeight: 80,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Submit Button
  submitButton: {
    flexDirection: "row",
    backgroundColor: colors.lime,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bottomSpacing: {
    height: 20,
  },
  // Confirmation Modal
  confirmationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  confirmationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
  },
  confirmationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  confirmationClose: {
    padding: 4,
  },
  confirmationContent: {
    flexGrow: 1,
  },
  confirmationSection: {
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  confirmationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  confirmationItemName: {
    fontSize: 14,
    color: "#334155",
  },
  confirmationItemQty: {
    fontSize: 14,
    color: "#666666",
  },
  confirmationNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  confirmationNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#0ea5e9",
    lineHeight: 18,
  },
  confirmationDelivery: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  confirmationDeliveryText: {
    fontSize: 14,
    color: "#334155",
  },
  confirmationActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  confirmationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  confirmationCancel: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  confirmationCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  confirmationConfirm: {
    backgroundColor: colors.lime,
  },
  confirmationConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Add these styles to your StyleSheet
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 350,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  // Destination Input
  destinationInputWrapper: {
    marginBottom: 16,
  },
  destinationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    minHeight: 56,
  },
  destinationIcon: {
    marginRight: 12,
  },
  destinationInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#334155",
  },
  destinationHint: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
    marginLeft: 4,
  },
  // Info Card
  destinationInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  destinationInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#0ea5e9",
    lineHeight: 18,
  },
  // Action Buttons
  destinationActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
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
  destinationCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  destinationNextButton: {
    backgroundColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  destinationButtonDisabled: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
  },
  destinationNextText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Delivery Info
  deliveryInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  deliveryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deliveryInfoLabel: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
});

export default BuyChapChapScreen;
