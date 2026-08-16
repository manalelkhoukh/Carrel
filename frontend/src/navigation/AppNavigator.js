import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SeatMapScreen from '../screens/SeatMapScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SeatMap" component={SeatMapScreen} options={{ title: 'Seat Map' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
