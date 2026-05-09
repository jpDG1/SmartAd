import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import Button from '../components/Button';
import MenuGlyph from '../components/MenuGlyph';
import StarRatingDisplay from '../components/StarRatingDisplay';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

const Row = ({ glyph, title, subtitle, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
  >
    <View style={styles.rowIcon}>{glyph}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const ProfileScreen = ({ navigation }) => {
  const { user, signOut, favorites } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Wylogować się?', '', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyloguj',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Avatar name={user.login} uri={user.avatar} size={80} />
          <Text style={styles.name}>{user.login}</Text>
          <View style={styles.ratingWrap}>
            <StarRatingDisplay average={user.ratingAverage} count={user.ratingCount} />
          </View>
          <Text style={styles.email}>{user.email}</Text>
          {user.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>w ulubionych</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Row
            glyph={<MenuGlyph type="list" />}
            title="Moje ogłoszenia"
            subtitle="Zarządzaj swoimi ogłoszeniami"
            onPress={() => navigation.getParent()?.navigate('MyPosts')}
          />
          <Row
            glyph={<MenuGlyph type="favorites" />}
            title="Ulubione"
            subtitle={`${favorites.length} ogłoszeń`}
            onPress={() => navigation.navigate('Favorites')}
          />
          <Row
            glyph={<MenuGlyph type="chat" />}
            title="Wiadomości"
            onPress={() => navigation.navigate('Chats')}
          />
        </View>

        <View style={styles.section}>
          <Row
            glyph={<MenuGlyph type="edit" />}
            title="Edycja profilu"
            subtitle="Login, e-mail, telefon, hasło i zdjęcie"
            onPress={() => navigation.getParent()?.navigate('EditProfile')}
          />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Button title="Wyloguj się" variant="danger" onPress={confirmLogout} />
        </View>

        <Text style={styles.version}>Bazarek v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { ...typography.h2, marginTop: spacing.md },
  ratingWrap: { marginTop: spacing.sm, marginBottom: spacing.sm, alignItems: 'center' },
  email: { color: colors.textMuted, fontSize: 14, marginTop: 8 },
  phone: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textLight },
  version: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
