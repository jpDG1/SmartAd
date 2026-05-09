import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';
import { formatDate, formatPrice } from '../utils/format';
import { resolveImageUrl } from '../config';
import { labelForCategory } from '../theme';
import { buyNowStubApi } from '../api/posts';
import { extractError } from '../api/client';

const PostCard = ({
  post,
  onPress,
  onToggleFavorite,
  isFavorite,
  navigation,
  currentUser,
  onBought,
  onNavigateToChat,
}) => {
  const [buyLoading, setBuyLoading] = useState(false);
  const sellerId = post.userId?._id ?? post.userId;
  const isOwner =
    Boolean(currentUser && sellerId != null && String(sellerId) === String(currentUser.id));
  const isSold = Boolean(post.sold);
  const cover = resolveImageUrl(post.images?.[0]);

  const handleBuyNow = async (e) => {
    e?.stopPropagation?.();
    if (isSold || isOwner) return;
    if (!navigation && !onNavigateToChat) return;

    if (!currentUser) {
      navigation?.navigate?.('Login');
      return;
    }

    setBuyLoading(true);
    try {
      const data = await buyNowStubApi(post._id);
      if (typeof onBought === 'function') onBought();

      const params = {
        postId: post._id,
        otherUserId: data.seller._id,
        otherUserName: data.seller.login,
        otherUserAvatar: data.seller.avatar,
        postTitle: post.title,
      };

      if (typeof onNavigateToChat === 'function') {
        onNavigateToChat(params);
      } else {
        navigation?.navigate?.('Chat', params);
      }
    } catch (err) {
      Alert.alert('Błąd', extractError(err));
    } finally {
      setBuyLoading(false);
    }
  };

  const buyRow =
    !isSold && !isOwner ? (
      <Pressable
        style={[styles.buyRow, buyLoading && { opacity: 0.65 }]}
        onPress={handleBuyNow}
        disabled={buyLoading}
      >
        <Text style={styles.buyText}>{buyLoading ? '...' : 'Kup Teraz'}</Text>
      </Pressable>
    ) : isSold ? (
      <View style={[styles.buyRow, styles.soldRow]}>
        <Text style={styles.soldText}>Sprzedane</Text>
      </View>
    ) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.imageWrapper}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Brak zdjęcia</Text>
          </View>
        )}
        {isSold ? (
          <View style={styles.soldRibbon}>
            <Text style={styles.soldRibbonText}>SPRZEDANE</Text>
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleFavorite(post);
            }}
            style={styles.favBtn}
          >
            <Text style={[styles.favIcon, isFavorite && { color: colors.danger }]}>
              {isFavorite ? '\u2665' : '\u2661'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.price}>{formatPrice(post.price)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {post.location}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{formatDate(post.createdAt)}</Text>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{labelForCategory(post.category)}</Text>
          </View>
        </View>
        {buyRow}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.card,
  },
  imageWrapper: {
    position: 'relative',
    height: 170,
    backgroundColor: colors.background,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.textLight, fontSize: 14 },
  soldRibbon: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  soldRibbonText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: { fontSize: 20, color: colors.text },
  body: { padding: spacing.md },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 12, color: colors.textMuted, flexShrink: 1 },
  metaDot: { color: colors.textLight, marginHorizontal: 4 },
  tagRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { fontSize: 11, color: colors.text, fontWeight: '600' },
  buyRow: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.surface,
  },
  soldRow: {
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  buyText: { fontSize: 13, fontWeight: '700', color: colors.text },
  soldText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
});

export default PostCard;
