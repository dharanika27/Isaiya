import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { readJson, writeJson } from '../data/local/storage';
import { darkColors, lightColors, IsaiyaColors } from './colors';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'isaiya.themeMode.v1';

interface IsaiyaThemeValue {
  colors: IsaiyaColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  navigationTheme: NavigationTheme;
}

const IsaiyaThemeContext = createContext<IsaiyaThemeValue | undefined>(undefined);

export function IsaiyaThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    readJson<ThemeMode>(STORAGE_KEY, 'system').then(setThemeMode);
  }, []);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    writeJson(STORAGE_KEY, mode);
  };

  const isDark = themeMode === 'system' ? scheme !== 'light' : themeMode === 'dark';

  const value = useMemo<IsaiyaThemeValue>(() => {
    const colors = isDark ? darkColors : lightColors;
    const base = isDark ? DarkTheme : DefaultTheme;
    const navigationTheme: NavigationTheme = {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.onSurface,
        border: colors.border,
      },
    };
    return { colors, isDark, themeMode, setThemeMode: handleSetThemeMode, navigationTheme };
  }, [isDark, themeMode]);

  return <IsaiyaThemeContext.Provider value={value}>{children}</IsaiyaThemeContext.Provider>;
}

export function useIsaiyaTheme(): IsaiyaThemeValue {
  const context = useContext(IsaiyaThemeContext);
  if (!context) {
    throw new Error('useIsaiyaTheme must be used within an IsaiyaThemeProvider');
  }
  return context;
}
