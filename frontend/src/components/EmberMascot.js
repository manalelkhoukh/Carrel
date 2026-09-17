import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { pickRandomMessage } from '../constants/emberMessages';
import { colors, fonts, radii, spacing } from '../theme';

// Ember's "body" is a single emoji inside a soft circular badge — not a
// custom-drawn shape. A hand-drawn flame built from overlapping rounded
// Views (v1 of this component) didn't actually read as fire once rendered
// on a real screen; it read as a face. Emoji are professionally illustrated
// and render consistently across devices, so reusing one (this app already
// uses emoji elsewhere, like the 🐞 debug marker) is the simpler and more
// reliable choice than fighting pixel-perfect geometry for a minor visual.
export default function EmberMascot({ phase }) {
  // Recomputed ONLY when `phase` changes, not on every render. SessionScreen
  // re-renders every second for the countdown; without this guard, Ember
  // would pick a new random line every single second instead of once per phase.
  const message = useMemo(() => pickRandomMessage(phase), [phase]);

  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    // Stop the loop when the component unmounts (e.g. navigating away from
    // the Session screen) so it doesn't keep animating in the background.
    return () => loop.stop();
  }, [bounce]);

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.badge, { transform: [{ translateY: bounce }] }]}>
        <Text style={styles.emoji}>🔥</Text>
      </Animated.View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{message}</Text>
      </View>
    </View>
  );
}

const BADGE_SIZE = 56;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: colors.paperDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.paperDim,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bubbleText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
});
