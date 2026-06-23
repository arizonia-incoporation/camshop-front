import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';

export default function OrderConfirmedScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark" size={48} color={colors.navy} />
      </View>
      <Text style={typography.display}>Order placed!</Text>
      <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xs }]}>
        The seller has been notified and will start preparing your order. A delivery partner will message you to arrange handoff — pay them in cash or Mobile Money when your order arrives.
      </Text>
      <Button title="Back to shopping" style={{ marginTop: spacing.xl, width: 220 }} onPress={() => navigation.navigate('BuyerHome')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
});
