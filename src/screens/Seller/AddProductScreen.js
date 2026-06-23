import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { CATEGORIES } from '../../data/mockData';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('Food');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to upload a product image.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const canSubmit = name && price && contact && image;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={typography.display}>List a product</Text>
        <Text style={[typography.bodyMuted, { marginBottom: spacing.lg }]}>Buyers will see this in the marketplace</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
              <Text style={typography.bodyMuted}>Tap to upload product photo</Text>
            </>
          )}
        </TouchableOpacity>

        <InputField label="Product name" icon="pricetag-outline" value={name} onChangeText={setName} placeholder="e.g. Scientific Calculator" />
        <InputField label="Price (UGX)" icon="cash-outline" value={price} onChangeText={setPrice} placeholder="35000" keyboardType="number-pad" />
        <InputField label="Your contact (for buyer notifications)" icon="call-outline" value={contact} onChangeText={setContact} placeholder="07XXXXXXXX" keyboardType="phone-pad" />

        <Text style={styles.label}>Category</Text>
        <View style={styles.catRow}>
          {CATEGORIES.filter((c) => c !== 'All').map((c) => (
            <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]} onPress={() => setCategory(c)}>
              <Text style={[typography.bodyMuted, category === c && { color: colors.navy, fontWeight: '700' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="notifications-outline" size={18} color={colors.teal} />
          <Text style={styles.noticeText}>You'll get a notification on this contact whenever a buyer adds this product to their cart.</Text>
        </View>

        <Button title="Publish product" disabled={!canSubmit} onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  imagePicker: { height: 160, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, backgroundColor: colors.card, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  label: { ...typography.caption, marginBottom: spacing.sm, textTransform: 'uppercase' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  noticeBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#E7F6F6', padding: spacing.sm, borderRadius: radius.sm, alignItems: 'flex-start' },
  noticeText: { ...typography.bodyMuted, flex: 1, fontSize: 12 },
});
