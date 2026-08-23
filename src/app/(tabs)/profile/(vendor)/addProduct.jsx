// screens/AddProduct.js
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import InputField from "../../../../components/InputField";
import { showToast } from "../../../../utils/toast";
import { colors, shadow } from '../../../../theme/theme'
import categories from "../../../../data/Category.json";
import AppCalls from "../../../../utils/network";

// Tab constants
const TABS = {
  CATEGORY: 0,
  SUBCATEGORY: 1,
  DETAILS: 2,
  IMAGES: 3,
};

// Product validation schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  price: z.string().min(1, "Price is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const AddProduct = () => {
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(TABS.CATEGORY);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      price: "",
      description: "",
    },
  });

  const pickMainImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera roll permissions to upload images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const formattedDataUri = `data:${asset.mimeType};base64,${asset.base64}`;
        setMainImage({
          uri: asset.uri,
          string: formattedDataUri,
        });
      }
    } catch (error) {
      console.error("Error picking main image:", error);
      return showToast(
        "error",
        "Image error",
        "Failed to pick image. Please try again.",
      );
    }
  };
  
  const pickAdditionalImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          return showToast(
            "error",
            "Permission Required",
            "We need camera roll permissions to upload images.",
          );
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
          base64: true,
        });
        
        if (!result.canceled) {
          
          const assets = result.assets.map((asset) => {
            const formattedDataUri = `data:${asset.mimeType};base64,${asset.base64}`;
            return {
              uri: asset.uri,
              string: formattedDataUri,
            };
          });
          setAdditionalImages([...additionalImages, ...assets]);
        }
      } catch (error) {
        console.error("Error picking additional images:", error);
        return showToast(
          "error",
          "Image error",
          "Failed to pick image. Please try again.",
        );
    }
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  const goToNextTab = () => {
    if (currentTab === TABS.CATEGORY && !selectedCategory) {
      return showToast(
        "error",
        "Selection Required",
        "Please select a category first.",
      );
    }
    if (currentTab === TABS.SUBCATEGORY && !selectedSubcategory) {
      return showToast(
        "error",
        "Selection Required",
        "Please select a category first.",
      );
    }
    if (currentTab === TABS.DETAILS) {
      // Validate details tab
      const values = getValues();
      if (!values.name || !values.price || !values.description) {
      }
    }
    if (currentTab === TABS.IMAGES && !mainImage) {
      return showToast(
        "error",
        "Image Required",
        "Please add a main image for your product.",
      );
    }
    setCurrentTab(currentTab + 1);
  };

  const goToPreviousTab = () => {
    setCurrentTab(currentTab - 1);
  };

  // Handle final submission
  const onSubmit = async (formData) => {
    if (!mainImage) return showToast(
        "error",
        "Image Required",
        "Please add a main image for your product.",
      );

    if (additionalImages.length > 5) return showToast(
      "error",
      "Excessive additional images",
      "You can only have additional images for your product.",
    );

    setLoading(true);

    try {
      const data = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        imageStrings: [mainImage, ...additionalImages],
        categoryId: [
          { categoryId: selectedCategory },
          { categoryId: selectedSubcategory },
        ],
      };

      // Simulate API call
      const res = await AppCalls.post("/products/", data);
      console.log("added -------------------------------------------- ",res.data)

      Alert.alert("Success!", "Your product has been added successfully.", [
        {
          text: "OK",
          onPress: () => navigation.push(`/home/productDetails?productId=${res.data.products[0].id}`),
        },
      ]);
    } catch (error) {
      console.error("Product addition error:", error);
      Alert.alert("Failed", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Choose a Category</Text>
      <Text style={styles.tabSubtitle}>
        Select the category that best fits your product
      </Text>

      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              shadow.card,
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardSelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View
              style={[
                styles.categoryIconContainer,
                selectedCategory === category.id && styles.categoryIconSelected,
              ]}
            >
              <Ionicons
                name={category.icon}
                size={28}
                color={selectedCategory === category.id ? colors.lime : "#666666"}
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSubcategoryTab = () => {
    const subcategories = categories.find((cate)=>cate.id===selectedCategory).children || [];

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Choose a Subcategory</Text>
        <Text style={styles.tabSubtitle}>
          Select a subcategory for your product
        </Text>

        <View style={styles.subcategoryList}>
          {subcategories.map((subcategory, index) => (
            <TouchableOpacity
              key={index}
              style={[
                shadow.card,
                styles.subcategoryItem,
                selectedSubcategory === subcategory.id &&
                  styles.subcategoryItemSelected,
              ]}
              onPress={() => setSelectedSubcategory(subcategory.id)}
            >
              <Text
                style={[
                  styles.subcategoryText,
                  selectedSubcategory === subcategory.id &&
                    styles.subcategoryTextSelected,
                ]}
              >
                {subcategory.name}
              </Text>
              {selectedSubcategory === subcategory.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.lime} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Product Details</Text>
      <Text style={styles.tabSubtitle}>Provide details about your product</Text>

      <View style={styles.detailsForm}>
        <InputField
          label="Product Name"
          icon="pencil-outline"
          name="name"
          control={control}
          placeholder="Enter product name"
          error={errors.name?.message}
        />

        <InputField
          label="Price (UGX)"
          icon="cash-outline"
          name="price"
          control={control}
          placeholder="e.g., 25000"
          keyboardType="numeric"
          error={errors.price?.message}
        />

        <View style={styles.textAreaContainer}>
          <Text style={styles.textAreaLabel}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  placeholder="Describe your product in detail..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor="#999999"
                />
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>
      </View>
    </View>
  );

  const renderImagesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Product Images</Text>
      <Text style={styles.tabSubtitle}>
        Add images to showcase your product
      </Text>

      {/* Main Image */}
      <View style={styles.mainImageSection}>
        <Text style={styles.imageSectionLabel}>Main Image</Text>
        <TouchableOpacity
          style={[
            styles.mainImageContainer,
            mainImage && styles.mainImageFilled,
          ]}
          onPress={pickMainImage}
          activeOpacity={0.7}
        >
          {mainImage ? (
            <View style={styles.mainImageWrapper}>
              <Image source={{ uri: mainImage.uri }} style={styles.mainImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeMainImage}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mainImagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#999999" />
              <Text style={styles.placeholderText}>Tap to add main image</Text>
              <Text style={styles.placeholderSubtext}>
                Recommended: 16:9 ratio
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Additional Images */}
      <View style={styles.additionalImagesSection}>
        <View style={styles.imageSectionHeader}>
          <Text style={styles.imageSectionLabel}>Additional Images</Text>
          <Text style={styles.imageCount}>{additionalImages.length} added</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.additionalImagesScroll}
        >
          <View style={styles.additionalImagesContainer}>
            {additionalImages.map((image, index) => (
              <View key={index} style={styles.additionalImageWrapper}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.additionalImage}
                />
                <TouchableOpacity
                  style={styles.removeAdditionalImage}
                  onPress={() => removeAdditionalImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            {additionalImages.length === 0 && (
              <View style={styles.emptyImagesContainer}>
                <Ionicons name="images-outline" size={32} color="#cccccc" />
                <Text style={styles.emptyImagesText}>No additional images</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.addImagesButton}
          onPress={pickAdditionalImages}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.lime} />
          <Text style={styles.addImagesButtonText}>Add More Images</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case TABS.CATEGORY:
        return renderCategoryTab();
      case TABS.SUBCATEGORY:
        return renderSubcategoryTab();
      case TABS.DETAILS:
        return renderDetailsTab();
      case TABS.IMAGES:
        return renderImagesTab();
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentTab === TABS.CATEGORY) return !!selectedCategory;
    if (currentTab === TABS.SUBCATEGORY) return !!selectedSubcategory;
    if (currentTab === TABS.DETAILS) {
      const values = getValues();
      return values.name && values.price && values.description;
    }
    if (currentTab === TABS.IMAGES) return !!mainImage;
    return true;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Indicator */}
      {/* <View style={styles.tabIndicator}>
        {Object.values(TABS)
          .filter((t) => typeof t === "number")
          .map((tab) => (
            <View key={tab} style={styles.tabStep}>
              <View
                style={[
                  styles.tabDot,
                  currentTab === tab && styles.tabDotActive,
                  currentTab > tab && styles.tabDotCompleted,
                ]}
              />
              {tab <
                Object.values(TABS).filter((t) => typeof t === "number")
                  .length -
                  1 && (
                <View
                  style={[
                    styles.tabLine,
                    currentTab > tab && styles.tabLineCompleted,
                  ]}
                />
              )}
            </View>
          ))}
      </View> */}

      {/* Tab Labels */}
      <View style={styles.tabLabels}>
        <Text
          style={[
            styles.tabLabel,
            currentTab === TABS.CATEGORY && styles.tabLabelActive,
          ]}
        >
          Category
        </Text>
        <Text
          style={[
            styles.tabLabel,
            currentTab === TABS.SUBCATEGORY && styles.tabLabelActive,
          ]}
        >
          Subcategory
        </Text>
        <Text
          style={[
            styles.tabLabel,
            currentTab === TABS.DETAILS && styles.tabLabelActive,
          ]}
        >
          Details
        </Text>
        <Text
          style={[
            styles.tabLabel,
            currentTab === TABS.IMAGES && styles.tabLabelActive,
          ]}
        >
          Images
        </Text>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {currentTab > 0 && (
          <TouchableOpacity style={[shadow.card,styles.navButton]} onPress={goToPreviousTab}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentTab < 3 ? (
          <TouchableOpacity
            style={[
              shadow.card,
              styles.navButton,
              styles.navButtonPrimary,
              !canProceed() && styles.navButtonDisabled,
            ]}
            onPress={goToNextTab}
            disabled={!canProceed()}
          >
            <Text style={styles.navButtonPrimaryText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.navButtonPrimaryText}>Submit Product</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  tabIndicator: {
    flexDirection: "row",
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: "center",
  },
  tabStep: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tabDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
  },
  tabDotActive: {
    backgroundColor: colors.lime,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  tabDotCompleted: {
    backgroundColor: colors.lime,
  },
  tabLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 4,
  },
  tabLineCompleted: {
    backgroundColor: colors.lime,
  },
  tabLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  tabLabel: {
    fontSize: 12,
    color: "#999999",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: colors.lime,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  tabContent: {
    flex: 1,
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
    marginBottom: 24,
  },
  // Category Tab Styles
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "30%",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 8,
  },
  categoryCardSelected: {
    borderColor: colors.lime,
    backgroundColor: "#fef3c7",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIconSelected: {
    backgroundColor: "#fef3c7",
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    color: "#666666",
    fontWeight: "500",
  },
  categoryNameSelected: {
    color: colors.lime,
    fontWeight: "600",
  },
  // Subcategory Tab Styles
  subcategoryList: {
    gap: 8,
  },
  subcategoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  subcategoryItemSelected: {
    backgroundColor: "#fef3c7",
    borderColor: colors.lime,
  },
  subcategoryText: {
    fontSize: 16,
    color: "#334155",
  },
  subcategoryTextSelected: {
    color: colors.lime,
    fontWeight: "600",
  },
  // Details Tab Styles
  detailsForm: {
    gap: 16,
  },
  textAreaContainer: {
    marginBottom: 4,
  },
  textAreaLabel: {
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
  // Images Tab Styles
  mainImageSection: {
    marginBottom: 24,
  },
  imageSectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  mainImageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  mainImageFilled: {
    borderStyle: "solid",
    borderColor: colors.lime,
  },
  mainImageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
  },
  mainImagePlaceholder: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  additionalImagesSection: {
    marginBottom: 24,
  },
  imageSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  imageCount: {
    fontSize: 14,
    color: "#666666",
  },
  addImagesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  addImagesButtonText: {
    fontSize: 14,
    color: colors.lime,
    fontWeight: "500",
  },
  additionalImagesScroll: {
    flexDirection: "row",
  },
  additionalImagesContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  additionalImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  additionalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeAdditionalImage: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 2,
  },
  emptyImagesContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
  },
  emptyImagesText: {
    fontSize: 11,
    color: "#999999",
    marginTop: 4,
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    gap: 4,
  },
  navButtonPrimary: {
    backgroundColor: colors.lime,
  },
  navButtonDisabled: {
    backgroundColor: "#e5e5e5",
  },
  navButtonText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  navButtonPrimaryText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default AddProduct;
