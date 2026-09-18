import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import AuthStack from './AuthStack';
import MainDrawer from './MainDrawer';

export default function AppNavigator() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return <NavigationContainer>{isLoggedIn ? <MainDrawer /> : <AuthStack />}</NavigationContainer>;
}
