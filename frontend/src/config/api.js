import Constants from 'expo-constants';

const FALLBACK_API_BASE_URL = 'http://192.168.1.4:3000';
const BACKEND_PORT = 3000;

function resolveApiBaseUrl() {
  // hostUri is only present during development via @expo/cli — it's the exact
  // "<ip>:<metro-port>" the QR code was generated from, so its IP is reachable
  // from the same device/network the app is running on.
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return FALLBACK_API_BASE_URL;
  }

  const host = hostUri.split(':')[0];
  if (!host) {
    return FALLBACK_API_BASE_URL;
  }

  return `http://${host}:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
