import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Linking,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAdverts } from "../../context/AdvertContext";

const { width } = Dimensions.get("window");
const MODAL_WIDTH = Math.min(width * 0.9, 400);
const SLIDER_WIDTH = MODAL_WIDTH - 48; // Accounts for container padding (24 * 2)

// Card rendering individual advert item matching backend types
const AdModalItem = ({ item, onClose }) => {
  const router = useRouter();
  const { trackAdClick } = useAdverts();

  // Extract properties safely based on backend schema
  const imageUri = item.images?.[0];
  const buttonColor = item.buttonColor || "#2563EB";
  const buttonText = item.buttonText || "Learn More";

  const handlePressAction = async () => {
    // 1. Log click in backend database
    await trackAdClick(item.id);

    // 2. Dismiss modal
    onClose();

    // 3. Handle external/internal target URL navigation
    if (item.targetUrl) {
      if (
        item.targetUrl.startsWith("http://") ||
        item.targetUrl.startsWith("https://")
      ) {
        try {
          const supported = await Linking.canOpenURL(item.targetUrl);
          if (supported) await Linking.openURL(item.targetUrl);
        } catch (err) {
          console.error("Failed to open external link:", err);
        }
      } else {
        router.push(item.targetUrl);
      }
    }
  };

  return (
    <View style={styles.adCard}>
      {imageUri ? (
        <View style={styles.modalImageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.modalImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <Text style={styles.modalTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.modalDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <TouchableOpacity
        style={[styles.modalButton, { backgroundColor: buttonColor }]}
        onPress={handlePressAction}
        activeOpacity={0.85}
      >
        <Text style={styles.modalButtonText}>{buttonText}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// Main multi-ad container with carousel pagination
const RenderAdItem = ({ visible, onClose, ads = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!visible || ads.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = prevIndex === ads.length - 1 ? 0 : prevIndex + 1;

        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [visible, ads.length]);

  useEffect(() => {
    if (visible) {
      setActiveIndex(0);
    }
  }, [visible]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SLIDER_WIDTH);
    setActiveIndex(index);
  };

  if (!ads.length) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdropPressable} onPress={onClose}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#334155" />
              </TouchableOpacity>

              {/* Slider Viewport */}
              <View style={{ width: SLIDER_WIDTH, overflow: "hidden" }}>
                <FlatList
                  ref={flatListRef}
                  data={ads}
                  renderItem={({ item }) => (
                    <AdModalItem item={item} onClose={onClose} />
                  )}
                  keyExtractor={(item, index) =>
                    item.id?.toString() || index.toString()
                  }
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleScroll}
                  scrollEventThrottle={16}
                  snapToInterval={SLIDER_WIDTH}
                  decelerationRate="fast"
                  getItemLayout={(_, index) => ({
                    length: SLIDER_WIDTH,
                    offset: SLIDER_WIDTH * index,
                    index,
                  })}
                />
              </View>

              {/* Pagination Dots */}
              {ads.length > 1 && (
                <View style={styles.paginationContainer}>
                  {ads.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        activeIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.modalSkipButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSkipText}>Skip All</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

// Connected Global Modal wrapper for Root Layout
export const GlobalAdModal = () => {
  const { modalAds, modalVisible, closeModal } = useAdverts();
  return (
    <RenderAdItem visible={modalVisible} onClose={closeModal} ads={modalAds} />
  );
};

const styles = StyleSheet.create({
  backdropPressable: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
    width: MODAL_WIDTH,
    alignItems: "center",
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalCloseButton: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#F1F5F9",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  adCard: {
    width: SLIDER_WIDTH,
    alignItems: "center",
  },
  modalImageContainer: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: "#2563EB",
  },
  modalSkipButton: {
    marginTop: 12,
    paddingVertical: 4,
  },
  modalSkipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94A3B8",
  },
});

export default RenderAdItem;
