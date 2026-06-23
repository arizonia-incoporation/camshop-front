import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { colors, spacing, typography, radius } from '../../theme/theme';

const ROLES = [
  { key: 'buyer', label: 'Buyer', icon: 'cart-outline' },
  { key: 'seller', label: 'Seller', icon: 'storefront-outline' },
  { key: 'delivery', label: 'Delivery', icon: 'bicycle-outline' },
];

export default function SignupScreen({ navigation }) {
  const [role, setRole] = useState('buyer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const canSubmit = name && phone && password && agreed;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={typography.display}>Create your account</Text>
        <Text style={[typography.bodyMuted, { marginBottom: spacing.lg }]}>
          Join campus marketplace in a few steps
        </Text>

        <Text style={styles.sectionLabel}>I am a</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleChip, role === r.key && styles.roleChipActive]}
              onPress={() => setRole(r.key)}
            >
              <Ionicons name={r.icon} size={18} color={role === r.key ? colors.navy : colors.textMuted} />
              <Text style={[styles.roleText, role === r.key && { color: colors.navy, fontWeight: '700' }]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <InputField label="Full name" icon="person-outline" value={name} onChangeText={setName} placeholder="e.g. Gloria Nakato" />
        <InputField label="Phone number (MTN/Airtel)" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="07XXXXXXXX" keyboardType="phone-pad" />
        <InputField label="Email (optional)" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <InputField label="Password" icon="lock-closed-outline" secure value={password} onChangeText={setPassword} placeholder="Create a password" />

        {role === 'seller' && (
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.teal} />
            <Text style={styles.noticeText}>
              Sellers must add a reachable contact number — buyers and cart notifications use this.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
          <Ionicons
            name={agreed ? 'checkbox' : 'square-outline'}
            size={20}
            color={agreed ? colors.teal : colors.textMuted}
          />
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>
              Terms & Conditions
            </Text>{' '}
            and Privacy Policy
          </Text>
        </TouchableOpacity>

        <Button
          title="Create account"
          disabled={!canSubmit}
          onPress={() => navigation.navigate(role === 'buyer' ? 'BuyerApp' : role === 'seller' ? 'SellerApp' : 'DeliveryApp')}
          style={{ marginTop: spacing.md }}
        />

        <View style={styles.footerRow}>
          <Text style={typography.bodyMuted}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Log in</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionLabel: { ...typography.caption, marginBottom: spacing.sm, textTransform: 'uppercase' },
  roleRow: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.card,
  },
  roleChipActive: { borderColor: colors.lime, backgroundColor: '#F4FBD6' },
  roleText: { ...typography.bodyMuted, fontSize: 13 },
  noticeBox: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: '#E7F6F6',
    padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.md, alignItems: 'flex-start',
  },
  noticeText: { ...typography.bodyMuted, flex: 1, fontSize: 12 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  termsText: { ...typography.bodyMuted, flex: 1, fontSize: 13 },
  link: { color: colors.teal, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});
