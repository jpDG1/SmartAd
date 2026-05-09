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

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!login.trim() || !email.trim() || !password) {
      setError('Uzupełnij login, e-mail i hasło');
      return;
    }
    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    if (password !== confirm) {
      setError('Hasła nie są zgodne');
      return;
    }
    setLoading(true);
    try {
      await signUp({
        login: login.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
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
            <Text style={styles.tagline}>Utwórz konto</Text>
            <Text style={styles.subtitle}>Zajmie to mniej niż minutę</Text>
          </View>

          <View>
            <Input
              label="Login"
              value={login}
              onChangeText={setLogin}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="jan_kowalski"
            />
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="jan@example.com"
            />
            <Input
              label="Telefon (opcjonalnie)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+48 123 456 789"
            />
            <Input
              label="Hasło"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="minimum 6 znaków"
            />
            <Input
              label="Powtórz hasło"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="powtórz hasło"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Utwórz konto" onPress={handleSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto? </Text>
            <Pressable onPress={() => navigation.replace('Login')}>
              <Text style={styles.footerLink}>Zaloguj się</Text>
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
  brandWrap: { marginBottom: spacing.xl },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  tagline: { ...typography.h1, marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 15 },
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

export default RegisterScreen;
