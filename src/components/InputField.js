import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Controller } from 'react-hook-form';

export default function InputField({
  label,
  icon,
  name,
  control,
  secure,
  ...props
}) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View style={{ marginBottom: spacing.md }}>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          <View style={[styles.wrap, focused && styles.wrapFocused]}>
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color={colors.textMuted}
                style={{ marginRight: spacing.sm }}
              />
            )}

            <TextInput
              value={value}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              {...props}
              secureTextEntry={hidden}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            {secure && (
              <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.textMuted}
              onPress={() => setHidden(!hidden)}
              />
            )}
          </View>
          <Text style={styles.errorText}>{error?.message}</Text>
        </View>
      )}
    />
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
