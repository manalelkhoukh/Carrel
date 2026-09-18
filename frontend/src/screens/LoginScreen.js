import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radii, spacing } from '../theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Updating AuthContext flips AppNavigator from the login/signup stack
      // over to the main drawer automatically — no manual navigation needed.
      await login({ token: data.token, role: data.role, name: data.name, email: data.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Log In</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.slateblue}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.slateblue}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <ThemedButton
          title={submitting ? 'Logging in...' : 'Log In'}
          onPress={handleSubmit}
          disabled={submitting}
          variant="primary"
        />

        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Don't have an account? Sign up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.paper,
  },
  card: {
    backgroundColor: colors.paperDim,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.navy,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.slateblue,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.paper,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.dustyrose,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.bodyMedium,
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.mauve,
  },
});
