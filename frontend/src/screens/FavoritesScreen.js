import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';

import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';

const FavoritesScreen = ({ navigation }) => {
  const { favorites, reloadFavorites, isFavorite, toggleFavorite, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      await reloadFavorites();
      setLoading(false);
      setRefreshing(false);
    },
    [reloadFavorites]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load({ silent: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ulubione</Text>
        <Text style={styles.subtitle}>
          {favorites.length > 0
            ? `${favorites.length} zapisanych ogłoszeń`
            : 'Zapisuj interesujące ogłoszenia'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Na razie pusto"
          subtitle="Dotknij serduszka przy ogłoszeniu, aby dodać je do ulubionych."
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.getParent()?.navigate('PostDetail', { postId: item._id })}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite(item._id)}
              navigation={navigation}
              currentUser={user}
              onBought={reloadFavorites}
              onNavigateToChat={(params) =>
                navigation.dispatch(CommonActions.navigate({ name: 'Chat', params }))
              }
            />
          )}
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  title: { ...typography.h1 },
  subtitle: { ...typography.small, marginTop: 2 },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default FavoritesScreen;
