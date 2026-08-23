// components/OrderItemCard.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors } from "../../theme/theme";
import { showToast } from "../../utils/toast";

const deliverySchema = z.object({
  deliveryFee: z.string().min(1, "Please enter delivery fee"),
  note: z.string().optional(),
});

const OrderItemCard = ({
  order,
  userRole, // 'user' or 'vendor'
  onCancelOrder,
  onConfirmOrder,
  onViewDetails,
}) => {
  const [timeAgo, setTimeAgo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState({
    cancelling: false,
    confirming: false
  });
  const animationValue = useRef(new Animated.Value(0)).current;
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      deliveryFee: "",
      note: "",
    },
  });

  useEffect(() => {
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [order?.orderedAt]);

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const updateTimeAgo = () => {
    const now = new Date();
    const orderDate = new Date(order.orderedAt || Date.now());
    const diffInSeconds = Math.floor((now - orderDate) / 1000);

    if (diffInSeconds < 60) {
      setTimeAgo("Just now");
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      setTimeAgo(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      if (hours < 24) {
        setTimeAgo(`${hours} hour${hours > 1 ? "s" : ""} ago`);
      } else {
        setTimeAgo("Yesterday");
      }
    } else if (diffInSeconds < 172800) {
      setTimeAgo("Yesterday");
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days < 7) {
        setTimeAgo(`${days} day${days > 1 ? "s" : ""} ago`);
      } else {
        const options = { month: "short", day: "numeric" };
        setTimeAgo(orderDate.toLocaleDateString("en-US", options));
      }
    }
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#22c55e";
      case "confirmed":
        return "#0ea5e9";
      case "processing":
        return "#0ea5e9";
      case "pending":
        return colors.lime;
      case "cancelled":
        return "#ef4444";
      default:
        return "#666666";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return "checkmark-circle";
      case "confirmed":
        return "checkmark-circle";
      case "processing":
        return "time";
      case "pending":
        return "hourglass";
      case "cancelled":
        return "close-circle";
      default:
        return "ellipse";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleConfirmCancel = async () => {
    setLoading({ ...loading, cancelling: true });
    try {
      await onCancelOrder(order.id);
      setCancelModalVisible(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setLoading({ ...loading, cancelling: false });
    }
  };

  const handleConfirmOrderSubmit = async (data) => {
    setLoading({ ...loading, confirming: true });
    console.log({
      id: order.id,
      destination: order.order.location,
      fees: parseFloat(data.deliveryFee),
      note: data.note || "",
    });
    try {
      await onConfirmOrder({
        id: order.id,
        destination: order.order.location,
        fees: parseFloat(data.deliveryFee),
        note: data.note || "",
      });
      showToast("success","Order Confirmed","The client will be notified soon.")
      setModalVisible(false);
    } catch (error) {
      console.error("Error confirming order:", error);
      showToast("error","Confirmation Error",error.message)
    } finally {
      setLoading({ ...loading, confirming: false });
    }
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActions}>
        <Animated.View style={{ transform: [{ scale: trans }] }}>
          <TouchableOpacity
            style={[styles.swipeAction, styles.swipeCancel]}
            onPress={() => setCancelModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActions}>
        <Animated.View style={{ transform: [{ scale: trans }] }}>
          <TouchableOpacity
            style={[styles.swipeAction, styles.swipeConfirm]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Confirm</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const expandHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, order.status.toLowerCase() === "pending" ? 200 : 130],
  });

  return (
    <>
      <Swipeable
        renderRightActions={
          order.status.toLowerCase() !== "cancelled" && renderRightActions
        }
        overshootRight={order.status.toLowerCase() !== "cancelled" && false}
        rightThreshold={order.status.toLowerCase() !== "cancelled" && 40}

        renderLeftActions={
          userRole === "vendor" &&
          order.status.toLowerCase() === "pending" &&
          renderLeftActions
        }
        overshootLeft={
          userRole === "vendor" &&
          order.status.toLowerCase() === "pending" &&
          false
        }
        leftThreshold={
          userRole === "vendor" &&
          order.status.toLowerCase() === "pending" &&
          40
        }
        friction={2}
      >
        <View style={styles.cardContainer}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Order Image/Icon */}
            <View style={styles.imageContainer}>
              {order.product.image ? (
                <Image
                  source={{
                    uri: order.product.image,
                  }}
                  style={styles.orderImage}
                />
              ) : (
                <View style={styles.orderIconPlaceholder}>
                  <Ionicons name="receipt" size={30} color={colors.lime} />
                </View>
              )}
              {order.items && order.items.length > 1 && (
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountText}>
                    +{order.items.length - 1}
                  </Text>
                </View>
              )}
            </View>

            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
              <Text style={styles.orderId}>{order.product.name}</Text>
              <Text style={styles.itemCount}>Quantity - {order.quantity || 0}</Text>
              <Text style={styles.orderTotal}>{formatPrice(order.amount)}</Text>
            </View>

            {/* Status and Actions */}
            <View style={styles.rightContent}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + "20" },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(order.status)}
                  size={14}
                  color={getStatusColor(order.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {getStatusLabel(order.status)}
                </Text>
              </View>
              <Text style={styles.orderTime}>{timeAgo}</Text>
              <TouchableOpacity
                style={styles.chevronButton}
                onPress={() => setExpanded(!expanded)}
              >
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expanded Content */}
          <Animated.View
            style={[styles.expandableContent, { height: expandHeight }]}
          >
            <View style={styles.expandableInner}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  Delivery Information
                </Text>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="location-outline" size={20} color="#666666" />
                  <Text style={styles.modalInfoText}>
                    {order.order.location || "Not specified"}
                  </Text>
                </View>
                {order.order.note && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="create-outline" size={20} color="#666666" />
                    <Text style={styles.modalInfoText}>{order.order.note}</Text>
                  </View>
                )}
              </View>
              <View style={styles.modalActions}>
                {(userRole === "user" || userRole === "vendor") &&
                  (order.status.toLowerCase() === "pending" ||
                    order.status === "processing") && (
                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        styles.modalCancelButton,
                      ]}
                      onPress={() => setCancelModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionButtonText}>
                        Cancel Order
                      </Text>
                    </TouchableOpacity>
                  )}

                {userRole === "vendor" &&
                  order.status.toLowerCase() === "pending" && (
                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        styles.modalConfirmButton,
                      ]}
                      onPress={() => setModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.modalActionButtonText}>
                        Confirm Order
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          </Animated.View>
        </View>
      </Swipeable>

      {/* Confirm Order Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "70%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Order</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Success Icon */}
              <View style={styles.confirmIconContainer}>
                <View style={styles.confirmIconCircle}>
                  <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                </View>
              </View>

              <Text style={styles.confirmTitle}>Confirm This Order</Text>
              <Text style={styles.confirmSubtitle}>
                Review the order details and set delivery fee before confirming.
              </Text>

              {/* Order Summary */}
              <View style={styles.confirmOrderSummary}>
                <View style={styles.confirmOrderHeader}>
                  <Text style={styles.confirmOrderLabel}>
                    Order #{order.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.confirmOrderItemsCount}>
                    {order.quantity || 0} items
                  </Text>
                </View>

                <View style={styles.confirmOrderItem}>
                  <Image
                    source={{ uri: order.product.image }}
                    style={styles.confirmOrderItemImage}
                  />
                  <View style={styles.confirmOrderItemInfo}>
                    <Text style={styles.confirmOrderItemName}>
                      {order.product.name}
                    </Text>
                    <Text style={styles.confirmOrderItemDetails}>
                      {order.quantity} × {formatPrice(order.product.price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.confirmOrderSubtotal}>
                  <Text style={styles.confirmOrderSubtotalLabel}>Total</Text>
                  <Text style={styles.confirmOrderSubtotalValue}>
                    {formatPrice(order.amount)}
                  </Text>
                </View>
              </View>

              {/* Delivery Fee Input */}
              <View style={styles.confirmForm}>
                <Text style={styles.confirmFormLabel}>Delivery Fee *</Text>
                <Controller
                  control={control}
                  name="deliveryFee"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <View style={styles.confirmInputWrapper}>
                      <Text style={styles.confirmInputPrefix}>UGX</Text>
                      <TextInput
                        style={[
                          styles.confirmInput,
                          errors.deliveryFee && styles.confirmInputError,
                        ]}
                        placeholder="Enter delivery fee"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        placeholderTextColor="#999999"
                      />
                    </View>
                  )}
                />
                {errors.deliveryFee && (
                  <Text style={styles.errorText}>
                    {errors.deliveryFee.message}
                  </Text>
                )}

                <Text style={styles.confirmFormLabel}>Note (Optional)</Text>
                <Controller
                  control={control}
                  name="note"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                      style={styles.confirmNoteInput}
                      placeholder="Add any delivery instructions or notes..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      placeholderTextColor="#999999"
                    />
                  )}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalSecondaryButton,
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalConfirmButton]}
                  onPress={handleSubmit(handleConfirmOrderSubmit)}
                  disabled={loading.confirming}
                >
                  {loading.confirming ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.modalActionButtonText}>
                        Confirming...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.modalActionButtonText}>Confirm</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "50%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Order</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCancelModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Warning Icon */}
              <View style={styles.cancelIconContainer}>
                <View style={styles.cancelIconCircle}>
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                </View>
              </View>

              <Text style={styles.cancelTitle}>Are you sure?</Text>
              <Text style={styles.cancelSubtitle}>
                This action cannot be undone. This will cancel the order and
                notify the {userRole === "vendor" ? "customer" : "vendor"}.
              </Text>

              {/* Order Summary */}
              <View style={styles.confirmOrderSummary}>
                <View style={styles.confirmOrderHeader}>
                  <Text style={styles.confirmOrderLabel}>
                    Order #{order.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.confirmOrderItemsCount}>
                    {order.quantity || 0} items
                  </Text>
                </View>

                <View style={styles.confirmOrderItem}>
                  <Image
                    source={{ uri: order.product.image }}
                    style={styles.confirmOrderItemImage}
                  />
                  <View style={styles.confirmOrderItemInfo}>
                    <Text style={styles.confirmOrderItemName}>
                      {order.product.name}
                    </Text>
                    <Text style={styles.confirmOrderItemDetails}>
                      {order.quantity} × {formatPrice(order.product.price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.confirmOrderSubtotal}>
                  <Text style={styles.confirmOrderSubtotalLabel}>Total</Text>
                  <Text style={styles.confirmOrderSubtotalValue}>
                    {formatPrice(order.amount)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalSecondaryButton,
                  ]}
                  onPress={() => setCancelModalVisible(false)}
                >
                  <Text style={styles.modalSecondaryButtonText}>
                    Keep Order
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalCancelButton]}
                  onPress={handleConfirmCancel}
                  disabled={loading.cancelling}
                >
                  {loading.cancelling ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.modalActionButtonText}>
                        Cancelling...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionButtonText}>
                        Yes, Cancel
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingRight: 0,
  },
  imageContainer: {
    position: "relative",
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  orderIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  itemCountBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: colors.lime,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  orderTime: {
    fontSize: 12,
    color: "#999999",
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
    marginTop: 2,
  },
  rightContent: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  itemCount: {
    fontSize: 11,
    color: "#999999",
    marginTop: 4,
  },
  chevronButton: {
    padding: 4,
    marginLeft: 4,
  },
  expandableContent: {
    overflow: "hidden",
  },
  expandableInner: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  expandedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expandedItemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  expandedItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  expandedItemName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  expandedItemDetails: {
    fontSize: 12,
    color: "#666666",
  },
  expandedItemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.lime,
  },
  // Swipe Actions
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    marginRight: 16,
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 12,
    marginLeft: 8,
  },
  swipeConfirm: {
    backgroundColor: "#22c55e",
  },
  swipeCancel: {
    backgroundColor: "#ef4444",
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dims the screen behind the modal
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    maxWidth: "80%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
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
  // Cancel Modal Styles
  cancelIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  cancelIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
    marginBottom: 8,
  },
  cancelSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  cancelOrderSummary: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  cancelOrderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  cancelOrderItems: {
    marginBottom: 8,
  },
  cancelOrderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  cancelOrderItemName: {
    fontSize: 13,
    color: "#666666",
  },
  cancelOrderItemQty: {
    fontSize: 13,
    color: "#666666",
  },
  cancelOrderMore: {
    fontSize: 12,
    color: "#999999",
    fontStyle: "italic",
    marginTop: 2,
  },
  cancelOrderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  cancelOrderTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  cancelOrderTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.lime,
  },
  // Confirm Modal Styles
  confirmIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmOrderSummary: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  confirmOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmOrderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  confirmOrderItemsCount: {
    fontSize: 12,
    color: "#666666",
  },
  confirmOrderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  confirmOrderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  confirmOrderItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  confirmOrderItemName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  confirmOrderItemDetails: {
    fontSize: 12,
    color: "#666666",
  },
  confirmOrderItemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.lime,
  },
  confirmOrderSubtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  confirmOrderSubtotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  confirmOrderSubtotalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  // Confirm Form
  confirmForm: {
    marginBottom: 20,
  },
  confirmFormLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  confirmInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  confirmInputPrefix: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginRight: 8,
  },
  confirmInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#334155",
  },
  confirmInputError: {
    borderColor: "#ef4444",
  },
  confirmNoteInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    padding: 12,
    fontSize: 14,
    color: "#334155",
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  // Action Buttons
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
  },
  modalCancelButton: {
    backgroundColor: "#ef4444",
  },
  modalConfirmButton: {
    backgroundColor: "#22c55e",
  },
  modalSecondaryButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  modalActionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalSecondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OrderItemCard;
