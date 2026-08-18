import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_BASE_URL } from '../config/api';

export default function SeatMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params ?? {};
  const isMountedRef = useRef(true);

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchSeats = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/seats`);
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
  }, [roomId]);

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

  function handleSeatPress(seat) {
    if (!seat.is_available) return;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    setBookingError(null);
    setPendingBooking({ seat, startTime, endTime });
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
          start_time: pendingBooking.startTime.toISOString(),
          end_time: pendingBooking.endTime.toISOString(),
        }),
      });

      if (response.status === 201) {
        setPendingBooking(null);
        Alert.alert('Booking confirmed', 'Your seat has been reserved.');
        fetchSeats();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load seats: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading Room</Text>
      <FlatList
        data={seats}
        keyExtractor={(seat) => seat.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!item.is_available}
            onPress={() => handleSeatPress(item)}
            style={[styles.seat, item.is_available ? styles.available : styles.unavailable]}
          >
            <Text style={styles.seatLabel}>{item.label}</Text>
            <Text>{item.is_available ? 'Available' : 'Unavailable'}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={pendingBooking !== null} transparent animationType="fade" onRequestClose={dismissBooking}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            {pendingBooking && (
              <>
                <Text style={styles.modalText}>Seat: {pendingBooking.seat.label}</Text>
                <Text style={styles.modalText}>
                  {pendingBooking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {pendingBooking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' (2 hours)'}
                </Text>
              </>
            )}
            {bookingError && <Text style={styles.error}>{bookingError}</Text>}
            <View style={styles.modalButtons}>
              <View style={styles.modalButton}>
                <Button title="Cancel" onPress={dismissBooking} disabled={submitting} />
              </View>
              <View style={styles.modalButton}>
                <Button
                  title={submitting ? 'Booking...' : 'Confirm booking'}
                  onPress={handleConfirmBooking}
                  disabled={submitting}
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  seat: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  seatLabel: {
    fontWeight: 'bold',
  },
  available: {
    backgroundColor: '#c8f7c5',
  },
  unavailable: {
    backgroundColor: '#d3d3d3',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
