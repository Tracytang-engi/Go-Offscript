import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'normal' | 'large';

interface ThemeState {
  darkMode: boolean;
  fontSize: FontSize;
  toggleDarkMode: () => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: false,
  fontSize: 'normal',

  toggleDarkMode: async () => {
    set((state) => {
      const next = !state.darkMode;
      AsyncStorage.setItem('theme_dark', next ? 'true' : 'false');
      return { darkMode: next };
    });
  },

  setFontSize: async (size) => {
    set({ fontSize: size });
    await AsyncStorage.setItem('theme_font', size);
  },

  loadTheme: async () => {
    try {
      const [dark, font] = await Promise.all([
        AsyncStorage.getItem('theme_dark'),
        AsyncStorage.getItem('theme_font'),
      ]);
      set({
        darkMode: dark === 'true',
        fontSize: (font === 'large' ? 'large' : 'normal') as FontSize,
      });
    } catch {
      // keep defaults
    }
  },
}));
