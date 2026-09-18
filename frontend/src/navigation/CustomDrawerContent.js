import { DrawerContentScrollView } from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { colors, fonts, radii, spacing } from '../theme';

const NAV_ITEMS = [
  { navKey: 'home', target: 'HomeStack', label: 'Home', icon: '🏠' },
  { navKey: 'myReservations', target: 'HomeStack', screen: 'MyReservations', label: 'My Reservations', icon: '📚' },
  { navKey: 'todo', target: 'ToDo', label: 'To-Do List', icon: '📝' },
  { navKey: 'pomodoro', target: 'Pomodoro', label: 'Pomodoro Timer', icon: '⏳' },
  { navKey: 'settings', target: 'Settings', label: 'Settings', icon: '⚙️' },
];

export default function CustomDrawerContent(props) {
  const { navigation, state } = props;
  const { role, name, email, logout } = useAuth();
  const activeRouteName = state.routeNames[state.index];

  async function handleLogout() {
    await logout();
  }

  return (
    <DrawerContentScrollView
      {...props}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>Carrel</Text>
        <Text style={styles.userName}>{name || 'Student'}</Text>
        {email && <Text style={styles.userEmail}>{email}</Text>}
      </View>

      <View style={styles.itemGroup}>
        {NAV_ITEMS.map((item) => {
          // Only the plain top-level targets (no nested `screen`) can be reliably
          // highlighted from the drawer's own route name; a nested target like
          // "My Reservations" lives inside HomeStack, so we leave it unhighlighted
          // rather than show a misleading active state.
          const isActive = !item.screen && activeRouteName === item.target;
          return (
            <TouchableOpacity
              key={item.navKey}
              style={[styles.item, isActive && styles.itemActive]}
              activeOpacity={0.7}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate(item.target, item.screen ? { screen: item.screen } : undefined)
                )
              }
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        {role === 'admin' && (
          <TouchableOpacity
            style={[styles.item, activeRouteName === 'AdminDashboard' && styles.itemActive]}
            activeOpacity={0.7}
            onPress={() => navigation.dispatch(CommonActions.navigate('AdminDashboard'))}
          >
            <Text style={styles.itemIcon}>🛠️</Text>
            <Text
              style={[styles.itemLabel, activeRouteName === 'AdminDashboard' && styles.itemLabelActive]}
            >
              Admin Dashboard
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutLabel}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.paper,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.paper,
  },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  appName: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.paper,
    marginBottom: spacing.sm,
  },
  userName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.paper,
  },
  userEmail: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.slateblue,
    marginTop: 2,
  },
  itemGroup: {
    paddingHorizontal: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  itemActive: {
    backgroundColor: colors.paperDim,
  },
  itemIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.ink,
  },
  itemLabelActive: {
    fontFamily: fonts.bodySemiBold,
    color: colors.navy,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.paperDim,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  logoutLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.dustyrose,
  },
});
