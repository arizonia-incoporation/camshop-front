import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export default function WelcomeScreen() {
  const navigation = useRouter();
  const { isAuthenticated, authing } = useAuth();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        {/* <Logo size={84} /> */}
        <Logo size={84} />
        <Text style={styles.brand}>CamShop</Text>
        <Text style={styles.tagline}>
          Everything Busitema needs, one app away.
        </Text>
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800",
        }}
        style={styles.image}
      />

      {authing ? (
        <Text style={typography.bodyMuted}>Checking authentication...</Text>
      ) : isAuthenticated ? (
        <View style={styles.actions}>
          <Button
            title="Start Shopping"
            variant="secondary"
            onPress={()=>navigation.push("/home")}
            
          />
        </View>
      ) : (
        <View style={styles.actions}>
          <Button
            title="Create an account"
            variant="secondary"
            onPress={() => navigation.push("Signup")}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            title="I already have an account"
            variant="outline"
            onPress={() => navigation.push("Login")}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: spacing.xl },
  brand: { ...typography.display, marginTop: spacing.sm },
  tagline: { ...typography.bodyMuted, marginTop: spacing.xs, textAlign: 'center' },
  image: { width: '100%', height: 220, borderRadius: 24, marginVertical: spacing.lg },
  actions: { marginBottom: spacing.xl },
});
