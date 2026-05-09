import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import Button from '../components/Button';
import Avatar from '../components/Avatar';
import StarRatingDisplay from '../components/StarRatingDisplay';
import ScreenHeader from '../components/ScreenHeader';
import { resolveImageUrl } from '../config';
import { colors, radius, spacing, typography, labelForCategory, labelForCondition } from '../theme';
import { fetchPostById, fetchComments, addCommentApi, deletePostApi, buyNowStubApi } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api/client';
import { formatDate, formatPrice } from '../utils/format';

const { width } = Dimensions.get('window');

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user, isFavorite, toggleFavorite } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);

  const isOwner =
    user &&
    post &&
    String(post.userId?._id ?? post.userId) === String(user.id);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, c] = await Promise.all([fetchPostById(postId), fetchComments(postId)]);
      setPost(p);
      setComments(c || []);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddComment = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const newComment = await addCommentApi(postId, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (e) {
      Alert.alert('Błąd', extractError(e));
    } finally {
      setPosting(false);
    }
  };

  const handleMessage = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!post.userId) return;
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Chat',
        params: {
          postId: post._id,
          otherUserId: post.userId._id,
          otherUserName: post.userId.login,
          otherUserAvatar: post.userId.avatar,
          postTitle: post.title,
        },
      })
    );
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!post || isOwner || post.sold) return;
    setBuyBusy(true);
    try {
      const data = await buyNowStubApi(postId);
      setPost(data.post);
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Chat',
          params: {
            postId: post._id,
            otherUserId: data.seller._id,
            otherUserName: data.seller.login,
            otherUserAvatar: data.seller.avatar,
            postTitle: post.title,
          },
        })
      );
    } catch (e) {
      Alert.alert('Błąd', extractError(e));
    } finally {
      setBuyBusy(false);
    }
  };

  const openSellerProfile = () => {
    if (!post?.userId?._id) return;
    navigation.navigate('UserPublic', { userId: post.userId._id });
  };

  const handleFavorite = async () => {
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

  const handleDelete = () => {
    Alert.alert('Usunąć ogłoszenie?', 'Tego działania nie można cofnąć.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePostApi(postId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Błąd', extractError(e));
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('EditPost', { post });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Ogłoszenie" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Ogłoszenie" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Nie znaleziono ogłoszenia'}</Text>
          <View style={{ marginTop: spacing.lg, alignSelf: 'stretch', paddingHorizontal: spacing.xl }}>
            <Button title="Wstecz" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Ogłoszenie"
        onBack={() => navigation.goBack()}
        right={
          user ? (
            <Pressable onPress={handleFavorite} hitSlop={10}>
              <Text style={[styles.favIcon, isFavorite(post._id) && { color: colors.danger }]}>
                {isFavorite(post._id) ? '\u2665' : '\u2661'}
              </Text>
            </Pressable>
          ) : null
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {post.images && post.images.length > 0 ? (
            <FlatList
              horizontal
              pagingEnabled
              data={post.images}
              keyExtractor={(item, idx) => `${idx}-${item}`}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: resolveImageUrl(item) }}
                  style={styles.gallery}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <View style={[styles.gallery, styles.noImage]}>
              <Text style={{ color: colors.textLight }}>Brak zdjęcia</Text>
            </View>
          )}

          <View style={styles.body}>
            <Text style={styles.price}>{formatPrice(post.price)}</Text>
            <Text style={styles.title}>{post.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>{post.location}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.meta}>{formatDate(post.createdAt)}</Text>
            </View>

            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{labelForCategory(post.category)}</Text>
              </View>
              <View style={[styles.tag, styles.tagAlt]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>
                  {labelForCondition(post.condition)}
                </Text>
              </View>
            </View>

            {post.sold ? (
              <View style={styles.soldBanner}>
                <Text style={styles.soldBannerText}>Sprzedane — ogłoszenie zostało przez kogoś zakupione (Kup Teraz).</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opis</Text>
              <Text style={styles.description}>{post.description}</Text>
            </View>

            {post.userId ? (
              <Pressable onPress={openSellerProfile} style={styles.sellerCard}>
                <Avatar name={post.userId.login} uri={post.userId.avatar} size={48} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.sellerName}>{post.userId.login}</Text>
                  <Text style={styles.sellerSub}>Sprzedawca</Text>
                  <StarRatingDisplay
                    average={post.userId.ratingAverage}
                    count={post.userId.ratingCount}
                  />
                </View>
                <Text style={styles.profileChevron}>›</Text>
              </Pressable>
            ) : null}

            {!isOwner ? (
              <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
                {!post.sold ? (
                  <Button title="Kup Teraz" onPress={handleBuyNow} loading={buyBusy} />
                ) : null}
                <Button title="Napisz do sprzedawcy" variant="secondary" onPress={handleMessage} />
              </View>
            ) : (
              <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
                <Button title="Edytuj" variant="secondary" onPress={handleEdit} />
                <Button title="Usuń ogłoszenie" variant="danger" onPress={handleDelete} />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Komentarze ({comments.length})</Text>
              {user ? (
                <View style={styles.commentInputRow}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Napisz komentarz..."
                    placeholderTextColor={colors.textLight}
                    style={styles.commentInput}
                    multiline
                  />
                  <Pressable
                    onPress={handleAddComment}
                    disabled={posting || !commentText.trim()}
                    style={({ pressed }) => [
                      styles.sendBtn,
                      (!commentText.trim() || posting) && { opacity: 0.5 },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.sendBtnText}>Wyślij</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginPrompt}>
                  <Text style={styles.loginPromptText}>Zaloguj się, aby dodać komentarz</Text>
                </Pressable>
              )}

              {comments.length === 0 ? (
                <Text style={styles.emptyComments}>Brak komentarzy</Text>
              ) : (
                comments.map((c) => (
                  <View key={c._id} style={styles.commentItem}>
                    <Avatar name={c.userId?.login} uri={c.userId?.avatar} size={36} />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{c.userId?.login || 'Użytkownik'}</Text>
                        <Text style={styles.commentTime}>{formatDate(c.createdAt)}</Text>
                      </View>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.danger, textAlign: 'center' },
  scroll: { paddingBottom: spacing.xxl },
  gallery: { width, height: 280, backgroundColor: colors.background },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg },
  price: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
  title: { ...typography.h2, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: spacing.md },
  meta: { fontSize: 13, color: colors.textMuted },
  metaDot: { color: colors.textLight, marginHorizontal: 6 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagAlt: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  soldBanner: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  soldBannerText: { fontSize: 14, color: colors.textMuted, lineHeight: 20, fontWeight: '600' },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  description: { fontSize: 15, color: colors.text, lineHeight: 22 },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  sellerName: { fontSize: 15, fontWeight: '600', color: colors.text },
  sellerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 4 },
  profileChevron: { fontSize: 22, color: colors.textLight, paddingLeft: 4 },
  favIcon: { fontSize: 24, color: colors.text },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: spacing.md,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  sendBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  loginPrompt: {
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginPromptText: { color: colors.text, fontWeight: '500' },
  emptyComments: {
    color: colors.textLight,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAuthor: { fontWeight: '600', color: colors.text, fontSize: 14 },
  commentTime: { fontSize: 11, color: colors.textLight },
  commentText: { color: colors.text, fontSize: 14, marginTop: 2, lineHeight: 20 },
});

export default PostDetailScreen;
