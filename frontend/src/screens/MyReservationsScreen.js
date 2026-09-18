import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import ThemedButton from '../components/ThemedButton';
import { API_BASE_URL } from '../config/api';
import { colors, fonts, radii, spacing } from '../theme';

function formatRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dayLabel = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const startLabel = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const endLabel = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${dayLabel}, ${startLabel} – ${endLabel}`;
}

const STATUS_LABELS = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export default function MyReservationsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const isMountedRef = useRef(true);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reservations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setReservations(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [navigation]);

  // useFocusEffect (not a plain useEffect) so this refetches every time you
  // navigate back to this screen — e.g. after cancelling and returning, or
  // after booking a new one elsewhere in the app.
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      fetchReservations();
      return () => {
        isMountedRef.current = false;
      };
    }, [fetchReservations])
  );

  async function handleCancel(reservation) {
    setCancellingId(reservation.id);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE_URL}/api/reservations/${reservation.id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchReservations();
        return;
      }

      const data = await response.json().catch(() => ({}));
      Alert.alert('Could not cancel', data.error || `Request failed with status ${response.status}`);
    } catch (err) {
      Alert.alert('Network error', err.message || 'Please try again');
    } finally {
      if (isMountedRef.current) {
        setCancellingId(null);
      }
    }
  }

  function handleView(reservation) {
    navigation.navigate('Session', {
      seatLabel: reservation.seat_label,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
    });
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load reservations: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no reservations yet.</Text>}
        renderItem={({ item }) => {
          const hasEnded = new Date(item.end_time).getTime() <= Date.now();
          const canCancel = item.status === 'confirmed' && !hasEnded;

          return (
            <View style={styles.card}>
              <Text style={styles.roomName}>
                {item.room_name} — Seat {item.seat_label}
              </Text>
              <Text style={styles.timeRange}>{formatRange(item.start_time, item.end_time)}</Text>
              <Text style={[styles.status, styles[`status_${item.status}`]]}>
                {STATUS_LABELS[item.status] ?? item.status}
              </Text>

              <View style={styles.actions}>
                {item.status === 'confirmed' && (
                  <ThemedButton
                    title="View"
                    onPress={() => handleView(item)}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                )}
                {canCancel && (
                  <ThemedButton
                    title={cancellingId === item.id ? 'Cancelling...' : 'Cancel'}
                    onPress={() => handleCancel(item)}
                    disabled={cancellingId === item.id}
                    variant="danger"
                    style={styles.actionButton}
                  />
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  list: {
    padding: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    textAlign: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.paperDim,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.mustard,
  },
  roomName: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.navy,
    marginBottom: 2,
  },
  timeRange: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  status: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  status_confirmed: {
    color: colors.sage,
  },
  status_cancelled: {
    color: colors.dustyrose,
  },
  status_completed: {
    color: colors.slateblue,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: spacing.sm,
  },
});
