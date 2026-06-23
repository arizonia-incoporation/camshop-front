import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';

export default function InputField({
  label,
  icon,
  secure = false,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
}) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrap, focused && styles.wrapFocused, error && styles.wrapError]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure ? (
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={colors.textMuted}
            onPress={() => setHidden(!hidden)}
          />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.caption, marginBottom: 6, color: colors.textSecondary },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  wrapFocused: { borderColor: colors.teal },
  wrapError: { borderColor: colors.danger },
  input: { flex: 1, ...typography.body, paddingVertical: 0 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
