import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { LanguageChip } from '../components/LanguageChip';
import { EmptySection } from '../components/EmptySection';
import { SearchResultRow } from '../components/SearchResultRow';
import { LANGUAGES } from '../domain/language';
import { useLanguage } from '../state/LanguageContext';
import { useRecentlyPlayed } from '../state/RecentlyPlayedContext';
import { usePlaySong } from '../hooks/usePlaySong';
import type { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

const HOME_RECENT_COUNT = 3;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useIsaiyaTheme();
  const { language, setLanguageCode } = useLanguage();
  const { recentlyPlayed } = useRecentlyPlayed();
  const playSong = usePlaySong();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[typography.appTitle, { color: colors.onSurface }]}>ISAIYA</Text>
      <Text style={[typography.tagline, styles.tagline, { color: colors.onSurfaceMuted }]}>Your music. Your mood.</Text>

      <Pressable
        onPress={() => navigation.navigate('Search')}
        style={[styles.searchBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
        accessibilityRole="button"
        accessibilityLabel="Search songs, artists"
      >
        <Ionicons name="search" size={18} color={colors.onSurfaceMuted} />
        <Text style={[typography.body, styles.searchPlaceholder, { color: colors.onSurfaceMuted }]}>
          Search songs, artists…
        </Text>
      </Pressable>

      <Text style={[typography.sectionLabel, styles.sectionLabel, { color: colors.onSurfaceMuted }]}>Language</Text>
      <View style={styles.chipRow}>
        {LANGUAGES.map((entry) => (
          <LanguageChip
            key={entry.code}
            label={entry.label}
            selected={entry.code === language.code}
            onPress={() => setLanguageCode(entry.code)}
          />
        ))}
      </View>

      {recentlyPlayed.length === 0 ? (
        <EmptySection title="Recently Played" emptyText="Nothing played yet." icon="time-outline" />
      ) : (
        <View style={styles.section}>
          <Text style={[typography.sectionLabel, styles.sectionLabel, { color: colors.onSurfaceMuted }]}>
            Recently Played
          </Text>
          {recentlyPlayed.slice(0, HOME_RECENT_COUNT).map((item) => (
            <SearchResultRow key={item.videoId} result={item} onPress={() => playSong(item)} />
          ))}
        </View>
      )}

      <EmptySection title="Recommended" emptyText="Play a song to get related recommendations." icon="sparkles-outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  tagline: {
    marginTop: 2,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  searchPlaceholder: {
    marginLeft: 8,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
});
