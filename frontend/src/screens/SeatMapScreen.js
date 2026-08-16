import { StyleSheet, Text, View } from 'react-native';

export default function SeatMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seat Map</Text>
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
  },
});
