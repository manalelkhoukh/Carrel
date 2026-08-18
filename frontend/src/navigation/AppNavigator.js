import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RoomListScreen from '../screens/RoomListScreen';
import SeatMapScreen from '../screens/SeatMapScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RoomList" component={RoomListScreen} options={{ title: 'Rooms' }} />
        <Stack.Screen name="SeatMap" component={SeatMapScreen} options={{ title: 'Seat Map' }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ title: 'Admin Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
