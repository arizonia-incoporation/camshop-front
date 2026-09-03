// components/OrderItemCard.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors, spacing } from "../../theme/theme";
import AppCalls from "../../utils/network";
import { showToast } from "../../utils/toast";
import {
  buildOrderCapabilities,
  normalizeOrderShape,
  STATUS_META,
} from "../../utils/orderLifecycle";
import { useRouter } from "expo-router";

const deliverySchema = z.object({
  deliveryFee: z.string().min(1, "Please enter delivery fee"),
  note: z.string().optional(),
});

const OrderItemCard = ({
  order,
  userRole,
  onCancelOrder,
  onConfirmOrder,
  onViewDetails,
  transporterId,
}) => {
  const navigation = useRouter();
  const [timeAgo, setTimeAgo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState({
    cancelling: false,
    confirming: false,
    others: null,
  });
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [wasConfirmed, setWasConfirmed] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;
  const normalizedOrder = normalizeOrderShape(order);
  const safeStatus = normalizedOrder.status;
  const orderCapabilities = buildOrderCapabilities(
    normalizedOrder,
    userRole,
    transporterId,
  );

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
    const targetHeight = expanded ? contentHeight : 0;
    Animated.timing(animationValue, {
      toValue: targetHeight,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [expanded, contentHeight]);

  const updateTimeAgo = () => {
    const now = new Date();
    const orderDate = new Date(normalizedOrder.orderedAt || Date.now());
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
    return STATUS_META[status]?.accent || STATUS_META.pending.accent;
  };

  const getStatusIcon = (status) => {
    return STATUS_META[status]?.icon || "ellipse";
  };

  const getStatusLabel = (status) => {
    return STATUS_META[status]?.label || "Pending";
  };

  const handleConfirmCancel = async () => {
    setLoading((prev) => ({ ...prev, cancelling: true }));
    try {
      await onCancelOrder(normalizedOrder.id);
      setCancelModalVisible(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setLoading((prev) => ({ ...prev, cancelling: false }));
    }
  };

  const handleConfirmOrderSubmit = async (data) => {
    setLoading((prev) => ({ ...prev, confirming: true }));
    try {
      await onConfirmOrder({
        id: normalizedOrder.id,
        destination: normalizedOrder.order.location,
        fees: parseFloat(data.deliveryFee),
        note: data.note || "",
      });
      setWasConfirmed(true);
      showToast(
        "success",
        "Order Confirmed",
        "The client will be notified soon.",
      );
      setModalVisible(false);

      // Prompt seller to assign delivery guy or leave open
      if (userRole === "vendor") {
        setAssignModalVisible(true);
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      showToast("error", "Confirmation Error", error.message);
    } finally {
      setLoading((prev) => ({ ...prev, confirming: false }));
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

  // Fetch available drivers for assignment when assign modal opens
  const fetchDrivers = async () => {
    try {
      const res = await AppCalls.get("/transporters");
      // normalize response
      const list = res?.users || res?.items || res?.data?.items || res || [];
      setDrivers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
      setDrivers([]);
    }
  };

  useEffect(() => {
    if (assignModalVisible) {
      fetchDrivers();
    }
  }, [assignModalVisible]);

  const assignToDriver = async () => {
    if (!selectedDriver) {
      showToast(
        "error",
        "Select driver",
        "Please select a delivery guy to assign.",
      );
      return;
    }

    try {
      setAssigning(true);
      await AppCalls.patch(`/delivery/${order.id}/assign`, {
        transporterId: selectedDriver.id || selectedDriver._id,
      });
      showToast("success", "Assigned", "Delivery guy assigned successfully");
      setAssignModalVisible(false);
      // let parent refresh if callback provided
      onViewDetails && onViewDetails();
    } catch (err) {
      console.error("Assignment error", err);
      showToast(
        "error",
        "Assignment failed",
        err?.message || "Could not assign delivery guy",
      );
    } finally {
      setAssigning(false);
    }
  };

  const leaveOpen = async () => {
    // seller chose to leave order open for claim
    setAssigning(true);
    try {
      await AppCalls.patch(`/delivery/${order.id}/assign`, {
        transporterId: null,
      });
      showToast("success", "Open", "Order left open for drivers to claim");
      setAssignModalVisible(false);
      onViewDetails && onViewDetails();
    } catch (err) {
      console.error("Leave open error", err);
      showToast("error", "Failed", err?.message || "Could not mark order open");
    } finally {
      setAssigning(false);
    }
  };

  const claimOrder = async () => {
    try {
      setClaiming(true);
      await AppCalls.patch(`/delivery/${normalizedOrder.id}/claim`);
      showToast("success", "Claimed", "You have claimed this delivery");
      onViewDetails && onViewDetails();
    } catch (err) {
      console.error("Claim error", err);
      showToast(
        "error",
        "Claim failed",
        err?.message || "Someone else may have claimed this",
      );
      onViewDetails && onViewDetails();
    } finally {
      setClaiming(false);
    }
  };

  const expandHeight = animationValue.interpolate({
    inputRange: [0, Math.max(contentHeight, 1)],
    outputRange: [0, Math.max(contentHeight, 1)],
  });

  const handleActionPress = async (actionId) => {
    if (actionId === "cancel") {
      setCancelModalVisible(true);
      return;
    }

    if (actionId === "confirm") {
      setModalVisible(true);
      return;
    }

    if (actionId === "claim") {
      await claimOrder();
      return;
    }

    if (actionId === "accept") {
      setLoading((str) => ({ ...str, others: actionId }));
      try {
        await AppCalls.patch(`/delivery/${normalizedOrder.id}/accept`);
        showToast("success", "Offer accepted", "You accepted this delivery.");
        onViewDetails && onViewDetails();
      } catch (error) {
        showToast(
          "error",
          "Offer not accepted",
          error?.message || "Could not accept this offer.",
        );
      } finally {
        setLoading((str) => ({ ...str, others: null }));
      }
      return;
    }

    if (actionId === "reject") {
      setLoading((str) => ({ ...str, others: actionId }));
      try {
        await AppCalls.patch(`/delivery/${normalizedOrder.id}/reject`);
        showToast(
          "info",
          "Offer rejected",
          "This order is now available again.",
        );
        onViewDetails && onViewDetails();
      } catch (error) {
        showToast(
          "error",
          "Offer not rejected",
          error?.message || "Could not reject this offer.",
        );
      } finally {
        setLoading((str) => ({ ...str, others: null }));
      }
      return;
    }

    if (actionId === "pick_up" || actionId === "vendor_pick_up") {
      setLoading((str) => ({ ...str, others: actionId }));
      try {
        await AppCalls.patch(`/delivery/${normalizedOrder.id}/status`, {
          status: "PICKED_UP",
        });
        showToast(
          "success",
          "Picked up",
          "The order has been marked as picked up.",
        );
        onViewDetails && onViewDetails();
      } catch (error) {
        showToast(
          "error",
          "Pick up failed",
          error?.message || "Could not mark as picked up.",
        );
      } finally {
        setLoading((str) => ({ ...str, others: null }));
      }
      return;
    }

    if (actionId === "deliver") {
      setLoading((str) => ({ ...str, others: actionId }));
      try {
        await AppCalls.patch(`/delivery/${normalizedOrder.id}/status`, {
          status: "DELIVERED",
        });
        showToast(
          "success",
          "Delivered",
          "The order has been marked as delivered.",
        );
        onViewDetails && onViewDetails();
      } catch (error) {
        showToast(
          "error",
          "Delivery failed",
          error?.message || "Could not mark as delivered.",
        );
      } finally {
        setLoading((str) => ({ ...str, others: null }));
      }
      return;
    }

    if (actionId === "review") {
      showToast(
        "info",
        "Review",
        "Review flow starts after delivery is completed.",
      );
    }
  };

  const closeAssignModal = async () => {
    setAssignModalVisible(false);

    try {
      await AppCalls.patch(`/delivery/${normalizedOrder.id}/assign`, {
        transporterId: null,
      });
      showToast(
        "success",
        "Marked open",
        "Order marked open for drivers to claim",
      );
      onViewDetails && onViewDetails();
    } catch (err) {
      showToast(
        "info",
        "Not marked open",
        err?.message || "Could not mark order open automatically",
      );
    }
  };
console.log("normalizedOrder", normalizedOrder);
  const handleCallUser = () => {
    if (normalizedOrder.order?.user?.contact) {
      Linking.openURL(`tel:${normalizedOrder.order.user.contact}`).catch((err) =>
        showToast("error", "Error", "Failed to open phone dialer."),
      );
    }
  };

  return (
    <>
      <Swipeable
        renderRightActions={safeStatus !== "cancelled" && renderRightActions}
        overshootRight={safeStatus !== "cancelled" && false}
        rightThreshold={safeStatus !== "cancelled" && 40}
        renderLeftActions={
          userRole === "vendor" && safeStatus === "pending" && renderLeftActions
        }
        overshootLeft={
          userRole === "vendor" && safeStatus === "pending" && false
        }
        leftThreshold={userRole === "vendor" && safeStatus === "pending" && 40}
        friction={2}
      >
        <View style={styles.cardContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setExpanded((prev) => !prev)}
          >
            <View style={styles.mainContent}>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() =>
                  navigation.push(
                    "home/productDetails?productId=" +
                      normalizedOrder.product.id,
                  )
                }
              >
                {normalizedOrder.product.image ? (
                  <Image
                    source={{ uri: normalizedOrder.product.image }}
                    style={styles.orderImage}
                  />
                ) : (
                  <View style={styles.orderIconPlaceholder}>
                    <Ionicons name="receipt" size={30} color={colors.lime} />
                  </View>
                )}
                {Array.isArray(order?.items) && order.items.length > 1 && (
                  <View style={styles.itemCountBadge}>
                    <Text style={styles.itemCountText}>
                      +{order.items.length - 1}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>
                  Order #{String(normalizedOrder.id).slice(0, 8)}
                </Text>
                <Text style={styles.orderName}>
                  {normalizedOrder.product.name}
                </Text>
                <Text style={styles.itemCount}>
                  Quantity - {normalizedOrder.quantity || 0}
                </Text>
                <Text style={styles.orderTotal}>
                  {formatPrice(normalizedOrder.amount)}
                </Text>
              </View>

              <View style={styles.rightContent}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(safeStatus) + "20" },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(safeStatus)}
                    size={14}
                    color={getStatusColor(safeStatus)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(safeStatus) },
                    ]}
                  >
                    {getStatusLabel(safeStatus)}
                  </Text>
                </View>
                <Text style={styles.orderTime}>{timeAgo}</Text>
                <TouchableOpacity
                  style={styles.chevronButton}
                  onPress={() => setExpanded((prev) => !prev)}
                >
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          <Animated.View
            style={[styles.expandableContent, { height: expandHeight }]}
          >
            <View
              style={styles.expandableInner}
              onLayout={(event) => {
                const height = event.nativeEvent.layout.height;
                if (height > 0 && height !== contentHeight) {
                  setContentHeight(height);
                }
              }}
            >
              {normalizedOrder.order.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color="#666666" />
                  <Text style={styles.locationText}>
                    {normalizedOrder.order.location}
                  </Text>
                </View>
              )}

              {normalizedOrder.order.user && (
                <View style={styles.customerInfoContainer}>
                  <View style={styles.customerDetailRow}>
                    <Ionicons name="person-outline" size={18} color="#64748b" />
                    <Text style={styles.customerNameText}>
                      {normalizedOrder.order.user.username}
                    </Text>
                  </View>
                  {normalizedOrder.order.user.contact && (
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={handleCallUser}
                    >
                      <Ionicons name="call" size={18} color="#ffffff" />
                      <Text style={styles.contactButtonText}>
                        Call {normalizedOrder.order.user.contact}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {normalizedOrder.order.note && (
                <View style={styles.locationRow}>
                  <Ionicons name="create-outline" size={18} color="#666666" />
                  <Text style={styles.locationText}>
                    {normalizedOrder.order.note}
                  </Text>
                </View>
              )}

              <View style={styles.expandedSummaryBox}>
                <Text style={styles.expandedSummaryTitle}>Order status</Text>
                <Text style={styles.expandedSummaryText}>
                  {orderCapabilities.statusSummary}
                </Text>
              </View>

              <View style={styles.progressSection}>
                {orderCapabilities.progress.map((step, index) => {
                  const isCurrent =
                    index ===
                    Math.min(orderCapabilities.progress.length - 1, 1);
                  const isActive =
                    (orderCapabilities.status === "pending" && index === 1) ||
                    (orderCapabilities.status === "confirmed" && index === 2) ||
                    (orderCapabilities.status === "assignable" &&
                      index === 2) ||
                    (orderCapabilities.status === "assigned" && index === 2) ||
                    (orderCapabilities.status === "accepted" && index === 3) ||
                    (orderCapabilities.status === "picked_up" && index === 3) ||
                    (orderCapabilities.status === "delivered" && index >= 3);

                  return (
                    <View
                      key={`${step}-${index}`}
                      style={styles.progressStepRow}
                    >
                      <View
                        style={[
                          styles.progressDot,
                          isCurrent || isActive
                            ? styles.progressDotActive
                            : styles.progressDotInactive,
                        ]}
                      />
                      <Text
                        style={[
                          styles.progressText,
                          (isCurrent || isActive) && styles.progressTextActive,
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.expandActions}>
                {orderCapabilities.actions.map((action) => {
                  const isDanger = action.kind === "danger";
                  const isPrimary = action.kind === "primary";
                  const buttonIcon =
                    action.id === "cancel"
                      ? "close-circle"
                      : action.id === "confirm"
                        ? "checkmark-circle"
                        : action.id === "claim" || action.id === "accept"
                          ? "hand-left"
                          : action.id === "reject"
                            ? "remove-circle"
                            : action.id === "pick_up" ||
                                action.id === "vendor_pick_up"
                              ? "bag-handle"
                              : action.id === "deliver"
                                ? "car"
                                : "star";

                  return (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.modalActionButton,
                        isDanger
                          ? styles.modalCancelButton
                          : styles.modalConfirmButton,
                      ]}
                      onPress={() => handleActionPress(action.id)}
                      activeOpacity={0.7}
                    >
                      {loading.others === action.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name={buttonIcon}
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.modalActionButtonText}>
                            {action.label}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
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

      {/* Assignment Modal (prompt after confirm) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={closeAssignModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "70%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Delivery Guy?</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAssignModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.confirmSubtitle}>
                Would you like to assign a specific delivery partner, or leave
                this order open for available drivers to claim?
              </Text>

              <View style={{ marginTop: spacing.md }}>
                <TouchableOpacity
                  style={[styles.optionRow, { marginBottom: spacing.sm }]}
                  onPress={() => {
                    setSelectedDriver(null);
                  }}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionTitle}>
                      Leave open for drivers to claim
                    </Text>
                  </View>
                </TouchableOpacity>

                <Text
                  style={[styles.confirmFormLabel, { marginTop: spacing.sm }]}
                >
                  Or assign a delivery guy
                </Text>
                {drivers.length === 0 && (
                  <Text style={[styles.errorText, { marginTop: spacing.sm }]}>
                    No delivery guys found.
                  </Text>
                )}
                {drivers.map((d) => (
                  <TouchableOpacity
                    key={d.id || d._id}
                    style={[
                      styles.driverRow,
                      selectedDriver &&
                        (selectedDriver.id || selectedDriver._id) ===
                          (d.id || d._id) &&
                        styles.driverSelected,
                    ]}
                    onPress={() => setSelectedDriver(d)}
                  >
                    <Text style={styles.driverName}>
                      {d.username || d.name || d.displayName}
                    </Text>
                    <Text style={styles.driverMeta}>
                      {d.vehicle || d.phone || ""}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalSecondaryButton,
                    ]}
                    onPress={closeAssignModal}
                  >
                    <Text style={styles.modalSecondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalConfirmButton,
                    ]}
                    onPress={selectedDriver ? assignToDriver : leaveOpen}
                    disabled={assigning}
                  >
                    {assigning ? (
                      <>
                        <ActivityIndicator color="#FFFFFF" size="small" />
                        <Text style={styles.modalActionButtonText}>
                          Assigning...
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.modalActionButtonText}>
                        {selectedDriver ? "Assign Selected" : "Leave Open"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
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
  orderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 2,
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
  expandedSummaryBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  expandedSummaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  expandedSummaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  progressDotActive: {
    backgroundColor: colors.lime,
  },
  progressDotInactive: {
    backgroundColor: "#dfe7ee",
  },
  progressText: {
    flex: 1,
    fontSize: 12,
    color: "#64748b",
  },
  progressTextActive: {
    color: "#1f2937",
    fontWeight: "600",
  },
  expandActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
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
  optionRow: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  driverRow: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginTop: 8,
  },
  driverSelected: {
    borderColor: colors.lime,
    backgroundColor: "#fefce8",
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  driverMeta: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
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
   // NEW: Customer Info Styles
  customerInfoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  customerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customerNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },

});

export default OrderItemCard;
