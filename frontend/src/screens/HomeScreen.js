import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import Chip from '../components/Chip';
import Button from '../components/Button';
import SearchGlyph from '../components/SearchGlyph';
import { useAuth } from '../context/AuthContext';
import { fetchPosts } from '../api/posts';
import { CATEGORIES, colors, radius, spacing, typography } from '../theme';
import { extractError } from '../api/client';

const HomeScreen = ({ navigation }) => {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [location, setLocation] = useState('');

  const params = useMemo(() => {
    const p = {};
    if (search.trim()) p.search = search.trim();
    if (activeCategory) p.category = activeCategory;
    if (location.trim()) p.location = location.trim();
    p.limit = 30;
    return p;
  }, [search, activeCategory, location]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        const data = await fetchPosts(params);
        setPosts(data.posts || []);
      } catch (e) {
        setError(extractError(e));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [params]
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load({ silent: true });
  };

  const handleToggleFav = async (post) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await toggleFavorite(post);
    } catch (e) {
      // ignore
    }
  };

  const renderItem = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
      onToggleFavorite={handleToggleFav}
      isFavorite={user ? isFavorite(item._id) : false}
      navigation={navigation}
      currentUser={user}
      onBought={() => load({ silent: true })}
      onNavigateToChat={(params) =>
        navigation.dispatch(CommonActions.navigate({ name: 'Chat', params }))
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>Bazarek</Text>
          <Text style={styles.subtitle}>Lokalne ogłoszenia blisko Ciebie</Text>
        </View>
        {!user ? (
          <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Zaloguj</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.searchBar}>
        <SearchGlyph color={colors.textMuted} size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Szukaj ogłoszeń..."
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.locationRow}>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Miasto (np. Tarnów)"
          placeholderTextColor={colors.textLight}
          style={styles.locationInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <Chip
          label="Wszystkie"
          active={!activeCategory}
          onPress={() => setActiveCategory(null)}
        />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            active={activeCategory === cat.id}
            onPress={() => setActiveCategory(cat.id)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={{ marginTop: spacing.lg, alignSelf: 'stretch', paddingHorizontal: spacing.xl }}>
            <Button title="Spróbuj ponownie" onPress={() => load()} />
          </View>
        </View>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Brak ogłoszeń"
          subtitle="Spróbuj zmienić filtry lub wyszukiwanie."
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: { ...typography.small, marginTop: 2 },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  clearIcon: { color: colors.textMuted, fontSize: 16, paddingHorizontal: 4 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  locationRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  locationInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 44,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipsRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.danger, textAlign: 'center' },
});

export default HomeScreen;
