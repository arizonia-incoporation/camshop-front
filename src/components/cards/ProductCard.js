import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadow } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product, onPress, onAddToCart }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleEdit = () => {
    
  }
  const handleAddCart = async () => {
    setLoading(true)
    try {
      await onAddToCart(product.id, product?.vendorId);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, shadow.card]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.category ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.category}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.seller} numberOfLines={1}>
          by {product.vendor.name}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            UGX {product.price?.toLocaleString()}
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={
              user?.vendor?.id === product.vendorId ? handleEdit : handleAddCart
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {user?.vendor?.id === product.vendorId ? (
              <View
                style={{
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.white}
                />
                <Text style={{ color: colors.white }}>Edit</Text>
              </View>
            ) : loading ? (
              <View
                style={{
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={18} color={colors.white} />
                <Text style={{ color: colors.white }}>Adding</Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={18} color={colors.white} />
                <Text style={{ color: colors.white }}>Cart</Text>
              </View>
            )}
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
  imageWrap: { width: '100%', height: 160, backgroundColor: colors.border },
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
    width: 70, height: 28, borderRadius: 14,
    backgroundColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
});
