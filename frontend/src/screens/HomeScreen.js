import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Button title="View Seat Map" onPress={() => navigation.navigate('SeatMap')} />
      <View style={styles.spacer} />
      <Button title="Log In" onPress={() => navigation.navigate('Login')} />
      <View style={styles.spacer} />
      <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
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
