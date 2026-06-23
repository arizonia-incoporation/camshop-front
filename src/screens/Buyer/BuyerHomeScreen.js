import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../components/InputField';
import ProductCard from '../../components/ProductCard';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function BuyerHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { addToCart, items } = useCart();

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          {/* <Text style={typography.bodyMuted}>Deliver to</Text> */}
          <Text style={typography.h2}>Camshop🎁</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color={colors.navy} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <InputField icon="search-outline" placeholder="Search products, services..." value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        style={{ flexGrow: 0, height: 60, marginBottom: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategory(item)}
            style={[styles.chip, category === item && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === item && { color: colors.navy, fontWeight: '700' }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onAddToCart={() => addToCart(item)}
          />
        )}
        ListEmptyComponent={<Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>No products found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.lime, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { fontSize: 10, fontWeight: '800', color: colors.navy },
  chip: { paddingHorizontal: 14, paddingVertical: 8,justifyContent: 'center', alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { ...typography.bodyMuted, fontSize: 13, lineHeight: 16 },
});
