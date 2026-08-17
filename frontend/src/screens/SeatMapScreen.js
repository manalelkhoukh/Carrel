import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from '../config/api';

const ROOM_ID = '7dcbd845-bfa1-4d64-8258-ff0fcaa358ff';

export default function SeatMapScreen() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSeats() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/${ROOM_ID}/seats`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled) {
          setSeats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSeats();

    return () => {
      cancelled = true;
    };
  }, []);

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
          <View style={[styles.seat, item.is_available ? styles.available : styles.unavailable]}>
            <Text style={styles.seatLabel}>{item.label}</Text>
            <Text>{item.is_available ? 'Available' : 'Unavailable'}</Text>
          </View>
        )}
      />
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
});
