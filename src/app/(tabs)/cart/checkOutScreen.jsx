// app/checkout.js
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors, shadow } from "../../../theme/theme";
import { useCart } from "../../../context/CartContext";
import AppCalls from "../../../utils/network";
import { showToast } from "../../../utils/toast";
import PaymentMethodsBanner from "../../../components/PaymentMethodsBanner";

const { width, height } = Dimensions.get("window");

// Constants
const TABS = {
  DELIVERY: 0,
  REVIEW: 1,
};

// Validation schema
const checkoutSchema = z.object({
  location: z.string().min(3, "Please enter a valid location"),
  note: z.string().optional(),
});

const CheckoutScreen = () => {
  const navigation = useRouter();
  const [currentTab, setCurrentTab] = useState(TABS.DELIVERY);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [formData, setFormData] = useState(null);

  const { items: cartItems, loadCart } = useCart();
  const { removeFromCart } = useCart();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    setValue,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      location: "",
      note: "",
    },
  });

  // Load cart items from params
  useEffect(() => {
    try {
      const items = cartItems ? cartItems : [];
      setOrderItems(items);
      calculateTotals(items);
    } catch (error) {
      console.error("Error parsing cart items:", error);
      setOrderItems([]);
      calculateTotals([]);
    }
  }, [cartItems]);

  const calculateTotals = (items) => {
    let total = 0;
    let count = 0;
    items.forEach((item) => {
      total += item.product.price * item.quantity;
      count += item.quantity;
    });
    setSubtotal(total);
    setItemCount(count);
  };

  const handleDeleteItem = (id) => {
    Alert.alert("Remove Item", "Remove this item from your order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(id),
      },
    ]);
  };

  const handleNextTab = async () => {
    const isValid = await trigger();
    if (isValid) {
      const values = getValues();
      setFormData(values);
      setCurrentTab(TABS.REVIEW);
    }
  };

  const handleBackToDelivery = () => {
    setCurrentTab(TABS.DELIVERY);
  };

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert("Empty Order", "Your order is empty.");
      return;
    }

    setLoading(true);

    const items = orderItems.map((item) => {
      return {
        productId: item.product.id,
        vendorId: item?.vendorId,
        amount: item.quantity * item.product.price,
        quantity: item.quantity,
      };
    })

    const orderData = {
      ...formData,
      items,
      total: subtotal
    };

    try {
      const res = await AppCalls.post("/order", orderData);

      showToast(
        "success",
        "🎉 Order Placed!",
        `Vendors will confirm delivery fees and your order will be on its way!`,
      );

      router.push("/cart/OrderConfirmed")

    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  // Render Delivery Tab
  const renderDeliveryTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.tabHeader}>
        <View style={styles.tabIconContainer}>
          <Ionicons name="location-sharp" size={40} color={colors.lime} />
        </View>
        <Text style={styles.tabTitle}>Where to deliver?</Text>
        <Text style={styles.tabSubtitle}>
          Let us know where to send your items
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.location && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={colors.lime}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Hostel or location"
                  placeholderTextColor="#999999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </View>
              {errors.location && (
                <Text style={styles.errorText}>{errors.location.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputGroup}>
              <View style={[styles.inputWrapper, styles.noteWrapper]}>
                <Ionicons
                  name="chatbubble-outline"
                  size={22}
                  color={colors.lime}
                  style={styles.noteIcon}
                />
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  placeholder="Any special instructions? (optional)"
                  placeholderTextColor="#999999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}
        />

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#0ea5e9" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Delivery Fees</Text>
            <Text style={styles.infoText}>
              Vendors will confirm delivery fees when they accept your order
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // Render Review Tab
  const renderReviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.tabHeader}>
        <View style={styles.tabIconContainer}>
          <Ionicons name="receipt-sharp" size={40} color={colors.lime} />
        </View>
        <Text style={styles.tabTitle}>Review Your Order</Text>
        <Text style={styles.tabSubtitle}>{itemCount} items in your order</Text>

        {/* Delivery Location Card - Clickable to go back */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={handleBackToDelivery}
        >
          <View style={styles.locationCardLeft}>
            <Ionicons name="location-outline" size={20} color={colors.lime} />
            <View style={styles.locationCardText}>
              <Text style={styles.locationCardLabel}>Delivering to</Text>
              <Text style={styles.locationCardValue} numberOfLines={1}>
                {formData?.location || "No location set"}
              </Text>
            </View>
          </View>
          <View style={styles.locationCardRight}>
            <Text style={styles.locationCardChange}>Change</Text>
            <Ionicons name="chevron-forward" size={20} color="#0ea5e9" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        {orderItems.map((item) => (
          <View key={item.id} style={[styles.reviewItem, shadow.card]}>
            <View style={styles.reviewItemLeft}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.reviewItemImage}
              />
              <View style={styles.reviewItemInfo}>
                <Text style={styles.reviewItemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.reviewItemVendor}>{item.vendor}</Text>
                <View style={styles.reviewItemDetails}>
                  <Text style={styles.reviewItemPrice}>
                    {formatPrice(item.product.price)}
                  </Text>
                  <Text style={styles.reviewItemQuantity}>
                    × {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.reviewItemRight}>
              <TouchableOpacity
                style={styles.reviewDeleteButton}
                onPress={() => handleDeleteItem(item.product.id)}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
              <Text style={styles.reviewItemTotal}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          </View>
        ))}

        <PaymentMethodsBanner style={styles.checkoutPaymentBanner} />

        {orderItems.length < 1 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cart-outline" size={64} color="#cccccc" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added any items to your cart yet.
            </Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Ionicons name="cube-outline" size={18} color="#666666" />
              <Text style={styles.summaryLabel}>Subtotal</Text>
            </View>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Ionicons name="bicycle-outline" size={18} color="#666666" />
              <Text style={styles.summaryLabel}>Delivery</Text>
            </View>
            <Text style={styles.summaryValuePending}>Vendor confirms</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Ionicons name="cash-outline" size={20} color={colors.lime} />
              <Text style={styles.summaryTotalLabel}>Estimated Total</Text>
            </View>
            <Text style={styles.summaryTotalValue}>
              {formatPrice(subtotal)}
            </Text>
          </View>

          <View style={styles.deliveryNote}>
            <Ionicons name="time-outline" size={16} color="#999999" />
            <Text style={styles.deliveryNoteText}>
              Final total including delivery will be confirmed by vendors
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Content - Centered */}
        <View style={styles.contentWrapper}>
          <View style={styles.centeredContent}>
            {currentTab === TABS.DELIVERY
              ? renderDeliveryTab()
              : renderReviewTab()}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {currentTab === TABS.DELIVERY ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextTab}>
              <Text style={styles.nextButtonText}>Review Order</Text>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : orderItems.length < 1 ? (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.back()}
            >
              <Text style={styles.emptyButtonText}>Continue Shopping</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.placeOrderButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.placeOrderText}>Place Order</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    marginTop: 50,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  placeholder: {
    width: 32,
  },
  tabIndicator: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  tabSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabStep: {
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepActive: {
    backgroundColor: colors.lime,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    color: "#999999",
  },
  stepLabelActive: {
    color: colors.lime,
    fontWeight: "600",
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 8,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  centeredContent: {
    flex: 1,
    paddingHorizontal: 16,
    maxHeight: height * 0.7,
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  tabIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 4,
  },
  tabSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputWrapperError: {
    borderColor: "#FF3B30",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#334155",
  },
  noteWrapper: {
    alignItems: "flex-start",
    paddingTop: 8,
  },
  noteIcon: {
    marginTop: 8,
  },
  noteInput: {
    minHeight: 80,
    paddingTop: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: "flex-start",
    marginTop: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0ea5e9",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  locationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    width: "100%",
  },
  locationCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  locationCardText: {
    flex: 1,
  },
  locationCardLabel: {
    fontSize: 12,
    color: "#999999",
  },
  locationCardValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  locationCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationCardChange: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  itemsContainer: {
    paddingBottom: 20,
  },
  checkoutPaymentBanner: {
    marginHorizontal: 0,
    marginTop: 8,
  },
  reviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reviewItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    resizeMode: "cover",
  },
  reviewItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  reviewItemVendor: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 2,
  },
  reviewItemDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewItemPrice: {
    fontSize: 13,
    color: "#334155",
  },
  reviewItemQuantity: {
    fontSize: 13,
    color: "#999999",
    marginLeft: 4,
  },
  reviewItemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 56,
  },
  reviewItemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  reviewDeleteButton: {
    padding: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    minHeight: 500,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: colors.lime,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyWarningText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 12,
  },
  emptyItemsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyItemsText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  summaryValuePending: {
    fontSize: 13,
    color: "#0ea5e9",
    fontStyle: "italic",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.lime,
  },
  deliveryNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
    backgroundColor: "#f0f9ff",
    padding: 10,
    borderRadius: 8,
  },
  deliveryNoteText: {
    fontSize: 12,
    color: "#666666",
    flex: 1,
    lineHeight: 16,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: colors.lime,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeOrderButton: {
    flexDirection: "row",
    backgroundColor: colors.lime,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default CheckoutScreen;
