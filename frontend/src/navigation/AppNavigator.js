import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SeatMapScreen from '../screens/SeatMapScreen';
import SessionScreen from '../screens/SessionScreen';
import SignupScreen from '../screens/SignupScreen';
import ToDoScreen from '../screens/ToDoScreen';
import { colors, fonts } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState('Login');

  useEffect(() => {
    let cancelled = false;

    SecureStore.getItemAsync('authToken').then((token) => {
      if (!cancelled) {
        setInitialRouteName(token ? 'Home' : 'Login');
        setIsCheckingAuth(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.paper,
          headerTitleStyle: { fontFamily: fonts.heading },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SeatMap" component={SeatMapScreen} options={{ title: 'Seat Map' }} />
        <Stack.Screen name="Session" component={SessionScreen} options={{ title: 'Your Session' }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ title: 'Admin Dashboard' }}
        />
        <Stack.Screen name="ToDo" component={ToDoScreen} options={{ title: 'To-Do List' }} />
        <Stack.Screen name="Pomodoro" component={PomodoroScreen} options={{ title: 'Pomodoro Timer' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
