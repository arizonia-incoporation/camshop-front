// app/(profile)/chap-chap/[id].js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppCalls from "../../../utils/network";
import { useAuth } from "../../../context/AuthContext";

// ==========================================
// 1. WEB-SAFE CONFIRMATION MODAL
// ==========================================
const ConfirmationModal = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  loading,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertActions}>
          <TouchableOpacity
            style={styles.alertBtnCancel}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.alertBtnCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.alertBtnConfirm}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.alertBtnConfirmText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ==========================================
// 2. ITEM EDIT MODAL
// ==========================================
const EditItemModal = ({
  visible,
  item,
  onClose,
  onSave,
  userRole,
  orderStatus,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "1",
    estimatedTotal: "0",
    actualTotal: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: String(item.quantity),
        estimatedTotal: String(item.estimatedTotal),
        actualTotal: item.actualTotal !== null ? String(item.actualTotal) : "",
      });
    }
  }, [item]);

  const canUserEdit = userRole === "user" && orderStatus === "PENDING";
  const canTransporterEdit =
    (userRole === "deliverer" || userRole === "transporter") &&
    orderStatus === "PROCESSING";

  const handleSave = () => {
    onSave({
      ...formData,
      quantity: parseInt(formData.quantity) || 1,
      estimatedTotal: parseInt(formData.estimatedTotal) || 0,
      actualTotal: formData.actualTotal ? parseInt(formData.actualTotal) : null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Edit Item</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(t) => setFormData({ ...formData, name: t })}
            editable={canUserEdit}
          />

          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={formData.quantity}
            keyboardType="numeric"
            onChangeText={(t) => setFormData({ ...formData, quantity: t })}
            editable={canUserEdit}
          />

          <Text style={styles.inputLabel}>Estimated Price (UGX)</Text>
          <TextInput
            style={styles.input}
            value={formData.estimatedTotal}
            keyboardType="numeric"
            onChangeText={(t) =>
              setFormData({ ...formData, estimatedTotal: t })
            }
            editable={canUserEdit}
          />

          {canTransporterEdit && (
            <>
              <Text style={styles.inputLabel}>
                Actual Price (UGX) - Transporter Only
              </Text>
              <TextInput
                style={styles.input}
                value={formData.actualTotal}
                keyboardType="numeric"
                placeholder="Enter actual price found"
                onChangeText={(t) =>
                  setFormData({ ...formData, actualTotal: t })
                }
              />
            </>
          )}

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// 3. DELIVERY DETAILS MODAL (Fee & Note)
// ==========================================
const DeliveryActionModal = ({
  visible,
  onClose,
  onSave,
  loading,
  initialFee,
  initialNote,
}) => {
  const [fee, setFee] = useState(initialFee || "");
  const [note, setNote] = useState(initialNote || "");

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Delivery Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Delivery Fee (UGX)</Text>
          <TextInput
            style={styles.input}
            value={String(fee)}
            keyboardType="numeric"
            placeholder="e.g., 5000"
            onChangeText={setFee}
          />

          <Text style={styles.inputLabel}>Delivery Note / Comments</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={note}
            multiline
            textAlignVertical="top"
            placeholder="Add a note for the user..."
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => onSave(parseInt(fee) || 0, note)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Details</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// 4. ITEM CARD COMPONENT
// ==========================================
const ItemCard = ({
  item,
  index,
  isSelectable,
  isSelected,
  onToggleSelect,
  onPress,
}) => {
  const isFound = item.status === "FOUND";
  const isUnavailable = item.status === "UNAVAILABLE";

  return (
    <TouchableOpacity
      style={[styles.itemCard, isSelected && styles.itemCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isSelectable && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={onToggleSelect}
        >
          <Ionicons
            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={isSelected ? "#0ea5e9" : "#ccc"}
          />
        </TouchableOpacity>
      )}

      <View style={styles.itemLeft}>
        <Text style={styles.itemNumber}>{index + 1}.</Text>
        <View>
          <Text style={[styles.itemName, isUnavailable && styles.textStrike]}>
            {item.name}
          </Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        {/* Price Display Logic */}
        {isUnavailable ? (
          <Text style={styles.itemUnavailable}>Out of Stock</Text>
        ) : (
          <>
            {item.actualTotal !== null && item.actualTotal !== undefined ? (
              <>
                <Text style={styles.itemEstimateStrike}>
                  UGX {item.estimatedTotal.toLocaleString()}
                </Text>
                <Text style={styles.itemActual}>
                  UGX {item.actualTotal.toLocaleString()}
                </Text>
              </>
            ) : (
              <Text style={styles.itemEstimate}>
                UGX {item.estimatedTotal.toLocaleString()}
              </Text>
            )}
          </>
        )}

        {/* Status Icon */}
        {isFound && (
          <Ionicons
            name="checkmark-circle"
            size={16}
            color="#22c55e"
            style={{ marginTop: 4 }}
          />
        )}
        {isUnavailable && (
          <Ionicons
            name="close-circle"
            size={16}
            color="#ef4444"
            style={{ marginTop: 4 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// 5. MAIN SCREEN
// ==========================================
export default function ChapChapOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  // Replace this with actual role if 'deliverer' is used instead of 'transporter'
  const userRole = user?.role || "user";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Modal States
  const [editItem, setEditItem] = useState(null);
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      // TODO: Replace with your actual GET endpoint
      // const response = await AppCalls.get(`/order/chap/${id}`);
      // setOrder(response.data);

      // Mock Data for UI testing
      setOrder({
        id,
        status: "PROCESSING",
        location: "Main Campus Hostel",
        note: "Please get fresh tomatoes",
        createdAt: new Date().toISOString(),
        delivery: { fees: 0, note: "" },
        items: [
          {
            id: "1",
            name: "Tomatoes",
            quantity: 5,
            estimatedTotal: 5000,
            actualTotal: null,
            status: "PENDING",
          },
          {
            id: "2",
            name: "Onions",
            quantity: 2,
            estimatedTotal: 2000,
            actualTotal: null,
            status: "PENDING",
          },
        ],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Totals Calculation
  const totals = useMemo(() => {
    if (!order) return { itemsTotal: 0, grandTotal: 0 };
    const itemsTotal = order.items.reduce((sum, item) => {
      if (item.status === "UNAVAILABLE") return sum;
      return (
        sum +
        (item.actualTotal !== null ? item.actualTotal : item.estimatedTotal)
      );
    }, 0);
    const deliveryFee = order.delivery?.fees || 0;
    return { itemsTotal, deliveryFee, grandTotal: itemsTotal + deliveryFee };
  }, [order]);

  const toggleSelect = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleBulkAction = async (status) => {
    try {
      setActionLoading(true);
      // TODO: Call API for bulk update
      // await AppCalls.put(`/order/chap/${order.id}/bulk-items`, { itemIds: selectedItemIds, status });

      // Local State Update (Simulated)
      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (selectedItemIds.includes(item.id)) {
            return {
              ...item,
              status,
              actualTotal:
                status === "FOUND"
                  ? item.estimatedTotal
                  : status === "UNAVAILABLE"
                    ? 0
                    : null,
            };
          }
          return item;
        }),
      }));
      setSelectedItemIds([]);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveItem = async (updatedData) => {
    try {
      setActionLoading(true);
      const isTransporter =
        userRole === "deliverer" || userRole === "transporter";
      const newStatus =
        isTransporter && updatedData.actualTotal !== null
          ? "FOUND"
          : editItem.status;

      // TODO: API Call
      // await AppCalls.put(`/order/chap/${order.id}/item/${editItem.id}`, { ...updatedData, status: newStatus });

      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === editItem.id
            ? { ...i, ...updatedData, status: newStatus }
            : i,
        ),
      }));
      setEditItem(null);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDeliveryDetails = async (fees, note) => {
    try {
      setActionLoading(true);
      // TODO: API Call
      // await AppCalls.put(`/order/chap/${order.id}/delivery`, { fees, note });

      setOrder((prev) => ({
        ...prev,
        delivery: { ...prev.delivery, fees, note },
      }));
      setFeeModalVisible(false);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const showConfirm = (title, message, action) => {
    setConfirmConfig({
      visible: true,
      title,
      message,
      onConfirm: async () => {
        setActionLoading(true);
        await action();
        setActionLoading(false);
        setConfirmConfig((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  if (loading || !order) {
    return (
      <ActivityIndicator size="large" color="#f59e0b" style={styles.centered} />
    );
  }

  const isTransporter = userRole === "deliverer" || userRole === "transporter";
  const canBulkSelect = isTransporter && order.status === "PROCESSING";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.orderIdText}>
            Order #{order.id.slice(0, 6).toUpperCase()}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
          <Text style={styles.locationText}>
            <Ionicons name="location" /> {order.location}
          </Text>

          {/* User Note */}
          {order.note && (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>User Note:</Text>
              <Text style={styles.noteText}>{order.note}</Text>
            </View>
          )}

          {/* Transporter Note */}
          {order.delivery?.note && (
            <View
              style={[
                styles.noteBox,
                { backgroundColor: "#e0f2fe", borderColor: "#bae6fd" },
              ]}
            >
              <Text style={styles.noteLabel}>Transporter Note:</Text>
              <Text style={styles.noteText}>{order.delivery.note}</Text>
            </View>
          )}
        </View>

        {/* ITEMS LIST */}
        <Text style={styles.sectionTitle}>Shopping List</Text>
        {order.items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            index={index}
            isSelectable={canBulkSelect}
            isSelected={selectedItemIds.includes(item.id)}
            onToggleSelect={() => toggleSelect(item.id)}
            onPress={() => setEditItem(item)}
          />
        ))}

        {/* PRICING SUMMARY */}
        <View style={styles.pricingCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Total</Text>
            <Text style={styles.priceValue}>
              UGX {totals.itemsTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>
              UGX {totals.deliveryFee.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelTotal}>Grand Total</Text>
            <Text style={styles.priceValueTotal}>
              UGX {totals.grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionContainer}>
          {isTransporter && order.status === "PROCESSING" && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#0ea5e9" }]}
              onPress={() => setFeeModalVisible(true)}
            >
              <Text style={styles.btnText}>Set Fee & Note</Text>
            </TouchableOpacity>
          )}

          {isTransporter && order.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#22c55e" }]}
              onPress={() =>
                showConfirm(
                  "Accept Order",
                  "Do you want to accept this order?",
                  () => {
                    /* API Call to Accept */
                  },
                )
              }
            >
              <Text style={styles.btnText}>Accept Order</Text>
            </TouchableOpacity>
          )}

          {isTransporter && order.status === "PROCESSING" && (
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: "#f59e0b", marginTop: 10 },
              ]}
              onPress={() =>
                showConfirm(
                  "Mark Delivered",
                  "Are you sure this order is delivered?",
                  () => {
                    /* API Call to Deliver */
                  },
                )
              }
            >
              <Text style={styles.btnText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* FLOATING BULK ACTION BAR */}
      {selectedItemIds.length > 0 && (
        <View style={styles.floatingBar}>
          <Text style={styles.floatingText}>
            {selectedItemIds.length} Selected
          </Text>
          <View style={styles.floatingActions}>
            <TouchableOpacity
              style={[styles.bulkBtn, { backgroundColor: "#ef4444" }]}
              onPress={() => handleBulkAction("UNAVAILABLE")}
              disabled={actionLoading}
            >
              <Text style={styles.btnText}>Unavailable</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkBtn, { backgroundColor: "#22c55e" }]}
              onPress={() => handleBulkAction("FOUND")}
              disabled={actionLoading}
            >
              <Text style={styles.btnText}>Mark Found</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODALS */}
      <EditItemModal
        visible={!!editItem}
        item={editItem}
        userRole={userRole}
        orderStatus={order.status}
        onClose={() => setEditItem(null)}
        onSave={handleSaveItem}
        loading={actionLoading}
      />

      <DeliveryActionModal
        visible={feeModalVisible}
        initialFee={order.delivery?.fees}
        initialNote={order.delivery?.note}
        onClose={() => setFeeModalVisible(false)}
        onSave={handleSaveDeliveryDetails}
        loading={actionLoading}
      />

      <ConfirmationModal
        visible={confirmConfig.visible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() => setConfirmConfig({ ...confirmConfig, visible: false })}
        onConfirm={confirmConfig.onConfirm}
        loading={actionLoading}
      />
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 100 },

  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: { fontSize: 12, fontWeight: "bold", color: "#f59e0b" },
  locationText: { fontSize: 14, color: "#64748b", marginBottom: 12 },

  noteBox: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  noteText: { fontSize: 14, color: "#b45309" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },

  // Item Card
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  itemCardSelected: { borderColor: "#0ea5e9", backgroundColor: "#f0f9ff" },
  checkboxContainer: { padding: 4, marginRight: 8 },
  itemLeft: { flexDirection: "row", flex: 1, alignItems: "center" },
  itemNumber: {
    fontSize: 14,
    color: "#94a3b8",
    marginRight: 8,
    fontWeight: "bold",
  },
  itemName: { fontSize: 15, fontWeight: "600", color: "#334155" },
  textStrike: { textDecorationLine: "line-through", color: "#94a3b8" },
  itemQuantity: { fontSize: 13, color: "#64748b", marginTop: 2 },
  itemRight: { alignItems: "flex-end" },
  itemEstimate: { fontSize: 14, fontWeight: "600", color: "#334155" },
  itemEstimateStrike: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  itemActual: { fontSize: 15, fontWeight: "bold", color: "#22c55e" },
  itemUnavailable: { fontSize: 14, fontWeight: "bold", color: "#ef4444" },

  // Pricing Summary
  pricingCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: { fontSize: 14, color: "#64748b" },
  priceValue: { fontSize: 14, color: "#334155", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 12 },
  priceLabelTotal: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  priceValueTotal: { fontSize: 18, fontWeight: "bold", color: "#f59e0b" },

  // Actions
  actionContainer: { marginTop: 24 },
  btn: { padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  // Floating Bulk Bar
  floatingBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingText: { color: "#fff", fontWeight: "bold" },
  floatingActions: { flexDirection: "row", gap: 8 },
  bulkBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },

  // Modals shared
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginTop: "auto",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  inputLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#f8fafc",
    color: "#334155",
  },
  saveBtn: {
    backgroundColor: "#f59e0b",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Alert Box
  alertBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
  },
  alertActions: { flexDirection: "row", gap: 12, width: "100%" },
  alertBtnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  alertBtnCancelText: { color: "#475569", fontWeight: "600" },
  alertBtnConfirm: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f59e0b",
    alignItems: "center",
  },
  alertBtnConfirmText: { color: "#fff", fontWeight: "600" },
});
