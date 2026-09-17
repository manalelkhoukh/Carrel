import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { API_BASE_URL } from '../config/api';
import { colors, fonts, radii, spacing } from '../theme';

function formatSlotLabel(slot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const dayLabel = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const startLabel = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const endLabel = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${dayLabel}, ${startLabel} – ${endLabel}`;
}

export default function SeatMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId, roomName } = route.params ?? {};
  const isMountedRef = useRef(true);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pendingBooking, setPendingBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchSlots = useCallback(async () => {
    if (!roomId) return;

    setSlotsLoading(true);
    setSlotsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/slots`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setSlots(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setSlotsError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setSlotsLoading(false);
      }
    }
  }, [roomId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Fetches seat availability for the SELECTED SLOT specifically, not "right
  // now" — a seat can be free right now but already booked for a later
  // slot, so which seats show as available depends on which slot you picked.
  const fetchSeats = useCallback(async () => {
    if (!roomId || !selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
      });
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/seats?${params}`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setSeats(data);
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
  }, [roomId, selectedSlot]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  if (!roomId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No room selected</Text>
      </View>
    );
  }

  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
    setSeats([]);
  }

  function handleChangeSlot() {
    setSelectedSlot(null);
    setSeats([]);
    setError(null);
  }

  function handleSeatPress(seat) {
    if (!seat.is_available || !selectedSlot) return;

    setBookingError(null);
    setPendingBooking({ seat, slot: selectedSlot });
  }

  function dismissBooking() {
    if (submitting) return;
    setPendingBooking(null);
    setBookingError(null);
  }

  async function handleConfirmBooking() {
    if (!pendingBooking || submitting) return;

    setSubmitting(true);
    setBookingError(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        setPendingBooking(null);
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seat_id: pendingBooking.seat.id,
          start_time: pendingBooking.slot.startTime,
          end_time: pendingBooking.slot.endTime,
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const seatLabel = pendingBooking.seat.label;
        setPendingBooking(null);
        fetchSeats();
        navigation.navigate('Session', {
          seatLabel,
          startTime: data.start_time,
          endTime: data.end_time,
        });
        return;
      }

      if (response.status === 409) {
        setPendingBooking(null);
        Alert.alert('Seat unavailable', 'This seat was just booked by someone else, please pick another');
        fetchSeats();
        return;
      }

      if (response.status === 401) {
        setPendingBooking(null);
        navigation.navigate('Login');
        return;
      }

      const data = await response.json().catch(() => ({}));
      setBookingError(data.error || `Booking failed with status ${response.status}`);
    } catch (err) {
      setBookingError(err.message || 'Network error, please try again');
    } finally {
      setSubmitting(false);
    }
  }

  if (slotsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  if (slotsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load time slots: {slotsError}</Text>
      </View>
    );
  }

  // Step 1: pick a time slot, before anything about seats is shown at all.
  if (!selectedSlot) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{roomName ?? 'Choose a time'}</Text>
        <Text style={styles.subtitle}>Pick a time slot to see seat availability</Text>

        <FlatList
          data={slots}
          keyExtractor={(slot) => slot.startTime}
          contentContainerStyle={styles.slotList}
          ListEmptyComponent={<Text style={styles.error}>No slots available.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={item.isPast}
              onPress={() => handleSelectSlot(item)}
              style={[styles.slot, item.isPast && styles.slotPast]}
            >
              <Text style={[styles.slotLabel, item.isPast && styles.slotLabelPast]}>{formatSlotLabel(item)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChangeSlot} style={styles.changeSlotLink}>
        <Text style={styles.changeSlotText}>← Change time</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{roomName ?? 'Seats'}</Text>
      <Text style={styles.subtitle}>{formatSlotLabel(selectedSlot)}</Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendSwatch}>
            <View style={[styles.lamp, styles.lampAvailable]} />
          </View>
          <Text style={styles.legendLabel}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchSelected]}>
            <View style={[styles.lamp, styles.lampSelected]} />
          </View>
          <Text style={styles.legendLabel}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchUnavailable]}>
            <View style={[styles.lamp, styles.lampUnavailable]} />
          </View>
          <Text style={styles.legendLabel}>Unavailable</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.navy} />
      ) : error ? (
        <Text style={styles.error}>Failed to load seats: {error}</Text>
      ) : (
        <FlatList
          data={seats}
          keyExtractor={(seat) => seat.id}
          numColumns={4}
          columnWrapperStyle={styles.seatRow}
          contentContainerStyle={styles.seatGrid}
          renderItem={({ item }) => {
            const isSelected = pendingBooking?.seat.id === item.id;
            const seatStyle = isSelected
              ? styles.selected
              : item.is_available
                ? styles.available
                : styles.unavailable;
            const labelStyle = isSelected
              ? styles.seatLabelSelected
              : item.is_available
                ? styles.seatLabelAvailable
                : styles.seatLabelUnavailable;
            const lampStyle = isSelected
              ? styles.lampSelected
              : item.is_available
                ? styles.lampAvailable
                : styles.lampUnavailable;

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!item.is_available}
                onPress={() => handleSeatPress(item)}
                style={[styles.seat, seatStyle]}
              >
                <View style={[styles.lamp, lampStyle]} />
                <Text style={[styles.seatLabel, labelStyle]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={pendingBooking !== null} transparent animationType="fade" onRequestClose={dismissBooking}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            {pendingBooking && (
              <>
                <Text style={styles.modalText}>Seat: {pendingBooking.seat.label}</Text>
                <Text style={styles.modalText}>{formatSlotLabel(pendingBooking.slot)}</Text>
              </>
            )}
            {bookingError && <Text style={styles.error}>{bookingError}</Text>}
            <View style={styles.modalButtons}>
              <View style={styles.modalButton}>
                <ThemedButton title="Cancel" onPress={dismissBooking} disabled={submitting} variant="secondary" />
              </View>
              <View style={styles.modalButton}>
                <ThemedButton
                  title={submitting ? 'Booking...' : 'Confirm booking'}
                  onPress={handleConfirmBooking}
                  disabled={submitting}
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    textAlign: 'center',
  },
  slotList: {
    paddingBottom: spacing.xl,
  },
  slot: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.navy,
  },
  slotPast: {
    backgroundColor: colors.paperDim,
  },
  slotLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.paper,
  },
  slotLabelPast: {
    color: colors.ink,
    opacity: 0.5,
  },
  changeSlotLink: {
    marginBottom: spacing.sm,
  },
  changeSlotText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.slateblue,
  },
  legend: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  legendSwatch: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    marginRight: spacing.xs,
    backgroundColor: colors.navy,
    borderWidth: 1.5,
    borderColor: colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendSwatchSelected: {
    borderColor: colors.mustard,
  },
  legendSwatchUnavailable: {
    backgroundColor: colors.navyLight,
    opacity: 0.55,
  },
  legendLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
  },
  seatGrid: {
    paddingBottom: spacing.xl,
  },
  seatRow: {
    justifyContent: 'flex-start',
  },
  seat: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.sm,
    borderWidth: 1.5,
  },
  seatLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  lamp: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  available: {
    backgroundColor: colors.navy,
    borderColor: colors.navyLight,
  },
  seatLabelAvailable: {
    color: colors.paper,
  },
  lampAvailable: {
    backgroundColor: 'rgba(251,246,236,0.35)',
  },
  selected: {
    backgroundColor: colors.navy,
    borderColor: colors.mustard,
    shadowColor: colors.mustard,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  seatLabelSelected: {
    color: colors.mustard,
  },
  lampSelected: {
    backgroundColor: colors.mustard,
    shadowColor: colors.mustard,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  unavailable: {
    backgroundColor: colors.navyLight,
    borderColor: colors.navyLight,
    opacity: 0.5,
  },
  seatLabelUnavailable: {
    color: colors.paper,
  },
  lampUnavailable: {
    backgroundColor: 'rgba(251,246,236,0.12)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(34,49,78,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.paperDim,
  },
  modalTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 19,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  modalText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
