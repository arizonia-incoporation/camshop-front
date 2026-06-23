import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function ChatRoomScreen({ route, navigation }) {
  const { sellerName } = route.params;
  const [messages, setMessages] = useState([
    { id: 'm1', from: 'them', text: 'Hi! Thanks for your order, it will be ready in 20 minutes.' },
    { id: 'm2', from: 'me', text: 'Great, can it be delivered to Block C hostel?' },
    { id: 'm3', from: 'them', text: 'Yes, our delivery partner will message you shortly.' },
  ]);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'me', text: draft.trim() }]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={[typography.h2, { marginLeft: spacing.sm }]}>{sellerName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={item.from === 'me' ? styles.bubbleTextMe : styles.bubbleTextThem}>{item.text}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Ionicons name="send" size={18} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  bubble: { maxWidth: '78%', padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  bubbleThem: { backgroundColor: colors.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.lime, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTextThem: { ...typography.body },
  bubbleTextMe: { ...typography.body, color: colors.navy },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: spacing.md, height: 44, ...typography.body },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
});
