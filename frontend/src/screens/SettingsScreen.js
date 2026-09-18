import { StyleSheet, Text, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radii, spacing } from '../theme';

export default function SettingsScreen() {
  const { name, email, role, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{name || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{role === 'admin' ? 'Admin' : 'Student'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Study goals</Text>
        <Text style={styles.comingSoon}>
          Weekly study-hour goals and your booking history are coming soon.
        </Text>
      </View>

      <ThemedButton title="Log Out" onPress={logout} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.paperDim,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.paper,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.slateblue,
  },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  comingSoon: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
});
