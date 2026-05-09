import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import ScreenHeader from '../components/ScreenHeader';
import StarRatingDisplay from '../components/StarRatingDisplay';
import { fetchUserPublic } from '../api/users';
import { extractError } from '../api/client';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

const UserPublicProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUserPublic(userId);
      setProfile(data);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const isMe = me && profile && String(me.id) === String(profile.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Profil"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : error || !profile ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error || 'Nie znaleziono użytkownika'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.panel}>
            <Avatar name={profile.login} uri={profile.avatar} size={88} />
            <Text style={styles.name}>{profile.login}</Text>
            <StarRatingDisplay average={profile.ratingAverage} count={profile.ratingCount} />
            {isMe ? (
              <Text style={styles.note}>To Twój publiczny profil.</Text>
            ) : (
              <Text style={styles.note}>
                Aby napisać do użytkownika, przejdź do ogłoszenia lub do listy wiadomości.
              </Text>
            )}
          </View>
          <Text style={styles.footer}>Bazarek — profil użytkownika</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  error: { color: colors.danger, textAlign: 'center' },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  name: { ...typography.h2, marginTop: spacing.md },
  note: {
    ...typography.small,
    marginTop: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    ...typography.tiny,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default UserPublicProfileScreen;
