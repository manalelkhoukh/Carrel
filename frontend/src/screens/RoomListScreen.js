import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { API_BASE_URL } from '../config/api';
import { colors, fonts, radii, spacing } from '../theme';

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
        <ActivityIndicator size="large" color={colors.navy} />
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
            <Text style={styles.roomMeta}>Floor {item.floor_number}</Text>
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
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.navy,
    marginBottom: spacing.lg,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    textAlign: 'center',
  },
  room: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.paperDim,
    borderLeftWidth: 4,
    borderLeftColor: colors.mustard,
  },
  roomName: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 2,
  },
  roomMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.slateblue,
  },
});
