import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useLanguage } from '../state/LanguageContext';
import { usePlaySong } from '../hooks/usePlaySong';
import { useYoutubeSearch } from '../hooks/useYoutubeSearch';
import { SearchResultRow } from '../components/SearchResultRow';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorNotice } from '../components/ErrorNotice';
import type { SearchResult } from '../domain/searchResult';

export function SearchScreen() {
  const { colors } = useIsaiyaTheme();
  const { language } = useLanguage();
  const playSong = usePlaySong();
  const [query, setQuery] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  const state = useYoutubeSearch(query, language, retryToken);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.onSurfaceMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs, artists, movies…"
          placeholderTextColor={colors.onSurfaceMuted}
          style={[typography.body, styles.searchInput, { color: colors.onSurface }]}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search songs, artists, movies"
        />
      </View>

      {state.status === 'idle' && (
        <View style={styles.centered}>
          <Text style={[typography.body, styles.hintText, { color: colors.onSurfaceMuted }]}>
            Search for a song, artist, or movie.
          </Text>
        </View>
      )}

      {state.status === 'loading' && <LoadingIndicator label="Searching…" />}

      {state.status === 'empty' && (
        <View style={styles.centered}>
          <Text style={[typography.body, styles.hintText, { color: colors.onSurfaceMuted }]}>
            No music found. Try a different search.
          </Text>
        </View>
      )}

      {state.status === 'error' && (
        <ErrorNotice message={state.message} onRetry={() => setRetryToken((token) => token + 1)} />
      )}

      {state.status === 'success' && (
        <FlatList
          data={state.results}
          keyExtractor={(item: SearchResult) => item.videoId}
          renderItem={({ item }) => <SearchResultRow result={item} onPress={() => playSong(item)} />}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  hintText: {
    textAlign: 'center',
    marginTop: 8,
  },
  resultsList: {
    paddingBottom: 32,
  },
});
