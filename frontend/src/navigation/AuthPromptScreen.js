import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme';

const LockGlyph = ({ color = colors.text }) => (
  <View style={glyphStyles.outer}>
    <View style={[glyphStyles.arc, { borderColor: color }]} />
    <View style={[glyphStyles.body, { borderColor: color }]} />
  </View>
);

const glyphStyles = StyleSheet.create({
  outer: { alignItems: 'center', marginBottom: spacing.lg },
  arc: {
    width: 22,
    height: 12,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  body: {
    width: 26,
    height: 22,
    borderWidth: 3,
    marginTop: -3,
    borderRadius: 4,
  },
});

const AuthPromptScreen = ({ navigation, route }) => {
  const message =
    route?.params?.message ??
    'Aby skorzystać z tej sekcji, zaloguj się na konto.';
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <LockGlyph />
        <Text style={styles.title}>Wymagane logowanie</Text>
        <Text style={styles.subtitle}>{message}</Text>
        <View style={{ alignSelf: 'stretch', marginTop: spacing.xl, gap: spacing.sm }}>
          <Button title="Zaloguj się" onPress={() => navigation.navigate('Login')} />
          <Button
            variant="secondary"
            title="Utwórz konto"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
});

export default AuthPromptScreen;
