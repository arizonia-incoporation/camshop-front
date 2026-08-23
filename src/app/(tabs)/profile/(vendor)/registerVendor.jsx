// screens/SellerRegistrationScreen.js
import React, { useState } from "react";
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
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";
import AppCalls from "../../../../utils/network";
import InputField from "../../../../components/InputField";
import { useRouter } from "expo-router";
import { colors } from "../../../../theme/theme";
import { showToast } from "../../../../utils/toast";
import { useAuth } from "../../../../context/AuthContext";

// Validation schema for seller registration
const sellerSchema = z.object({
  name: z.string().min(3, "Vendor name must be at least 3 characters"),
  contact: z.string().min(10, "Please enter a valid phone number"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Please enter your business address"),
});

const SellerRegistrationScreen = () => {
  const navigation = useRouter();
  const { checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [mediaUri, setMediaUri] = useState(null);
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
    trigger,
  } = useForm({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: "",
      contact: "",
      description: "",
      address: "",
    },
  });

  
  const requestPermissions = async (type) => {
    if (type === "image") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to upload images.",
        );
        return false;
      }
      return true;
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to upload videos.",
        );
        return false;
      }
      return true;
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions("image");
    if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formattedDataUri = `data:${asset.mimeType};base64,${asset.base64}`;
        setImage({
          uri: asset.uri,
          string: formattedDataUri,
        });
      }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take a photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
      const asset = result.assets[0];
      const formattedDataUri = `data:${asset.mimeType};base64,${asset.base64}`;
      setImage({
        uri: asset.uri,
        string: formattedDataUri,
      });
        setImageError("");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert(
      "Upload Image",
      "Choose an option to upload your business image",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  // Remove image
  const removeImage = () => {
    setMediaUri(null);
    setFile(null);
    setMediaType(null);
    setImageError("");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await AppCalls.post(
        "/vendors/",
        JSON.stringify({
          ...data,
          imageString: image.string,
        }),
      );
      showToast(
        "success",
        "Registration Successful",
        "Your vendor account is now active, start adding products.",
      );
      console.log(res)
      checkAuth();
      navigation.replace("home/vendorDetails?vendorId=" + res.data.id);
    } catch (error) {
      console.log(error)
      showToast(
        "error",
        "Registration Failed",
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Seller</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Business Image</Text>
          <Text style={styles.sectionSubtext}>
            Upload a photo of your business or products
          </Text>

          <TouchableOpacity
            style={[styles.imageUpload, image && styles.imageUploadHasImage]}
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
          >
            {image ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <MaterialIcons name="add-a-photo" size={48} color="#999999" />
                <Text style={styles.uploadText}>Tap to upload image</Text>
                <Text style={styles.uploadSubtext}>JPG, PNG or WEBP</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageError ? (
            <Text style={styles.errorText}>{imageError}</Text>
          ) : null}
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <InputField
            label="Vendor Name"
            icon="storefront"
            name="name"
            control={control}
            placeholder="Enter your store/business name"
            autoCapitalize="none"
          />
          <InputField
            label="Vendor Contact"
            icon="call-outline"
            name="contact"
            control={control}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Type</Text>
            <View style={styles.businessTypesGrid}>
              {businessTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.businessTypeCard,
                    selectedBusinessType === type.id &&
                      styles.businessTypeCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedBusinessType(type.id);
                    setValue("businessType", type.id);
                  }}
                >
                  <Text
                    style={[
                      styles.businessTypeText,
                      selectedBusinessType === type.id &&
                        styles.businessTypeTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.businessType && (
              <Text style={styles.errorText}>
                {errors.businessType.message}
              </Text>
            )}
          </View> */}

          <InputField
            label="Address"
            icon="location-outline"
            name="address"
            control={control}
            placeholder="Where is your business located"
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View style={styles.textAreaContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  placeholder="Describe your business, products, and what makes you unique..."
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#999999"
                />
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <MaterialIcons name="info-outline" size={20} color="#0ea5e9" />
          <Text style={styles.termsText}>
            By registering as a seller, you agree to our{" "}
            <Text style={styles.termsLink}>Seller Terms and Conditions</Text>
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Registration</Text>
              <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          We'll review your application and get back to you within 24-48 hours
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  imageUpload: {
    width: "100%",
    height: 200,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageUploadHasImage: {
    borderStyle: "solid",
    borderColor: colors.lime,
    padding: 0,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  formSection: {
    gap: 16,
  },
  textAreaContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#334155",
    backgroundColor: "#f8fafc",
    minHeight: 120,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  termsText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  termsLink: {
    color: "#0ea5e9",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: colors.lime,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footerNote: {
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default SellerRegistrationScreen;
