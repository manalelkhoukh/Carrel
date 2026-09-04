import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { API_BASE_URL } from '../config/api';
import { colors, fonts, radii, spacing } from '../theme';

export default function SignupScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      await SecureStore.setItemAsync('authToken', data.token);
      await SecureStore.setItemAsync('userRole', data.role);
      navigation.navigate('Home');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.slateblue}
          value={name}
          onChangeText={setName}
        />
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
          title={submitting ? 'Signing up...' : 'Sign Up'}
          onPress={handleSubmit}
          disabled={submitting}
          variant="primary"
        />

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Already have an account? Log in
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
