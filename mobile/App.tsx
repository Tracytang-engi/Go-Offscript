import './global.css';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/lib/store/auth.store';
import { useThemeStore } from './src/lib/store/theme.store';

export default function App() {
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    loadStoredAuth();
    loadTheme();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
