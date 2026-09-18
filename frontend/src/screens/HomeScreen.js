import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { API_BASE_URL } from '../config/api';
import { colors, fonts, radii, spacing } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const isMountedRef = useRef(true);

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError(null);

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
        setRoomsError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingRooms(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={openDrawer}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Library Seats</Text>
        <Text style={styles.subtitle}>Find a quiet place to work</Text>

        <Text style={styles.sectionTitle}>Rooms</Text>
      </View>

      <View style={styles.roomsArea}>
        {loadingRooms ? (
          <ActivityIndicator size="large" color={colors.navy} />
        ) : roomsError ? (
          <Text style={styles.error}>Failed to load rooms: {roomsError}</Text>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(room) => room.id}
            contentContainerStyle={styles.roomList}
            ListEmptyComponent={<Text style={styles.emptyText}>No rooms available yet.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.room}
                onPress={() => navigation.navigate('SeatMap', { roomId: item.id, roomName: item.name })}
              >
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.roomMeta}>Floor {item.floor_number}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.toolRow}>
        <ThemedButton
          title="📝  To-Do List"
          onPress={() => navigation.navigate('ToDo')}
          variant="secondary"
          style={styles.toolButton}
        />
        <ThemedButton
          title="⏳  Pomodoro Timer"
          onPress={() => navigation.navigate('Pomodoro')}
          variant="secondary"
          style={styles.toolButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: colors.paper,
  },
  header: {
    paddingHorizontal: spacing.lg,
  },
  menuButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.navy,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.navy,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  roomsArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
  },
  roomList: {
    paddingBottom: spacing.lg,
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
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  toolRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.paperDim,
  },
  toolButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
