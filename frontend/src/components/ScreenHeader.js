import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

const ScreenHeader = ({ title, onBack, right = null, center = null }) => {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable hitSlop={10} onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      {center ? (
        <View style={styles.centerSlot}>{center}</View>
      ) : (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: { width: 60, justifyContent: 'center' },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: colors.text, lineHeight: 28 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  centerSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default ScreenHeader;
