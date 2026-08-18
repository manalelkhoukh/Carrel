import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { API_BASE_URL } from '../config/api';

export default function RoomListScreen() {
  const navigation = useNavigation();
  const isMountedRef = useRef(true);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setRooms(data);
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
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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
        <Text style={styles.error}>Failed to load rooms: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rooms</Text>
      <FlatList
        data={rooms}
        keyExtractor={(room) => room.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.room}
            onPress={() => navigation.navigate('SeatMap', { roomId: item.id })}
          >
            <Text style={styles.roomName}>{item.name}</Text>
            <Text>Floor {item.floor_number}</Text>
          </TouchableOpacity>
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
  room: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  roomName: {
    fontWeight: 'bold',
  },
});
