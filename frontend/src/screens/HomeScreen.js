import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      SecureStore.getItemAsync('userRole').then((storedRole) => {
        if (!cancelled) {
          setRole(storedRole);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Button title="View Seats" onPress={() => navigation.navigate('RoomList')} />
      <View style={styles.spacer} />
      <Button title="Log In" onPress={() => navigation.navigate('Login')} />
      <View style={styles.spacer} />
      <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
      {role === 'admin' && (
        <>
          <View style={styles.spacer} />
          <Button title="Admin Dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  spacer: {
    height: 12,
  },
});
