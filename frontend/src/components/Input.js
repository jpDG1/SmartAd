import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

const Input = ({
  label,
  error,
  multiline = false,
  style,
  inputStyle,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.fieldWrapper,
          focused && styles.fieldFocused,
          error && styles.fieldError,
          multiline && { minHeight: 100 },
        ]}
      >
        <TextInput
          {...rest}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textLight}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top', minHeight: 90 },
            inputStyle,
          ]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldWrapper: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    minHeight: 50,
    justifyContent: 'center',
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
