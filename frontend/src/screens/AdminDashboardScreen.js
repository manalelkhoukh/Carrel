import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { API_BASE_URL } from '../config/api';
import { colors, fonts, radii, spacing } from '../theme';

const STATUS_COLORS = {
  confirmed: colors.sage,
  cancelled: colors.dustyrose,
  completed: colors.slateblue,
};

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
        <ActivityIndicator size="large" color={colors.navy} />
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
                placeholderTextColor={colors.slateblue}
                value={roomName}
                onChangeText={setRoomName}
              />
              <TextInput
                style={styles.input}
                placeholder="Floor number"
                placeholderTextColor={colors.slateblue}
                keyboardType="numeric"
                value={floorNumber}
                onChangeText={setFloorNumber}
              />
              {createRoomError && <Text style={styles.error}>{createRoomError}</Text>}
              <ThemedButton
                title={creatingRoom ? 'Creating...' : 'Create Room'}
                onPress={handleCreateRoom}
                disabled={creatingRoom}
                variant="primary"
              />
            </View>

            <Text style={styles.sectionTitle}>All Reservations</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No reservations yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.reservationRow}>
            <Text style={styles.reservationName}>
              {item.user_name} — {item.room_name} / {item.seat_label}
            </Text>
            <Text style={styles.reservationText}>
              {new Date(item.start_time).toLocaleString()} – {new Date(item.end_time).toLocaleString()}
            </Text>
            <Text style={[styles.reservationStatus, { color: STATUS_COLORS[item.status] || colors.ink }]}>
              Status: {item.status}
            </Text>
            <ThemedButton
              title={cancellingId === item.id ? 'Cancelling...' : 'Cancel'}
              onPress={() => handleCancelReservation(item.id)}
              disabled={cancellingId === item.id || item.status !== 'confirmed'}
              variant="danger"
              style={styles.cancelButton}
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
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.navy,
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.paperDim,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.mustard,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.slateblue,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.paper,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  reservationRow: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.paperDim,
  },
  reservationName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  reservationText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  reservationStatus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
});
