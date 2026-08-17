import { Colors, DarkColors } from '../constants/colors';
import { useThemeStore } from './store/theme.store';

export const useTheme = () => {
  const { darkMode, fontSize } = useThemeStore();
  return {
    colors: darkMode ? DarkColors : Colors,
    /** Scale a font size by the user's font preference */
    fs: (n: number) => Math.round(n * (fontSize === 'large' ? 1.15 : 1)),
    isDark: darkMode,
  };
};
