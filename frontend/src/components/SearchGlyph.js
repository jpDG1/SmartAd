import React from 'react';
import { View } from 'react-native';

const SearchGlyph = ({ color, size = 16 }) => {
  const lens = Math.round(size * 0.5);
  const stroke = Math.max(2, Math.round(size * 0.12));
  const handle = Math.round(size * 0.35);
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'flex-start' }}>
      <View
        style={{
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          borderWidth: stroke,
          borderColor: color,
          marginLeft: stroke,
          marginTop: stroke,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: handle,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          left: lens / 2 + stroke * 0.75,
          top: lens / 2 + stroke * 0.65,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
};

export default SearchGlyph;
