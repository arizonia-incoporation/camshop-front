import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../../theme/theme';
import { useRouter } from 'expo-router';

const THREADS = [
  { id: 't1', name: 'TechHub BU', role: 'Seller', lastMessage: 'Sure, it is still available!', time: '2m', unread: true },
  { id: 't2', name: 'Boda Express (Delivery)', role: 'Delivery', lastMessage: "I'm 5 minutes from your hostel", time: '20m', unread: true },
  { id: 't3', name: "Mama Joy's Kitchen", role: 'Seller', lastMessage: 'Order ready for pickup', time: '1h', unread: false },
];

export default function ChatListScreen() {
  const navigation = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[typography.display, { padding: spacing.lg, paddingBottom: spacing.sm }]}>Messages</Text>
      <FlatList
        data={THREADS}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.push('/chat/ChatRoom/?sellerName=' + item.name)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name[0]}</Text></View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.topLine}>
                <Text style={typography.h2}>{item.name}</Text>
                <Text style={typography.caption}>{item.time}</Text>
              </View>
              <Text style={[typography.bodyMuted, item.unread && { color: colors.navy, fontWeight: '600' }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between' },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.lime, marginLeft: spacing.xs },
});
