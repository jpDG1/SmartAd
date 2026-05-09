import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import { fetchMessages, sendMessageApi } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';
import { extractError } from '../api/client';
import { formatTime } from '../utils/format';

const ChatScreen = ({ route, navigation }) => {
  const { postId, otherUserId, otherUserName, postTitle, otherUserAvatar } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMessages(postId, otherUserId);
      setMessages(data || []);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  }, [postId, otherUserId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const msg = await sendMessageApi({ receiverId: otherUserId, postId, content });
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch (e) {
      setError(extractError(e));
    } finally {
      setSending(false);
    }
  };

  const goProfile = () => {
    navigation.navigate('UserPublic', { userId: otherUserId });
  };

  const renderItem = ({ item }) => {
    if (item.isPlatform) {
      return (
        <View style={styles.platformRow}>
          <View style={styles.platformCard}>
            <Text style={styles.platformLabel}>Bazarek</Text>
            <Text style={styles.platformText}>{item.content}</Text>
            <Text style={styles.platformTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      );
    }

    const senderId = item.senderId?._id || item.senderId;
    const isMine = String(senderId) === String(user?.id);
    return (
      <View style={[styles.bubbleRow, isMine ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && { color: '#fff' }]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, isMine && { color: 'rgba(255,255,255,0.75)' }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        center={
          <Pressable onPress={goProfile} style={styles.headerCenter}>
            <Avatar name={otherUserName || '?'} uri={otherUserAvatar} size={36} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {otherUserName || 'Czat'}
            </Text>
          </Pressable>
        }
      />
      {postTitle ? (
        <Pressable
          onPress={() => navigation.navigate('PostDetail', { postId })}
          style={styles.postBanner}
        >
          <Text style={styles.postBannerLabel}>Ogłoszenie</Text>
          <Text style={styles.postBannerTitle} numberOfLines={1}>
            {postTitle}
          </Text>
        </Pressable>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        ) : messages.length === 0 ? (
          <EmptyState
            title="Rozpocznij rozmowę"
            subtitle="Wyślij pierwszą wiadomość, aby omówić ogłoszenie."
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Wiadomość..."
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !text.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              (!text.trim() || sending) && { opacity: 0.5 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.sendBtnText}>{sending ? '...' : '\u2192'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '100%',
    paddingHorizontal: 4,
  },
  headerTitle: {
    flexShrink: 1,
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
  },
  postBanner: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postBannerLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  postBannerTitle: { fontSize: 13, color: colors.text, marginTop: 2 },
  list: { padding: spacing.md, paddingBottom: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubbleRow: { marginVertical: 4, flexDirection: 'row' },
  platformRow: {
    marginVertical: spacing.sm,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  platformCard: {
    maxWidth: '92%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  platformText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  platformTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 20 },
  bubbleTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  error: {
    color: colors.danger,
    fontSize: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
});

export default ChatScreen;
