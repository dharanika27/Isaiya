import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useLanguage } from '../state/LanguageContext';
import { usePlaySong } from '../hooks/usePlaySong';
import { useYoutubeSearch } from '../hooks/useYoutubeSearch';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const state = useYoutubeSearch(query, language, retryToken);
  const suggestions = useSearchSuggestions(query, language, showSuggestions);
  const suggestionsVisible = showSuggestions && suggestions.length > 0;

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.onSurfaceMuted} />
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onSubmitEditing={() => setShowSuggestions(false)}
          placeholder="Search songs, artists, movies…"
          placeholderTextColor={colors.onSurfaceMuted}
          style={[typography.body, styles.searchInput, { color: colors.onSurface }]}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search songs, artists, movies"
        />
      </View>

      {suggestionsVisible && (
        <View style={[styles.suggestions, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => handleSelectSuggestion(suggestion)}
              style={({ pressed }) => [styles.suggestionRow, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={`Search for ${suggestion}`}
            >
              <Ionicons name="search-outline" size={16} color={colors.onSurfaceMuted} style={styles.suggestionIcon} />
              <Text style={[typography.body, { color: colors.onSurface }]} numberOfLines={1}>
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {!suggestionsVisible && state.status === 'idle' && (
        <View style={styles.centered}>
          <Text style={[typography.body, styles.hintText, { color: colors.onSurfaceMuted }]}>
            Search for a song, artist, or movie.
          </Text>
        </View>
      )}

      {!suggestionsVisible && state.status === 'loading' && <LoadingIndicator label="Searching…" />}

      {!suggestionsVisible && state.status === 'empty' && (
        <View style={styles.centered}>
          <Text style={[typography.body, styles.hintText, { color: colors.onSurfaceMuted }]}>
            No music found. Try a different search.
          </Text>
        </View>
      )}

      {!suggestionsVisible && state.status === 'error' && (
        <ErrorNotice message={state.message} onRetry={() => setRetryToken((token) => token + 1)} />
      )}

      {!suggestionsVisible && state.status === 'success' && (
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
  suggestions: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  suggestionIcon: {
    marginRight: 8,
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
