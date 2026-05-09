import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';

import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { fetchMyPosts } from '../api/posts';
import { extractError } from '../api/client';
import { colors, spacing } from '../theme';

const MyPostsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchMyPosts();
      setPosts(data || []);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      <ScreenHeader title="Moje ogłoszenia" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Nie masz jeszcze ogłoszeń"
          subtitle="Utwórz pierwsze ogłoszenie i zacznij sprzedawać."
          actionLabel="Dodaj ogłoszenie"
          onAction={() => navigation.navigate('Tabs', { screen: 'Add' })}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
              navigation={navigation}
              currentUser={user}
              onBought={() => load({ silent: true })}
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
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.danger, textAlign: 'center' },
});

export default MyPostsScreen;
