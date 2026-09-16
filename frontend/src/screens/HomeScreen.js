import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { colors, fonts, spacing } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      SecureStore.getItemAsync('authToken').then((token) => {
        if (!cancelled) {
          setIsLoggedIn(Boolean(token));
        }
      });

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

  async function handleLogout() {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userRole');
    setIsLoggedIn(false);
    setRole(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library Seats</Text>
      <Text style={styles.subtitle}>Find a quiet place to work</Text>

      <View style={styles.buttonGroup}>
        <ThemedButton title="View Seats" onPress={() => navigation.navigate('RoomList')} variant="primary" />
        <View style={styles.spacer} />
        {isLoggedIn ? (
          <ThemedButton title="Log Out" onPress={handleLogout} variant="danger" />
        ) : (
          <>
            <ThemedButton title="Log In" onPress={() => navigation.navigate('Login')} variant="secondary" />
            <View style={styles.spacer} />
            <ThemedButton title="Sign Up" onPress={() => navigation.navigate('Signup')} variant="secondary" />
          </>
        )}
        {role === 'admin' && (
          <>
            <View style={styles.spacer} />
            <ThemedButton
              title="Admin Dashboard"
              onPress={() => navigation.navigate('AdminDashboard')}
              variant="accent"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 32,
    color: colors.navy,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
  },
  spacer: {
    height: spacing.md,
  },
});
