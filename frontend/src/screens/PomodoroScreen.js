import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { colors, fonts, radii, spacing } from '../theme';

const DURATIONS_MS = {
  focus: 25 * 60 * 1000,
  break: 5 * 60 * 1000,
};

const MODE_LABELS = {
  focus: 'Focus',
  break: 'Break',
};

const MODE_ACCENTS = {
  focus: colors.navy,
  break: colors.sage,
};

const COMPLETE_MESSAGES = {
  focus: 'Focus session complete!',
  break: "Break's over!",
};

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function PomodoroScreen() {
  const [mode, setMode] = useState('focus');
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'complete'
  const [endTime, setEndTime] = useState(null); // Date.now() + remaining, only set while running
  const [remainingMs, setRemainingMs] = useState(DURATIONS_MS.focus); // authoritative when not running
  const [, forceTick] = useState(0); // bumped every second just to force a re-render while running

  // The countdown never accumulates a decrement — it's always recomputed from
  // endTime vs. the current clock, so pausing/backgrounding/resuming can't drift.
  useEffect(() => {
    if (status !== 'running') return undefined;

    const interval = setInterval(() => {
      if (endTime !== null && Date.now() >= endTime) {
        setRemainingMs(0);
        setStatus('complete');
      } else {
        forceTick((tick) => tick + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, endTime]);

  const displayMs = status === 'running' && endTime !== null ? Math.max(0, endTime - Date.now()) : remainingMs;

  function handleSelectMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setEndTime(null);
    setRemainingMs(DURATIONS_MS[nextMode]);
    setStatus('idle');
  }

  function handleStart() {
    setEndTime(Date.now() + remainingMs);
    setStatus('running');
  }

  function handlePause() {
    if (status !== 'running' || endTime === null) return;
    setRemainingMs(Math.max(0, endTime - Date.now()));
    setEndTime(null);
    setStatus('paused');
  }

  function handleReset() {
    setEndTime(null);
    setRemainingMs(DURATIONS_MS[mode]);
    setStatus('idle');
  }

  function handleStartNextPhase() {
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setRemainingMs(DURATIONS_MS[nextMode]);
    setEndTime(Date.now() + DURATIONS_MS[nextMode]);
    setStatus('running');
  }

  const accent = MODE_ACCENTS[mode];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro Timer</Text>

      <View style={styles.modeToggle}>
        <ThemedButton
          title="Focus"
          onPress={() => handleSelectMode('focus')}
          variant={mode === 'focus' ? 'primary' : 'secondary'}
          style={styles.modeButton}
        />
        <ThemedButton
          title="Break"
          onPress={() => handleSelectMode('break')}
          variant={mode === 'break' ? 'primary' : 'secondary'}
          style={styles.modeButton}
        />
      </View>

      {status === 'complete' ? (
        <View style={styles.completeCard}>
          <Text style={[styles.completeMessage, { color: accent }]}>{COMPLETE_MESSAGES[mode]}</Text>
          <Text style={styles.completeSubtext}>
            Ready for {MODE_LABELS[mode === 'focus' ? 'break' : 'focus']}?
          </Text>
          <ThemedButton
            title={`Start ${MODE_LABELS[mode === 'focus' ? 'break' : 'focus']}`}
            onPress={handleStartNextPhase}
            variant="accent"
          />
        </View>
      ) : (
        <>
          <Text style={[styles.modeLabel, { color: accent }]}>
            {MODE_LABELS[mode]} {status === 'paused' && '(Paused)'}
          </Text>

          <Text style={[styles.countdown, { color: accent }]}>{formatTime(displayMs)}</Text>

          <View style={styles.controls}>
            {status === 'running' ? (
              <ThemedButton title="Pause" onPress={handlePause} variant="secondary" style={styles.controlButton} />
            ) : (
              <ThemedButton title="Start" onPress={handleStart} variant="primary" style={styles.controlButton} />
            )}
            <ThemedButton title="Reset" onPress={handleReset} variant="danger" style={styles.controlButton} />
          </View>
        </>
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
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.navy,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: spacing.xxl,
  },
  modeButton: {
    marginHorizontal: spacing.xs,
  },
  modeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  countdown: {
    fontFamily: fonts.headingBold,
    fontSize: 72,
    marginBottom: spacing.xxl,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    marginHorizontal: spacing.sm,
    minWidth: 110,
  },
  completeCard: {
    alignItems: 'center',
    backgroundColor: colors.paperDim,
    borderRadius: radii.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  completeMessage: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completeSubtext: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
