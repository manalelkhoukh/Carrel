import { createDrawerNavigator } from '@react-navigation/drawer';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ToDoScreen from '../screens/ToDoScreen';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
import CustomDrawerContent from './CustomDrawerContent';
import HomeStackNavigator from './HomeStackNavigator';

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  const { role } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.paper,
        headerTitleStyle: { fontFamily: fonts.heading },
        headerShadowVisible: false,
        drawerStyle: { width: 280 },
        sceneContainerStyle: { backgroundColor: colors.paper },
      }}
    >
      <Drawer.Screen name="HomeStack" component={HomeStackNavigator} options={{ headerShown: false }} />
      <Drawer.Screen name="ToDo" component={ToDoScreen} options={{ title: 'To-Do List' }} />
      <Drawer.Screen name="Pomodoro" component={PomodoroScreen} options={{ title: 'Pomodoro Timer' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      {role === 'admin' && (
        <Drawer.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ title: 'Admin Dashboard' }}
        />
      )}
    </Drawer.Navigator>
  );
}
