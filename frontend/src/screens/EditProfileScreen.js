import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import Button from '../components/Button';
import Input from '../components/Input';
import ScreenHeader from '../components/ScreenHeader';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { extractError } from '../api/client';
import { prepareAvatarForUpload } from '../utils/prepareAvatarForUpload';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [login, setLogin] = useState(user?.login || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreviewUri, setAvatarPreviewUri] = useState(null);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dostęp do zdjęć', 'Włącz uprawnienia w ustawieniach urządzenia.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing na wielu urządzeniach Android pokazuje ekran crop bez przycisku „Gotowe”.
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 0.92,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const file = await prepareAvatarForUpload(asset);
    setAvatarPreviewUri(file.uri);

    setAvatarBusy(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
      await uploadAvatar(formData);
      Alert.alert('Zapisano', 'Zdjęcie profilowe zostało zmienione.');
    } catch (e) {
      setError(extractError(e));
    } finally {
      setAvatarPreviewUri(null);
      setAvatarBusy(false);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!login.trim() || !email.trim()) {
      setError('Login i e-mail są wymagane');
      return;
    }
    if (password && password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    if (password && password !== confirm) {
      setError('Hasła nie są zgodne');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        login: login.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      if (password) payload.password = password;
      await updateProfile(payload);
      Alert.alert('Zapisano', 'Profil został zaktualizowany', [
        { text: 'Gotowe', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Edycja profilu" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>Zdjęcie profilowe</Text>
          <Pressable style={styles.avatarRow} onPress={handlePickAvatar} disabled={avatarBusy}>
            <Avatar name={login || user?.login} uri={avatarPreviewUri ?? user?.avatar} size={72} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.avatarHint}>
                {avatarBusy ? 'Wysyłanie…' : 'Dotknij, aby wybrać zdjęcie z galerii'}
              </Text>
            </View>
          </Pressable>

          <Text style={[styles.section, { marginTop: spacing.lg }]}>Dane podstawowe</Text>
          <Input label="Login" value={login} onChangeText={setLogin} autoCapitalize="none" />
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={[styles.section, { marginTop: spacing.lg }]}>Zmiana hasła</Text>
          <Input
            label="Nowe hasło"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="zostaw puste, aby nie zmieniać"
          />
          {password ? (
            <Input
              label="Powtórz nowe hasło"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: spacing.lg }}>
            <Button title="Zapisz" onPress={handleSave} loading={submitting} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarHint: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.sm },
});

export default EditProfileScreen;
