import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import { fetchConversations } from '../api/messages';
import { extractError } from '../api/client';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

const ChatsListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchConversations();
      setItems(data || []);
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

  const renderItem = ({ item }) => {
    const me = String(user?.id);
    const lastMsg = item.lastMessage;
    const post = item.post;
    const other = item.otherUser || {};
    const otherUserId = String(item.otherUserId || other._id);
    const isMine = String(lastMsg.senderId) === me;
    const isPlatform = Boolean(lastMsg.isPlatform);
    const otherName = other.login || 'Użytkownik';

    return (
      <Pressable
        onPress={() =>
          navigation.getParent()?.navigate('Chat', {
            postId: post._id,
            otherUserId,
            otherUserName: otherName,
            otherUserAvatar: other.avatar,
            postTitle: post.title,
          })
        }
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}
      >
        <Avatar name={otherName} uri={other.avatar} size={48} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {otherName}
            </Text>
            <Text style={styles.time}>{formatDate(lastMsg.createdAt)}</Text>
          </View>
          <Text style={styles.postTitle} numberOfLines={1}>
            {post.title}
          </Text>
          <View style={styles.previewRow}>
            <Text style={styles.preview} numberOfLines={1}>
              {!isPlatform && isMine ? 'Ty: ' : null}
              {isPlatform ? 'Bazarek · ' : null}
              {lastMsg.content}
            </Text>
            {item.unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Wiadomości</Text>
        <Text style={styles.sub}>Twoje rozmowy ze sprzedawcami i kupującymi</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="Brak wiadomości"
          subtitle="Rozpocznij rozmowę ze sprzedawcą ze strony ogłoszenia."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item._id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  heading: { ...typography.h1 },
  sub: { ...typography.small, marginTop: 2 },
  list: { padding: spacing.md, backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: '600', color: colors.text, fontSize: 15, flex: 1, marginRight: 8 },
  time: { color: colors.textLight, fontSize: 11 },
  postTitle: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontWeight: '500' },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  preview: { color: colors.textMuted, fontSize: 13, flex: 1 },
  badge: {
    backgroundColor: colors.text,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.danger, textAlign: 'center' },
});

export default ChatsListScreen;
