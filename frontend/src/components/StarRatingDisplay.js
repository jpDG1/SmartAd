import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const StarRatingDisplay = ({ average, count }) => {
  const hasVotes =
    typeof count === 'number' && count > 0 && average != null && !Number.isNaN(Number(average));
  const v = hasVotes ? Math.min(5, Math.max(0, Number(average))) : 0;
  const rounded = Math.round(v);

  const ocenWord = (n) => {
    if (!Number.isFinite(n) || n < 1) return 'ocen';
    if (n === 1) return 'ocena';
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'oceny';
    return 'ocen';
  };

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[styles.glyph, i <= rounded ? styles.full : styles.dim]}>
            {'\u2605'}
          </Text>
        ))}
      </View>
      {hasVotes ? (
        <Text style={styles.caption}>
          {v.toFixed(1)} · {count} {ocenWord(count)}
        </Text>
      ) : (
        <Text style={styles.captionMuted}>Brak ocen</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  glyph: { fontSize: 17, lineHeight: 20 },
  full: { color: colors.text },
  dim: { color: colors.border },
  caption: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  captionMuted: { fontSize: 13, color: colors.textMuted },
});

export default StarRatingDisplay;
