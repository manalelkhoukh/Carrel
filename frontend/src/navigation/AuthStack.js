import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { colors, fonts } from '../theme';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
  );
}
