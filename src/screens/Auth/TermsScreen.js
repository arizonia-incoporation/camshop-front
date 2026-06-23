import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';

const SECTIONS = [
  { title: '1. Using Camshop', body: 'Camshop connects Busitema University students as buyers and sellers. You must provide accurate account information and keep your login details private.' },
  { title: '2. Payments', body: 'Payments are processed via MTN and Airtel Mobile Money. Camshop deducts a fixed service fee of UGX 2,000 from each completed transaction before funds are released to the seller.' },
  { title: '3. Seller responsibilities', body: 'Sellers must list accurate product details, images, and a reachable contact number. Sellers are responsible for fulfilling orders placed through the app.' },
  { title: '4. Delivery', body: 'Delivery partners may message buyers to coordinate handoff. Delivery details shared in-app should only be used for completing the order.' },
  { title: '5. Conduct', body: 'Harassment, fraud, or listing of prohibited items will result in account suspension. Admins may review activity and payments to keep the platform safe.' },
  { title: '6. Changes', body: 'These terms may be updated as Camshop grows. Continued use of the app means you accept the latest version.' },
];

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={typography.display}>Terms & Conditions</Text>
        <Text style={[typography.bodyMuted, { marginBottom: spacing.lg }]}>Please read before continuing</Text>
        {SECTIONS.map((s) => (
          <View key={s.title} style={{ marginBottom: spacing.md }}>
            <Text style={typography.h2}>{s.title}</Text>
            <Text style={[typography.body, { marginTop: 4 }]}>{s.body}</Text>
          </View>
        ))}
        <Button title="Back to sign up" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
