import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon = null,
  style,
  fullWidth = true,
}) => {
  const styleByVariant = {
    primary: { container: styles.primary, text: styles.primaryText },
    secondary: { container: styles.secondary, text: styles.secondaryText },
    ghost: { container: styles.ghost, text: styles.ghostText },
    danger: { container: styles.danger, text: styles.dangerText },
  }[variant] || { container: styles.primary, text: styles.primaryText };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styleByVariant.container,
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && { opacity: 0.85 },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.textBase, styleByVariant.text]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textBase: { fontSize: 16, fontWeight: '600' },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: '#fff' },
  secondary: { backgroundColor: colors.primarySoft },
  secondaryText: { color: colors.primaryDark },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: colors.primary },
  danger: { backgroundColor: colors.danger },
  dangerText: { color: '#fff' },
});

export default Button;
