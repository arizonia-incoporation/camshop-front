import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS } from '../../data/mockData';
import { colors, spacing, typography, radius, shadow } from '../../theme/theme';

const NOTIFICATIONS = [
  { id: 'n1', text: 'Brian added "Scientific Calculator" to their cart', time: '2m ago' },
  { id: 'n2', text: 'Order #1042 was paid via MTN Mobile Money', time: '1h ago' },
];

export default function SellerDashboardScreen({ navigation }) {
  const myProducts = PRODUCTS.slice(0, 3);
  const earnings = myProducts.reduce((s, p) => s + p.price, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={typography.bodyMuted}>Welcome back</Text>
          <Text style={typography.h1}>TechHub BU</Text>
        </View>
        <TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('SellerNotifications')}>
          <Ionicons name="notifications-outline" size={20} color={colors.navy} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, shadow.card]}>
                <Text style={styles.statLabel}>Listed products</Text>
                <Text style={styles.statValue}>{myProducts.length}</Text>
              </View>
              <View style={[styles.statCard, shadow.card, { backgroundColor: colors.navy }]}>
                <Text style={[styles.statLabel, { color: colors.tealLight }]}>Earnings (after fees)</Text>
                <Text style={[styles.statValue, { color: colors.white }]}>UGX {(earnings - myProducts.length * 2000).toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addProductBtn} onPress={() => navigation.navigate('AddProduct')}>
              <Ionicons name="add-circle" size={20} color={colors.navy} />
              <Text style={styles.addProductText}>List a new product</Text>
            </TouchableOpacity>

            <Text style={[typography.h2, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>Recent notifications</Text>
            {NOTIFICATIONS.map((n) => (
              <View key={n.id} style={styles.notifRow}>
                <Ionicons name="cart" size={16} color={colors.teal} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={typography.body}>{n.text}</Text>
                  <Text style={typography.caption}>{n.time}</Text>
                </View>
              </View>
            ))}

            <Text style={[typography.h2, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>My products</Text>
          </>
        }
        data={myProducts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={typography.h2}>{item.name}</Text>
              <Text style={typography.bodyMuted}>UGX {item.price.toLocaleString()}</Text>
            </View>
            <Ionicons name="create-outline" size={18} color={colors.textMuted} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: 0 },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  statLabel: { ...typography.caption },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.navy, marginTop: 4 },
  addProductBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.lime, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, justifyContent: 'center' },
  addProductText: { fontWeight: '700', color: colors.navy },
  notifRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.sm, padding: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.xs },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  thumb: { width: 50, height: 50, borderRadius: radius.sm },
});
