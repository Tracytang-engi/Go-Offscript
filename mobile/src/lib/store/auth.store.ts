import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../types';
import { MOCK_TOKEN } from '../api/mock';

interface AuthState {
  user: User | null;
  token: string | null;
  isOffline: boolean;          // true when using mock/offline session
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isOffline: false,
  isLoading: true,

  setAuth: async (user, token) => {
    const offline = token === MOCK_TOKEN;
    if (!offline) {
      // Only persist real tokens — offline tokens live in memory only
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ user, token, isOffline: offline });
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ user: null, token: null, isOffline: false });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
      ]);
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) as User, isOffline: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
