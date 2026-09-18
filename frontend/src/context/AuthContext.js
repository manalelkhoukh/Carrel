import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStoredAuth() {
      const [token, storedRole, storedName, storedEmail] = await Promise.all([
        SecureStore.getItemAsync('authToken'),
        SecureStore.getItemAsync('userRole'),
        SecureStore.getItemAsync('userName'),
        SecureStore.getItemAsync('userEmail'),
      ]);

      if (!cancelled) {
        setIsLoggedIn(Boolean(token));
        setRole(storedRole);
        setName(storedName);
        setEmail(storedEmail);
        setIsLoading(false);
      }
    }

    loadStoredAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login({ token, role: userRole, name: userName, email: userEmail }) {
    await Promise.all([
      SecureStore.setItemAsync('authToken', token),
      SecureStore.setItemAsync('userRole', userRole ?? ''),
      SecureStore.setItemAsync('userName', userName ?? ''),
      SecureStore.setItemAsync('userEmail', userEmail ?? ''),
    ]);
    setIsLoggedIn(true);
    setRole(userRole ?? null);
    setName(userName ?? null);
    setEmail(userEmail ?? null);
  }

  async function logout() {
    await Promise.all([
      SecureStore.deleteItemAsync('authToken'),
      SecureStore.deleteItemAsync('userRole'),
      SecureStore.deleteItemAsync('userName'),
      SecureStore.deleteItemAsync('userEmail'),
    ]);
    setIsLoggedIn(false);
    setRole(null);
    setName(null);
    setEmail(null);
  }

  const value = useMemo(
    () => ({ isLoading, isLoggedIn, role, name, email, login, logout }),
    [isLoading, isLoggedIn, role, name, email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
