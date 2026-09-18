import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MyReservationsScreen from '../screens/MyReservationsScreen';
import SeatMapScreen from '../screens/SeatMapScreen';
import SessionScreen from '../screens/SessionScreen';
import { colors, fonts } from '../theme';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
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
      <Stack.Screen name="MyReservations" component={MyReservationsScreen} options={{ title: 'My Reservations' }} />
      <Stack.Screen name="Session" component={SessionScreen} options={{ title: 'Your Session' }} />
    </Stack.Navigator>
  );
}
