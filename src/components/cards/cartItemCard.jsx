import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { showToast } from "../../utils/toast";
import { colors } from "../../theme/theme";

const CartItemCard = ({
  item,
  isExpanded,
  onToggleExpand,
  onUpdateQuantity,
  onDelete,
  onToggleSelect,
}) => {
  const navigation = useRouter()
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [timeAgo, setTimeAgo] = useState("");
  const animationValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const product = item.product

  useEffect(() => {
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); 
    return () => clearInterval(interval);
  }, [item.updatedAt]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animationValue, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateValue, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  const updateTimeAgo = () => {
    const now = new Date();
    const addedDate = new Date(item.updatedAt || Date.now());
    const diffInSeconds = Math.floor((now - addedDate) / 1000);

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
        // Format date
        const options = { month: "short", day: "numeric" };
        setTimeAgo(addedDate.toLocaleDateString("en-US", options));
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return showToast()
    setQuantity(newQuantity);
  };

  const handleToggleSelect = () => {
    onToggleSelect(item.id);
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
  };

  const expandHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, product.description.trim().length > 60 ? 135 : 100],
  });

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

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
            style={[styles.swipeAction, styles.swipeDelete]}
            onPress={() => onDelete(product.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.cardContainer}>
        {/* Main Card Content */}
        <View style={styles.mainContent}>
          {/* Image */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleToggleSelect}
          >
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />
            {item.selected && (
              <View style={styles.selectedOverlay}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.lime}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Product Info */}
          <TouchableOpacity
            style={styles.productInfo}
            onPress={() =>
              navigation.push("home/productDetails?productId=" + product.id)
            }
          >
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productPrice, { color: colors.textSecondary }]}>
                {quantity + " x " + formatPrice(product.price)}
              </Text>
              <Text style={styles.productPrice}>
                {formatPrice(product.price * quantity)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Side Actions */}
          <View style={styles.rightActions}>
            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(product.id)}
            >
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
            </TouchableOpacity>

            {/* Toggle Button */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={onToggleExpand}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="chevron-down" size={24} color="#666666" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Content */}
        <Animated.View
          style={[styles.expandableContent, { height: expandHeight }]}
        >
          <View style={styles.expandableInner}>
            {/* Description */}
            {product.description && (
              <Text style={styles.description} numberOfLines={2}>
                {product.description}
              </Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Quantity Controls */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(quantity - 1)}
                >
                  <Ionicons name="remove" size={20} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#334155" />
                </TouchableOpacity>
              </View>

              {/* Update Button */}
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => onUpdateQuantity(product.id, quantity)}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 2,
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selectedOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.lime,
  },
  rightActions: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 80,
  },
  deleteButton: {
    padding: 4,
  },
  toggleButton: {
    padding: 4,
  },
  expandableContent: {
    overflow: "hidden",
  },
  expandableInner: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 8,
    minWidth: 36,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    minWidth: 24,
    textAlign: "center",
  },
  updateButton: {
    flex: 1,
    backgroundColor: colors.lime,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  deleteActionText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "500",
  },
  // Swipe Actions
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: 8,
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 12,
  },
  swipeDelete: {
    backgroundColor: colors.danger,
    marginRight: 16,
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
});

export default CartItemCard;
