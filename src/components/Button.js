import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, radius, typography, spacing } from '../theme/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost
  loading = false,
  disabled = false,
  icon = null,
  style,
  fullWidth = true,
  subtitle = null
}) {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: { backgroundColor: colors.lime },
    secondary: { backgroundColor: colors.navy },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.navy },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColor = { 
    primary: colors.white,
    secondary: colors.white,
    outline: colors.navy,
    ghost: colors.teal,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && { opacity: 0.5 },
        {...style},
      ]}
    >
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator color={textColor[variant]} />
          <Text style={[typography.button, { color: textColor[variant] }, icon && { marginLeft: spacing.sm }]}>
            {subtitle}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[typography.button, { color: textColor[variant] }, icon && { marginLeft: spacing.sm }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
