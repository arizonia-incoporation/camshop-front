import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/theme";

const AdDetailModal = ({ visible, item, onClose }) => {
  if (!item) return null;

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanNum = phone.replace(/[^0-9]/g, "");
      Linking.openURL(`https://wa.me/${cleanNum}`);
    }
  };

  const hasImage = item.images && item.images.length > 0 && item.images[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Backdrop Pressable with full flex overlay */}
      <Pressable style={styles.backdropPressable} onPress={onClose}>
        <View style={styles.detailOverlay}>
          {/* Prevent modal card taps from closing overlay */}
          <Pressable
            style={styles.detailCardContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#334155" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Image Banner or Placeholder Header */}
              {hasImage ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.modalHeroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderHeader}>
                  <Ionicons
                    name={
                      item.type === "EVENT"
                        ? "calendar-outline"
                        : item.type === "LOST"
                          ? "search-outline"
                          : "briefcase-outline"
                    }
                    size={40}
                    color={colors.lime}
                  />
                </View>
              )}

              <View style={styles.modalPadding}>
                {/* Type Badge */}
                <View style={styles.modalTypeRow}>
                  <Text style={styles.modalTypeBadge}>{item.type}</Text>
                </View>

                <Text style={styles.modalTitleText}>{item.title}</Text>
                <Text style={styles.modalDescText}>{item.description}</Text>

                {/* EVENT METADATA */}
                {item.type === "EVENT" && item.metadata && (
                  <View style={styles.metadataSection}>
                    <Text style={styles.sectionHeaderTitle}>
                      Event Schedule
                    </Text>

                    {item.metadata.venue && (
                      <View style={styles.metaDetailRow}>
                        <Ionicons
                          name="location"
                          size={18}
                          color={colors.lime}
                        />
                        <Text style={styles.metaDetailText}>
                          Venue: {item.metadata.venue}
                        </Text>
                      </View>
                    )}

                    {item.metadata.scheduleType === "SINGLE" && (
                      <View style={styles.metaDetailBlock}>
                        <Text style={styles.metaSubTitle}>Date & Time</Text>
                        <Text style={styles.metaDetailText}>
                          📅 {item.metadata.eventDate || "Date N/A"}
                        </Text>
                        <Text style={styles.metaDetailText}>
                          ⏰ {item.metadata.startTime} - {item.metadata.endTime}
                        </Text>
                      </View>
                    )}

                    {item.metadata.scheduleType === "DAILY" && (
                      <View style={styles.metaDetailBlock}>
                        <Text style={styles.metaSubTitle}>Daily Duration</Text>
                        <Text style={styles.metaDetailText}>
                          Start: {item.metadata.startDateTime}
                        </Text>
                        <Text style={styles.metaDetailText}>
                          End: {item.metadata.endDateTime}
                        </Text>
                      </View>
                    )}

                    {item.metadata.scheduleType === "WEEKLY" &&
                      item.metadata.weeklySchedule && (
                        <View style={styles.metaDetailBlock}>
                          <Text style={styles.metaSubTitle}>
                            Weekly Schedule
                          </Text>
                          {Object.entries(item.metadata.weeklySchedule).map(
                            ([day, times]) => (
                              <View key={day} style={styles.dayTimeRow}>
                                <Text style={styles.dayLabel}>{day}:</Text>
                                <Text style={styles.timeValue}>
                                  {times.startTime} - {times.endTime}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                      )}
                  </View>
                )}

                {/* LOST & FOUND METADATA */}
                {(item.type === "LOST" || item.type === "FOUND") &&
                  item.metadata && (
                    <View style={styles.metadataSection}>
                      <Text style={styles.sectionHeaderTitle}>
                        Item Information
                      </Text>

                      <View style={styles.metaDetailRow}>
                        <Ionicons
                          name="location-sharp"
                          size={18}
                          color="#E0473C"
                        />
                        <Text style={styles.metaDetailText}>
                          Last Seen: {item.metadata.lastSeenLocation || "N/A"}
                        </Text>
                      </View>

                      {item.metadata.dateOccurred && (
                        <View style={styles.metaDetailRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#64748B"
                          />
                          <Text style={styles.metaDetailText}>
                            Date: {item.metadata.dateOccurred}
                          </Text>
                        </View>
                      )}

                      {item.metadata.contactPhone && (
                        <View style={styles.contactActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.contactBtn,
                              { backgroundColor: "#2563EB" },
                            ]}
                            onPress={() =>
                              handleCall(item.metadata.contactPhone)
                            }
                          >
                            <Ionicons name="call" size={18} color="#FFFFFF" />
                            <Text style={styles.contactBtnText}>
                              Call Owner
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.contactBtn,
                              { backgroundColor: "#25D366" },
                            ]}
                            onPress={() =>
                              handleWhatsApp(item.metadata.contactPhone)
                            }
                          >
                            <Ionicons
                              name="logo-whatsapp"
                              size={18}
                              color="#FFFFFF"
                            />
                            <Text style={styles.contactBtnText}>WhatsApp</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
              </View>
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropPressable: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  detailOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center", // Centered vertically
    alignItems: "center", // Centered horizontally
    padding: 20, // Prevents edge clipping
  },
  detailCardContainer: {
    width: "100%",
    maxWidth: 500, // Clean desktop modal width
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Rounded corners on all 4 sides when centered
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: "#F1F5F9",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  modalHeroImage: {
    width: "100%",
    height: 200,
  },
  placeholderHeader: {
    width: "100%",
    height: 90,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalPadding: {
    padding: 20,
  },
  modalTypeRow: {
    marginBottom: 6,
  },
  modalTypeBadge: {
    color: colors.lime,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalDescText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
  metadataSection: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  metaDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaDetailText: {
    fontSize: 14,
    color: "#334155",
  },
  metaDetailBlock: {
    marginTop: 6,
    gap: 4,
  },
  metaSubTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  dayTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  timeValue: {
    fontSize: 13,
    color: "#64748B",
  },
  contactActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default AdDetailModal;
