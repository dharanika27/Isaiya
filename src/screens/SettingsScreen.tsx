import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsaiyaTheme, type ThemeMode } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useFavorites } from '../state/FavoritesContext';
import { useRecentlyPlayed } from '../state/RecentlyPlayedContext';

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: 'System' },
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
];

export function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useIsaiyaTheme();
  const { clearFavorites } = useFavorites();
  const { clearHistory } = useRecentlyPlayed();

  const confirmClear = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const rows: { label: string; onPress?: () => void }[] = [
    { label: 'Language preference' },
    {
      label: 'Clear recently played',
      onPress: () => confirmClear('Clear recently played?', 'This removes your local playback history.', clearHistory),
    },
    {
      label: 'Clear favorites',
      onPress: () => confirmClear('Clear favorites?', 'This removes all saved favorites.', clearFavorites),
    },
    { label: 'About ISAIYA' },
    { label: 'Privacy information' },
    { label: 'Terms & legal information' },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[typography.body, styles.rowLabel, { color: colors.onSurface }]}>Theme</Text>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((option) => {
            const selected = option.mode === themeMode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => setThemeMode(option.mode)}
                style={[styles.segment, { backgroundColor: selected ? colors.primary : 'transparent' }]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label} theme`}
                hitSlop={4}
              >
                <Text style={[typography.caption, { color: selected ? '#FFFFFF' : colors.onSurfaceMuted, fontWeight: '600' }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {rows.map((row) => (
        <Pressable
          key={row.label}
          style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed && row.onPress ? 0.6 : 1 }]}
          onPress={row.onPress}
          disabled={!row.onPress}
        >
          <Text style={[typography.body, styles.rowLabel, { color: colors.onSurface }]}>{row.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 44,
  },
  rowLabel: {
    fontSize: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
});
