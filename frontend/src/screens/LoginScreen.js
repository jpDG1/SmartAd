import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { extractError } from '../api/client';

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Podaj login/e-mail i hasło');
      return;
    }
    setLoading(true);
    try {
      await signIn(identifier.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs')}
            hitSlop={10}
            style={styles.back}
          >
            <Text style={styles.backText}>‹ Wstecz</Text>
          </Pressable>

          <View style={styles.brandWrap}>
            <Text style={styles.logo}>Bazarek</Text>
            <Text style={styles.tagline}>Witaj!</Text>
            <Text style={styles.subtitle}>Zaloguj się, aby kontynuować</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Login, e-mail lub telefon"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="np. jan@example.com"
            />
            <Input
              label="Hasło"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Zaloguj się" onPress={handleSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nie masz konta? </Text>
            <Pressable onPress={() => navigation.replace('Register')}>
              <Text style={styles.footerLink}>Zarejestruj się</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingTop: spacing.lg, flexGrow: 1 },
  back: { marginBottom: spacing.lg },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '500' },
  brandWrap: { alignItems: 'flex-start', marginBottom: spacing.xl },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  tagline: { ...typography.h1, marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 15 },
  form: { marginBottom: spacing.lg },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
