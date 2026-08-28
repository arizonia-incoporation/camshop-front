import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography, shadow } from "../../../theme/theme";
import EventMetadata from "../../../components/create-advert/metadataForms/EventMetadata";
import ProductMetadata from "../../../components/create-advert/metadataForms/ProductMetadata";
import AppCalls from "../../../utils/network";
import DiscountMetadata from "../../../components/create-advert/metadataForms/DiscountMetadata";
import LostFoundMetadata from "../../../components/create-advert/metadataForms/LostFoundMetadata";
import BusinessMetadata from "../../../components/create-advert/metadataForms/BusinessMetadata";
import InfoMetadata from "../../../components/create-advert/metadataForms/InfoMetadata";
import { useRouter } from "expo-router";

const AD_TYPES = [
  "EVENT",
  "DISCOUNT",
  "LOST",
  "FOUND",
  "BUSINESS",
  "PRODUCT",
  "INFO",
];

export default function CreateAdvertScreen() {
  const navigation = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Unified Form State
  const [type, setType] = useState("PRODUCT");
  const [displayFormat, setDisplayFormat] = useState("BANNER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [buttonText, setButtonText] = useState("Learn More");
  const [targetUrl, setTargetUrl] = useState("");
  const [metadata, setMetadata] = useState({});

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages([...images, ...uris]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        type,
        displayFormat,
        title,
        description,
        images,
        buttonText,
        targetUrl,
        metadata,
      };

      // Call API (replace with user auth token)
      await AppCalls.post("/adverts/",payload);

      Toast.show({
        type: "success",
        text1: "Advert Created!",
        text2: "Your advert has been submitted for review.",
      });
      navigation.push("/home/")
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.progressHeader}>
        <Text style={typography.caption}>Step {step} of 4</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {/* STEP 1: Type & Format */}
        {step === 1 && (
          <View style={styles.stepBlock}>
            <Text style={typography.h1}>Select Advert Type</Text>
            <View style={styles.grid}>
              {AD_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.card, type === t && styles.activeCard]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.cardText,
                      type === t && styles.activeCardText,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[typography.h2, { marginTop: spacing.md }]}>
              Format
            </Text>
            <View style={styles.row}>
              {["BANNER", "MODAL", "IN_FEED"].map((fmt) => (
                <TouchableOpacity
                  key={fmt}
                  style={[
                    styles.chip,
                    displayFormat === fmt && styles.activeChip,
                  ]}
                  onPress={() => setDisplayFormat(fmt)}
                >
                  <Text
                    style={
                      displayFormat === fmt
                        ? styles.activeChipText
                        : styles.chipText
                    }
                  >
                    {fmt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: Basics & Images */}
        {step === 2 && (
          <View style={styles.stepBlock}>
            <Text style={typography.h1}>Basics & Media</Text>
            <TextInput
              style={styles.input}
              placeholder="Advert Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Detailed Description"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={colors.navy} />
              <Text style={typography.button}>Upload Images</Text>
            </TouchableOpacity>

            <ScrollView horizontal style={{ marginTop: spacing.sm }}>
              {images.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.thumb} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* STEP 3: Dynamic Category Metadata */}
        {step === 3 && (
          <View style={styles.stepBlock}>
            {type === "EVENT" && <EventMetadata value={metadata} onChange={setMetadata} />}
            {type === "PRODUCT" && <ProductMetadata value={metadata} onChange={setMetadata} />}
            {type === "DISCOUNT" && <DiscountMetadata value={metadata} onChange={setMetadata} />}
            {(type === "LOST" || type === "FOUND") && <LostFoundMetadata value={metadata} onChange={setMetadata} />}
            {type === "BUSINESS" && <BusinessMetadata value={metadata} onChange={setMetadata} />}
            {type === "INFO" && <InfoMetadata value={metadata} onChange={setMetadata} />}
          </View>
        )}

        {/* STEP 4: Review & Call To Action */}
        {step === 4 && (
          <View style={styles.stepBlock}>
            <Text style={typography.h1}>CTA & Link</Text>
            <TextInput
              style={styles.input}
              placeholder="Button Label (e.g. Claim Offer)"
              value={buttonText}
              onChangeText={setButtonText}
            />
            <TextInput
              style={styles.input}
              placeholder="Target URL / Link (Optional)"
              value={targetUrl}
              onChangeText={setTargetUrl}
            />
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 4 ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Submit Advert</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  progressHeader: { padding: spacing.md, backgroundColor: colors.white },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
  },
  scrollBody: { padding: spacing.md },
  stepBlock: { gap: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  card: {
    width: "30%",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCard: { borderColor: colors.lime, backgroundColor: colors.limeLight },
  cardText: { ...typography.caption, color: colors.textSecondary },
  activeCardText: { color: colors.lime, fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  activeChip: { backgroundColor: colors.navy },
  chipText: { ...typography.caption, color: colors.navy },
  activeChipText: { color: colors.white, fontWeight: "700" },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  uploadBtn: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.lime,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryBtnText: { ...typography.button, color: colors.white },
  secondaryBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { ...typography.button, color: colors.navy },
});
