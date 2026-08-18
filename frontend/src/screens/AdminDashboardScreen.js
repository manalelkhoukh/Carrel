import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_BASE_URL } from '../config/api';

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const isMountedRef = useRef(true);

  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservationsError, setReservationsError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const [roomName, setRoomName] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [createRoomError, setCreateRoomError] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchReservations = useCallback(async () => {
    setLoadingReservations(true);
    setReservationsError(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (isMountedRef.current) {
        setReservations(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setReservationsError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingReservations(false);
      }
    }
  }, [navigation]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  async function handleCreateRoom() {
    if (!roomName.trim() || !floorNumber.trim()) {
      setCreateRoomError('Room name and floor number are required');
      return;
    }

    setCreatingRoom(true);
    setCreateRoomError(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName.trim(), floor_number: Number(floorNumber) }),
      });

      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setRoomName('');
      setFloorNumber('');
      Alert.alert('Room created', `"${data.name}" was created.`);
    } catch (err) {
      setCreateRoomError(err.message);
    } finally {
      setCreatingRoom(false);
    }
  }

  async function handleCancelReservation(id) {
    setCancellingId(id);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reservations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }

      if (response.status === 409) {
        Alert.alert('Already cancelled', 'This reservation is already cancelled or completed.');
        fetchReservations();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Cancel failed with status ${response.status}`);
      }

      fetchReservations();
    } catch (err) {
      Alert.alert('Cancel failed', err.message || 'Something went wrong, please try again');
    } finally {
      if (isMountedRef.current) {
        setCancellingId(null);
      }
    }
  }

  if (loadingReservations) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (reservationsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load reservations: {reservationsError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Create Room</Text>
              <TextInput
                style={styles.input}
                placeholder="Room name"
                value={roomName}
                onChangeText={setRoomName}
              />
              <TextInput
                style={styles.input}
                placeholder="Floor number"
                keyboardType="numeric"
                value={floorNumber}
                onChangeText={setFloorNumber}
              />
              {createRoomError && <Text style={styles.error}>{createRoomError}</Text>}
              <Button
                title={creatingRoom ? 'Creating...' : 'Create Room'}
                onPress={handleCreateRoom}
                disabled={creatingRoom}
              />
            </View>

            <Text style={styles.sectionTitle}>All Reservations</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No reservations yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.reservationRow}>
            <Text style={styles.reservationText}>
              {item.user_name} — {item.room_name} / {item.seat_label}
            </Text>
            <Text style={styles.reservationText}>
              {new Date(item.start_time).toLocaleString()} – {new Date(item.end_time).toLocaleString()}
            </Text>
            <Text style={styles.reservationText}>Status: {item.status}</Text>
            <Button
              title={cancellingId === item.id ? 'Cancelling...' : 'Cancel'}
              onPress={() => handleCancelReservation(item.id)}
              disabled={cancellingId === item.id || item.status !== 'confirmed'}
            />
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
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
  reservationRow: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  reservationText: {
    marginBottom: 4,
  },
});
