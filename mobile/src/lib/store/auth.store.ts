import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../types';
import { MOCK_TOKEN } from '../api/mock';
import { meApi } from '../api/me.api';
import { useOnboardingStore } from './onboarding.store';

interface AuthState {
  user: User | null;
  token: string | null;
  isOffline: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

const hydrateUserData = async () => {
  const data = await meApi.bootstrap();
  if (data) {
    await useOnboardingStore.getState().hydrateFromBootstrap(data);
    if (data.profile.onboardingDone) {
      await AsyncStorage.setItem('onboarding_complete', 'true');
    }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isOffline: false,
  isLoading: true,
  onboardingComplete: false,

  setAuth: async (user, token) => {
    const offline = token === MOCK_TOKEN;
    if (!offline) {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ user, token, isOffline: offline });
    if (!offline) {
      await hydrateUserData();
      const done = useOnboardingStore.getState().onboardingComplete;
      set({ onboardingComplete: done });
    }
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ user: null, token: null, isOffline: false, onboardingComplete: false });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userStr, onboardingFlag] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
        AsyncStorage.getItem('onboarding_complete'),
      ]);
      if (token && userStr) {
        set({
          token,
          user: JSON.parse(userStr) as User,
          isOffline: false,
          onboardingComplete: onboardingFlag === 'true',
        });
        await hydrateUserData();
        const done = useOnboardingStore.getState().onboardingComplete;
        if (done) {
          set({ onboardingComplete: true });
          await AsyncStorage.setItem('onboarding_complete', 'true');
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
