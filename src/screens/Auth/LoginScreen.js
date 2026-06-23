import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ alignItems: 'center', marginVertical: spacing.xl }}>
          <Logo size={64} />
          <Text style={[typography.h1, { marginTop: spacing.sm }]}>Welcome back</Text>
          <Text style={typography.bodyMuted}>Log in to continue shopping</Text>
        </View>

        <InputField label="Phone number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="07XXXXXXXX" keyboardType="phone-pad" />
        <InputField label="Password" icon="lock-closed-outline" secure value={password} onChangeText={setPassword} placeholder="Your password" />

        <Text style={[styles.link, { alignSelf: 'flex-end', marginBottom: spacing.lg }]}>Forgot password?</Text>

        <Button title="Log in" onPress={() => navigation.navigate('RoleRouter')} />

        <View style={styles.footerRow}>
          <Text style={typography.bodyMuted}>New to Camshop? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Create account</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  link: { color: colors.teal, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});
