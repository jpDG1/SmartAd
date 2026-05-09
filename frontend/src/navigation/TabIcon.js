import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const Dot = ({ color }) => <View style={[styles.dot, { backgroundColor: color }]} />;

const ChatDots = ({ color }) => (
  <View style={styles.dotRow}>
    <Dot color={color} />
    <Dot color={color} />
    <Dot color={color} />
  </View>
);

const ProfileOutline = ({ color }) => (
  <View style={[styles.person, { borderColor: color }]}>
    <View style={[styles.personHead, { backgroundColor: color }]} />
  </View>
);

const TabIcon = ({ name, color, focused }) => {
  if (name === 'add') {
    return (
      <View style={[styles.addWrapper, { borderColor: colors.border }]}>
        <Text style={styles.addIcon}>+</Text>
      </View>
    );
  }
  if (name === 'chat') {
    return <ChatDots color={color} />;
  }
  if (name === 'profile') {
    return <ProfileOutline color={color} />;
  }
  if (name === 'favorites') {
    return (
      <Text style={[styles.iconText, { color }, focused && { fontWeight: '700' }]}>
        {'\u2661'}
      </Text>
    );
  }

  const map = {
    home: '\u2302',
  };

  const icon = map[name] || '\u2219';

  return (
    <Text style={[styles.iconText, { color }, focused && { fontWeight: '700' }]}>
      {icon}
    </Text>
  );
};

const styles = StyleSheet.create({
  iconText: { fontSize: 22, lineHeight: 26 },
  addWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  addIcon: { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 30 },
  dotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  person: {
    width: 18,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
    overflow: 'hidden',
  },
  personHead: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});

export default TabIcon;
