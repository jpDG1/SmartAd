import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const Line = ({ color, w = 16 }) => (
  <View style={[styles.line, { backgroundColor: color, width: w }]} />
);

const MenuGlyph = ({ type, color = colors.text }) => {
  if (type === 'list') {
    return (
      <View style={styles.box}>
        <Line color={color} />
        <Line color={color} />
        <Line color={color} />
      </View>
    );
  }
  if (type === 'favorites') {
    return (
      <View style={styles.boxCenter}>
        <View style={[styles.favOutline, { borderColor: color }]} />
      </View>
    );
  }
  if (type === 'chat') {
    return (
      <View style={styles.boxCenter}>
        <View style={[styles.bubble, { borderColor: color }]}>
          <Line color={color} w={10} />
          <Line color={color} w={12} />
        </View>
      </View>
    );
  }
  if (type === 'edit') {
    return (
      <View style={styles.boxCenter}>
        <View style={[styles.pen, { borderColor: color }]} />
      </View>
    );
  }
  return <View style={styles.box} />;
};

const styles = StyleSheet.create({
  box: { width: 22, height: 22, justifyContent: 'center', gap: 3, paddingVertical: 2 },
  boxCenter: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  line: { height: 2, borderRadius: 1 },
  bubble: {
    width: 16,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 3,
    paddingHorizontal: 2,
    paddingVertical: 2,
    gap: 2,
    justifyContent: 'center',
  },
  pen: {
    width: 3,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 1,
    transform: [{ rotate: '35deg' }],
  },
  favOutline: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderRadius: 3,
  },
});

export default MenuGlyph;
