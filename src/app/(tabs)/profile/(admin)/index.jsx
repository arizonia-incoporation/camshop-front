import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  typography,
  radius,
  shadow,
} from "../../../../theme/theme";

const STATS = [
  { label: 'Total transactions', value: '1,284', icon: 'swap-horizontal-outline' },
  { label: 'Service fees collected', value: 'UGX 2.56M', icon: 'cash-outline' },
  { label: 'Active sellers', value: '63', icon: 'storefront-outline' },
  { label: 'Active buyers', value: '940', icon: 'people-outline' },
];

const ACTIVITY = [
  { id: 'a1', text: 'Order #1042 paid — UGX 47,000 via MTN', time: '12m ago', type: 'payment' },
  { id: 'a2', text: 'New seller "Fresh Fold" approved', time: '40m ago', type: 'account' },
  { id: 'a3', text: 'Order #1041 flagged — buyer dispute opened', time: '1h ago', type: 'flag' },
  { id: 'a4', text: 'Order #1040 paid — UGX 12,000 via Airtel', time: '2h ago', type: 'payment' },
];

const ICONS = { payment: 'cash-outline', account: 'person-add-outline', flag: 'alert-circle-outline' };
const ICON_COLORS = { payment: colors.success, account: colors.teal, flag: colors.warning };

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[typography.display, { padding: spacing.lg, paddingBottom: 0 }]}>Admin overview</Text>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.statsGrid}>
              {STATS.map((s) => (
                <View key={s.label} style={[styles.statCard, shadow.card]}>
                  <Ionicons name={s.icon} size={20} color={colors.teal} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[typography.h2, { marginTop: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
              Live activity
            </Text>
          </>
        }
        data={ACTIVITY}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.activityRow}>
            <View style={[styles.iconWrap, { backgroundColor: ICON_COLORS[item.type] + '22' }]}>
              <Ionicons name={ICONS[item.type]} size={16} color={ICON_COLORS[item.type]} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={typography.body}>{item.text}</Text>
              <Text style={typography.caption}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg },
  statCard: { width: '47%', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.navy, marginTop: spacing.xs },
  statLabel: { ...typography.caption, marginTop: 2 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  iconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
