import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import type { SearchResult } from '../domain/searchResult';
import { formatDuration } from '../utils/duration';

interface Props {
  result: SearchResult;
  onPress: () => void;
  trailing?: React.ReactNode;
}

function SearchResultRowComponent({ result, onPress, trailing }: Props) {
  const { colors } = useIsaiyaTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={result.title}
    >
      <Image
        source={{ uri: result.thumbnailUrl }}
        style={[styles.thumbnail, { backgroundColor: colors.surfaceVariant }]}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.info}>
        <Text style={[typography.itemTitle, styles.title, { color: colors.onSurface }]} numberOfLines={2}>
          {result.title}
        </Text>
        <Text style={[typography.caption, { color: colors.onSurfaceMuted }]} numberOfLines={1}>
          {result.channelTitle}
          {result.durationSeconds !== null ? ` · ${formatDuration(result.durationSeconds)}` : ''}
        </Text>
      </View>
      {trailing}
    </Pressable>
  );
}

export const SearchResultRow = React.memo(SearchResultRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 96,
    height: 54,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 4,
  },
});
