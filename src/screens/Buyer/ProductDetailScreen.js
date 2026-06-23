import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View>
          <Image source={{ uri: product.image }} style={styles.image} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.navy} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: spacing.lg }}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={typography.display}>{product.name}</Text>
          <Text style={styles.price}>UGX {product.price.toLocaleString()}</Text>

          <View style={styles.sellerCard}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{product.sellerName[0]}</Text></View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={typography.h2}>{product.sellerName}</Text>
              <Text style={typography.bodyMuted}>{product.sellerContact}</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('ChatRoom', { sellerName: product.sellerName })}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>

          <Text style={[typography.h2, { marginTop: spacing.lg }]}>About this item</Text>
          <Text style={[typography.body, { marginTop: spacing.xs }]}>
            Quality {product.name.toLowerCase()} available for quick campus pickup or delivery. Message the seller for more details or to confirm availability.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Add to cart" onPress={() => { addToCart(product); navigation.navigate('Cart'); }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  image: { width: '100%', height: 280 },
  backBtn: { position: 'absolute', top: spacing.md, left: spacing.md, width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  category: { ...typography.caption, color: colors.teal, textTransform: 'uppercase', marginBottom: 4 },
  price: { fontSize: 20, fontWeight: '800', color: colors.teal, marginTop: spacing.xs },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.lg },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700' },
  chatBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E7F6F6', alignItems: 'center', justifyContent: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
});
