import React, { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { EmptySection } from '../components/EmptySection';
import { SearchResultRow } from '../components/SearchResultRow';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useFavorites } from '../state/FavoritesContext';
import { useRecentlyPlayed } from '../state/RecentlyPlayedContext';
import { usePlaySong } from '../hooks/usePlaySong';
import type { LibraryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Library'>;

export function LibraryScreen({ navigation }: Props) {
  const { colors } = useIsaiyaTheme();
  const { favorites, loaded: favoritesLoaded, toggleFavorite } = useFavorites();
  const { recentlyPlayed, loaded: recentlyPlayedLoaded } = useRecentlyPlayed();
  const playSong = usePlaySong();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Settings')} accessibilityRole="button" accessibilityLabel="Settings" hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={colors.onSurface} style={styles.settingsIcon} />
        </Pressable>
      ),
    });
  }, [navigation, colors.onSurface]);

  if (!favoritesLoaded || !recentlyPlayedLoaded) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
        <LoadingIndicator />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      {favorites.length === 0 ? (
        <EmptySection title="Favorites" emptyText={'No favorites yet.\n\nTap ❤️ on a song to save it.'} icon="heart-outline" />
      ) : (
        <>
          <Text style={[typography.sectionLabel, styles.sectionLabel, { color: colors.onSurfaceMuted }]}>Favorites</Text>
          {favorites.map((item) => (
            <SearchResultRow
              key={item.videoId}
              result={item}
              onPress={() => playSong(item)}
              trailing={
                <Pressable
                  onPress={() => toggleFavorite(item, item.languageCode)}
                  style={styles.trailingButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from favorites"
                >
                  <Ionicons name="heart" size={20} color={colors.primary} />
                </Pressable>
              }
            />
          ))}
        </>
      )}

      {recentlyPlayed.length === 0 ? (
        <EmptySection title="Recently Played" emptyText="Nothing played yet." icon="time-outline" />
      ) : (
        <>
          <Text style={[typography.sectionLabel, styles.sectionLabel, { color: colors.onSurfaceMuted, marginTop: 8 }]}>
            Recently Played
          </Text>
          {recentlyPlayed.map((item) => (
            <SearchResultRow key={item.videoId} result={item} onPress={() => playSong(item)} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  settingsIcon: {
    marginRight: 8,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  trailingButton: {
    padding: 8,
  },
});
