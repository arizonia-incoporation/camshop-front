// app/(profile)/components/ChapChapDetailsModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ChapChapPriceEditor from "./ChapChapPriceEditor";

const ChapChapDetailsModal = ({
  visible,
  order,
  onClose,
  userRole,
  onUpdate,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [updatedItems, setUpdatedItems] = useState([]);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    console.log(order)
    if (order) {
      setUpdatedItems(order.items.map((item) => ({ ...item })));
    }
  }, [order]);

  if (!order) return null;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "Pending", color: "#f59e0b", icon: "time-outline" },
      assigned: {
        label: "Assigned",
        color: "#0ea5e9",
        icon: "bicycle-outline",
      },
      in_progress: {
        label: "In Progress",
        color: "#8b5cf6",
        icon: "cart-outline",
      },
      delivered: {
        label: "Delivered",
        color: "#22c55e",
        icon: "checkmark-circle-outline",
      },
      cancelled: {
        label: "Cancelled",
        color: "#ef4444",
        icon: "close-circle-outline",
      },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);

  const getTimeAgo = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInSeconds = Math.floor((now - orderDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffInSeconds < 172800) return "Yesterday";
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  };

  const handlePriceChange = (itemId, newPrice) => {
    setUpdatedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, actualPrice: newPrice } : item,
      ),
    );
  };

  const handleApplyPrice = async (itemId, price) => {
    try {
      // API call to update item price
      await updateChapChapOrder(order.id, {
        itemId,
        price,
        action: "update_price",
      });
      Alert.alert("Success", "Price updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update price");
    }
  };

  const handleUpdateOrder = async () => {
    setLoading(true);
    try {
      const total = updatedItems.reduce(
        (sum, item) => sum + (item.actualPrice || 0) * item.quantity,
        0,
      );

      await updateChapChapOrder(order.id, {
        items: updatedItems,
        total,
        action: "update_order",
      });

      Alert.alert("Success", "Order updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this Chap Chap order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await cancelChapChapOrder(order.id);
              Alert.alert("Success", "Order cancelled successfully");
              onUpdate();
              onClose();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel order");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleMarkDelivered = async () => {
    if (!deliveryNote && showNoteInput) {
      Alert.alert(
        "Optional Note",
        "You can add a delivery note before confirming",
      );
      return;
    }

    Alert.alert("Confirm Delivery", "Mark this order as delivered?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Delivered",
        onPress: async () => {
          setLoading(true);
          try {
            await updateChapChapOrder(order.id, {
              status: "delivered",
              note: deliveryNote,
              action: "deliver",
            });
            Alert.alert("Success", "Order marked as delivered");
            onUpdate();
            onClose();
          } catch (error) {
            Alert.alert("Error", "Failed to update delivery status");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleAcceptOrder = async () => {
    setLoading(true);
    try {
      await updateChapChapOrder(order.id, {
        status: "assigned",
        action: "accept",
      });
      Alert.alert("Success", "Order accepted successfully");
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = () => {
    const itemsParam = JSON.stringify(
      order.items.map((item) => ({
        name: item.name,
        estimatedPrice: item.estimatedPrice || item.actualPrice,
      })),
    );

    router.push({
      pathname: "/(home)/buy-chap-chap",
      params: {
        items: itemsParam,
        location: order.location,
        reorder: "true",
      },
    });
    onClose();
  };

  const canEditPrices = userRole === "deliverer" || userRole === "admin";
  const canAccept = userRole === "deliverer" && order.status === "pending";
  const canMarkDelivered =
    userRole === "deliverer" && order.status === "in_progress";
  const canCancel =
    (userRole === "user" || userRole === "admin") &&
    (order.status === "pending" || order.status === "assigned");
  const canUpdate =
    canEditPrices &&
    (order.status === "pending" ||
      order.status === "assigned" ||
      order.status === "in_progress");
  const canReorder = userRole === "user" && order.status === "delivered";

  const renderActionButtons = () => {
    const buttons = [];

    if (canCancel) {
      buttons.push(
        <TouchableOpacity
          key="cancel"
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancelOrder}
          disabled={loading}
        >
          <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>,
      );
    }

    if (canAccept) {
      buttons.push(
        <TouchableOpacity
          key="accept"
          style={[styles.actionButton, styles.confirmButton]}
          onPress={handleAcceptOrder}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>,
      );
    }

    if (canMarkDelivered) {
      buttons.push(
        <TouchableOpacity
          key="deliver"
          style={[styles.actionButton, styles.confirmButton]}
          onPress={handleMarkDelivered}
          disabled={loading}
        >
          <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Delivered</Text>
        </TouchableOpacity>,
      );
    }

    if (canUpdate) {
      buttons.push(
        <TouchableOpacity
          key="update"
          style={[styles.actionButton, styles.updateButton]}
          onPress={handleUpdateOrder}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>,
      );
    }

    if (canReorder) {
      buttons.push(
        <TouchableOpacity
          key="reorder"
          style={[styles.actionButton, styles.reorderButton]}
          onPress={handleReorder}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reorder</Text>
        </TouchableOpacity>,
      );
    }

    // If no buttons, show a close button
    if (buttons?.length === 0) {
      buttons.push(
        <TouchableOpacity
          key="close"
          style={[styles.actionButton, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>,
      );
    }

    return buttons;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chap Chap Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
        >
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryId}>
                <Ionicons name="flash-outline" size={20} color="#f59e0b" />
                <Text style={styles.summaryIdText}>
                  CHAP-{order.id.slice(0, 6)}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryStatus,
                  { backgroundColor: statusConfig.color + "20" },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={14}
                  color={statusConfig.color}
                />
                <Text
                  style={[
                    styles.summaryStatusText,
                    { color: statusConfig.color },
                  ]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDetails}>
              <Text style={styles.summaryTime}>
                {getTimeAgo(order.createdAt)}
              </Text>
              <View style={styles.summaryLocation}>
                <Ionicons name="location-outline" size={16} color="#666666" />
                <Text style={styles.summaryLocationText}>{order.location}</Text>
              </View>
              <View style={styles.summaryMeta}>
                <Text style={styles.summaryMetaText}>
                  📦 {order?.items?.length} items
                </Text>
                <Text style={styles.summaryMetaText}>
                  💰 UGX{" "}
                  {updatedItems
                    .reduce(
                      (sum, item) =>
                        sum + (item.actualPrice || 0) * item.quantity,
                      0,
                    )
                    .toLocaleString()}
                </Text>
                <Text style={styles.summaryMetaText}>
                  🚚 {order.deliveryInfo?.label || "Delivery"}
                </Text>
              </View>
            </View>
          </View>
          {console.log(updatedItems)}

          {/* Items Section 
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            {updatedItems?.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemNumber}>{index + 1}.</Text>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <ChapChapPriceEditor
                    item={item}
                    onPriceChange={handlePriceChange}
                    onApply={handleApplyPrice}
                    isEditable={
                      canEditPrices &&
                      (order.status === "pending" ||
                        order.status === "assigned" ||
                        order.status === "in_progress")
                    }
                  />
                  <Text style={styles.itemTotal}>
                    Total: UGX{" "}
                    {((item.actualPrice || 0) * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View> */}

          {/* Delivery Note Input (for deliverer) */}
          {canMarkDelivered && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Note</Text>
              <TouchableOpacity
                style={styles.noteToggle}
                onPress={() => setShowNoteInput(!showNoteInput)}
              >
                <Ionicons
                  name={showNoteInput ? "chevron-up" : "add-circle-outline"}
                  size={20}
                  color="#f59e0b"
                />
                <Text style={styles.noteToggleText}>
                  {showNoteInput ? "Hide note" : "Add delivery note (optional)"}
                </Text>
              </TouchableOpacity>
              {showNoteInput && (
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note for the customer..."
                  placeholderTextColor="#999999"
                  value={deliveryNote}
                  onChangeText={setDeliveryNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            </View>
          )}

          {/* Delivery Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Info</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#666666" />
              <Text style={styles.infoText}>
                {order.deliveryInfo?.label} - {order.deliveryInfo?.time}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="#666666" />
              <Text style={styles.infoText}>
                Cutoff: {order.deliveryInfo?.cutoff}
              </Text>
            </View>
            {order.note && (
              <View style={styles.infoRow}>
                <Ionicons name="create-outline" size={18} color="#666666" />
                <Text style={styles.infoText}>Note: {order.note}</Text>
              </View>
            )}
          </View>

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal</Text>
              <Text style={styles.pricingValue}>
                UGX{" "}
                {updatedItems
                  .reduce(
                    (sum, item) =>
                      sum + (item.actualPrice || 0) * item.quantity,
                    0,
                  )
                  .toLocaleString()}
              </Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Delivery Fee</Text>
              <Text style={styles.pricingValue}>
                UGX {(order.pricing?.deliveryFee || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingRow}>
              <Text style={styles.pricingTotalLabel}>Total</Text>
              <Text style={styles.pricingTotalValue}>
                UGX{" "}
                {(
                  updatedItems.reduce(
                    (sum, item) =>
                      sum + (item.actualPrice || 0) * item.quantity,
                    0,
                  ) + (order.pricing?.deliveryFee || 0)
                ).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Deliverer Section */}
          {order.deliverer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deliverer</Text>
              <View style={styles.delivererCard}>
                <View style={styles.delivererAvatar}>
                  <Text style={styles.delivererInitial}>
                    {order.deliverer.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.delivererInfo}>
                  <Text style={styles.delivererName}>
                    {order.deliverer.name}
                  </Text>
                  <Text style={styles.delivererPhone}>
                    📞 {order.deliverer.phone}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Spacer for fixed actions */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.fixedActions}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#f59e0b" size="small" />
            </View>
          ) : (
            renderActionButtons()
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryId: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryIdText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  summaryStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  summaryStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  summaryDetails: {
    gap: 6,
  },
  summaryTime: {
    fontSize: 13,
    color: "#999999",
  },
  summaryLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryLocationText: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  summaryMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  summaryMetaText: {
    fontSize: 13,
    color: "#666666",
  },
  // Sections
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  // Items
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  itemNumber: {
    fontSize: 13,
    fontWeight: "500",
    color: "#999999",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666666",
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  itemTotal: {
    fontSize: 12,
    color: "#666666",
  },
  // Delivery Note
  noteToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  noteToggleText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "500",
  },
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#334155",
    minHeight: 80,
    textAlignVertical: "top",
  },
  // Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoText: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  // Pricing
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  pricingLabel: {
    fontSize: 14,
    color: "#666666",
  },
  pricingValue: {
    fontSize: 14,
    color: "#334155",
  },
  pricingDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 6,
  },
  pricingTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  pricingTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  // Deliverer
  delivererCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  delivererAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  delivererInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  delivererInfo: {
    flex: 1,
  },
  delivererName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
  },
  delivererPhone: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  // Fixed Actions
  fixedActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#fce4ec",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  confirmButton: {
    backgroundColor: "#f59e0b",
  },
  updateButton: {
    backgroundColor: "#0ea5e9",
  },
  reorderButton: {
    backgroundColor: "#22c55e",
  },
  closeButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ChapChapDetailsModal;
