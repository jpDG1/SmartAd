import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { resolveImageUrl } from '../config';

const Avatar = ({ name = '', uri, size = 40 }) => {
  const resolved = resolveImageUrl(uri);
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {resolved ? (
        <Image
          key={resolved}
          source={{ uri: resolved }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: { color: colors.primaryDark, fontWeight: '700' },
});

export default Avatar;
