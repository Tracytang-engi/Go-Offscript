import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── API URL ──────────────────────────────────────────────────────────────────
// Option A (tunnel / current):  https://gooffscript.loca.lt/api
// Option B (LAN):               http://10.228.2.85:3000/api
// Option C (Render, permanent): https://your-render-app.onrender.com/api
export const API_BASE_URL = 'https://go-off-script-api.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',   // bypasses localtunnel splash page
  },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // AsyncStorage unavailable (e.g. native module not linked yet) — skip token
  }
  return config;
});

// Normalize error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
