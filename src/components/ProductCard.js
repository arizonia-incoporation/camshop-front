import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadow } from '../theme/theme';

export default function ProductCard({ product, onPress, onAddToCart }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, shadow.card]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {product.category ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.category}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.seller} numberOfLines={1}>by {product.sellerName}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>UGX {product.price?.toLocaleString()}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={onAddToCart} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <Ionicons name="add" size={18} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageWrap: { width: '100%', height: 120, backgroundColor: colors.border },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.navy,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  info: { padding: spacing.sm },
  name: { ...typography.h2, fontSize: 14 },
  seller: { ...typography.caption, marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  price: { fontSize: 13, fontWeight: '800', color: colors.teal },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
});
