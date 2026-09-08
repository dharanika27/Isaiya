import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IsaiyaThemeProvider, useIsaiyaTheme } from './src/theme/ThemeContext';
import { LanguageProvider } from './src/state/LanguageContext';
import { QueueProvider } from './src/state/QueueContext';
import { FavoritesProvider } from './src/state/FavoritesContext';
import { RecentlyPlayedProvider } from './src/state/RecentlyPlayedContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { isDark } = useIsaiyaTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <IsaiyaThemeProvider>
          <LanguageProvider>
            <FavoritesProvider>
              <RecentlyPlayedProvider>
                <QueueProvider>
                  <AppContent />
                </QueueProvider>
              </RecentlyPlayedProvider>
            </FavoritesProvider>
          </LanguageProvider>
        </IsaiyaThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
