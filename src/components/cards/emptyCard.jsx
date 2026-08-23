import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";

const { width } = Dimensions.get("window");

const EmptyState = ({
  icon = "cube-outline",
  title = "Nothing here yet",
  subtitle = "Start adding items to see them appear here.",
  buttonText,
  onButtonPress,
  buttonIcon,
  variant = "default", // 'default', 'cart', 'orders', 'products', 'search'
  containerStyle,
  iconSize = 64,
  iconColor = "#cccccc",
}) => {
  // Get variant-specific configurations
  const getVariantConfig = () => {
    switch (variant) {
      case "cart":
        return {
          icon: "cart-outline",
          title: "Your cart is empty",
          subtitle: "Looks like you haven't added any items to your cart yet.",
          buttonText: "Start Shopping",
          buttonIcon: "storefront-outline",
        };
      case "orders":
        return {
          icon: "receipt-outline",
          title: "No orders yet",
          subtitle:
            "You haven't placed any orders. Start shopping to see your orders here.",
          buttonText: "Browse Products",
          buttonIcon: "search-outline",
        };
      case "products":
        return {
          icon: "cube-outline",
          title: "No products added",
          subtitle:
            "You haven't added any products to your store yet. Start selling today!",
          buttonText: "Add Product",
          buttonIcon: "add-circle-outline",
        };
      case "search":
        return {
          icon: "search-outline",
          title: "No results found",
          subtitle:
            "Try adjusting your search terms or filters to find what you're looking for.",
          buttonText: "Clear Filters",
          buttonIcon: "refresh-outline",
        };
      case "favorites":
        return {
          icon: "heart-outline",
          title: "No favorites yet",
          subtitle: "Start hearting items you love to see them here.",
          buttonText: "Explore Products",
          buttonIcon: "compass-outline",
        };
      case "notifications":
        return {
          icon: "notifications-outline",
          title: "No notifications",
          subtitle: "You're all caught up! Check back later for updates.",
          buttonText: "",
        };
      default:
        return {
          icon: icon || "cube-outline",
          title: title || "Nothing here yet",
          subtitle: subtitle || "Start adding items to see them appear here.",
          buttonText: buttonText || "",
          buttonIcon: buttonIcon || "",
        };
    }
  };

  const config = getVariantConfig();

  // Use provided props or variant config
  const finalIcon = icon || config.icon;
  const finalTitle = title || config.title;
  const finalSubtitle = subtitle || config.subtitle;
  const finalButtonText = buttonText || config.buttonText;
  const finalButtonIcon = buttonIcon || config.buttonIcon;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={finalIcon} size={iconSize} color={iconColor} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{finalTitle}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>{finalSubtitle}</Text>

      {/* Button */}
      {finalButtonText && onButtonPress && (
        <TouchableOpacity
          style={styles.button}
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          {finalButtonIcon && (
            <Ionicons
              name={finalButtonIcon}
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
          )}
          <Text style={styles.buttonText}>{finalButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Additional compact version for inline use
export const CompactEmptyState = ({
  icon = "cube-outline",
  title = "Nothing here",
  subtitle,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View style={styles.compactContainer}>
      <Ionicons name={icon} size={32} color="#cccccc" />
      <Text style={styles.compactTitle}>{title}</Text>
      {subtitle && <Text style={styles.compactSubtitle}>{subtitle}</Text>}
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.compactButton} onPress={onButtonPress}>
          <Text style={styles.compactButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Horizontal empty state for flatlists
export const HorizontalEmptyState = ({
  icon = "cube-outline",
  title = "No items",
  subtitle,
}) => {
  return (
    <View style={styles.horizontalContainer}>
      <Ionicons name={icon} size={48} color="#cccccc" />
      <Text style={styles.horizontalTitle}>{title}</Text>
      {subtitle && <Text style={styles.horizontalSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  // Compact styles
  compactContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderStyle: "dashed",
    minHeight: 150,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
    marginTop: 8,
  },
  compactSubtitle: {
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    marginTop: 4,
  },
  compactButton: {
    marginTop: 12,
    backgroundColor: colors.lime,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  // Horizontal styles
  horizontalContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minWidth: 150,
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginTop: 8,
    textAlign: "center",
  },
  horizontalSubtitle: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 4,
  },
});

export default EmptyState;
