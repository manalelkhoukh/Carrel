import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii, spacing } from '../theme';

export default function ThemedButton({ title, onPress, disabled, variant = 'primary', style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, textVariantStyles[variant], disabled && styles.textDisabled]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  textDisabled: {
    color: colors.ink,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.navy,
  },
  secondary: {
    backgroundColor: colors.paperDim,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  accent: {
    backgroundColor: colors.mustard,
  },
  danger: {
    backgroundColor: colors.dustyrose,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: colors.paper,
  },
  secondary: {
    color: colors.ink,
  },
  accent: {
    color: colors.navy,
  },
  danger: {
    color: colors.paper,
  },
});
