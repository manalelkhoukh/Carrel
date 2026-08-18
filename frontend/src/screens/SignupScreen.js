import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from '../config/api';

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
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title={submitting ? 'Signing up...' : 'Sign Up'} onPress={handleSubmit} disabled={submitting} />

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: 'blue',
  },
});
