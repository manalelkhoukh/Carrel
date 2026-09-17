import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import EmberMascot from '../components/EmberMascot';
import ThemedButton from '../components/ThemedButton';
import { colors, fonts, radii, spacing } from '../theme';
import { triggerSessionEndVibration } from '../utils/sessionAlarm';

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function SessionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { seatLabel, startTime, endTime } = route.params ?? {};

  const startMs = startTime ? new Date(startTime).getTime() : null;
  const endMs = endTime ? new Date(endTime).getTime() : null;

  // Same pattern as PomodoroScreen: nothing is decremented over time — every
  // tick just re-renders, and the phase/remaining time is recomputed fresh
  // from Date.now() vs. the fixed start/end timestamps.
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const now = Date.now();
  const phase = !startMs || !endMs ? null : now < startMs ? 'before' : now < endMs ? 'during' : 'after';

  // Fires the moment `phase` first becomes 'after'. This effect's
  // dependency array is [phase], and React only re-runs an effect when a
  // dependency's VALUE actually changes between renders — not on every
  // re-render. Since `phase` stays the exact same string 'after' on every
  // subsequent tick (the countdown reaching 0 doesn't change the phase
  // again), this naturally fires exactly once per session, with no manual
  // "already fired" guard needed.
  useEffect(() => {
    if (phase === 'after') {
      triggerSessionEndVibration();
    }
  }, [phase]);

  if (!startMs || !endMs) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No session details available.</Text>
        <ThemedButton title="Return Home" onPress={() => navigation.navigate('Home')} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.seatLabel}>Seat {seatLabel}</Text>

      <EmberMascot phase={phase} />

      {phase === 'before' && (
        <>
          <Text style={styles.statusLabel}>Your session starts in</Text>
          <Text style={[styles.countdown, { color: colors.navy }]}>{formatDuration(startMs - now)}</Text>
        </>
      )}

      {phase === 'during' && (
        <>
          <Text style={styles.statusLabel}>Time remaining</Text>
          <Text style={[styles.countdown, { color: colors.sage }]}>{formatDuration(endMs - now)}</Text>
        </>
      )}

      {phase === 'after' && (
        <View style={styles.endedCard}>
          <Text style={styles.endedMessage}>Your session has ended</Text>
          <ThemedButton title="Return Home" onPress={() => navigation.navigate('Home')} variant="primary" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.xl,
  },
  seatLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.navy,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  statusLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  countdown: {
    fontFamily: fonts.headingBold,
    fontSize: 64,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  endedCard: {
    alignItems: 'center',
    backgroundColor: colors.paperDim,
    borderRadius: radii.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  endedMessage: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.navy,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
