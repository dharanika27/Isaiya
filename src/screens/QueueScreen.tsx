import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useQueue } from '../state/QueueContext';
import { formatDuration } from '../utils/duration';
import type { SearchResult } from '../domain/searchResult';

export function QueueScreen() {
  const { colors } = useIsaiyaTheme();
  const { current, upcoming, selectUpcoming, removeUpcoming } = useQueue();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.sectionLabel, styles.sectionLabel, { color: colors.onSurfaceMuted }]}>Now Playing</Text>
      {current ? (
        <View style={styles.row}>
          <Image
            source={{ uri: current.thumbnailUrl }}
            style={[styles.thumbnail, { backgroundColor: colors.surfaceVariant }]}
            contentFit="cover"
          />
          <View style={styles.info}>
            <Text style={[typography.itemTitle, styles.title, { color: colors.onSurface }]} numberOfLines={2}>
              {current.title}
            </Text>
            <Text style={[typography.caption, { color: colors.onSurfaceMuted }]} numberOfLines={1}>
              {current.channelTitle}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={[typography.body, { color: colors.onSurfaceMuted }]}>Nothing is playing.</Text>
      )}

      <Text style={[typography.sectionLabel, styles.sectionLabel, { color: colors.onSurfaceMuted, marginTop: 24 }]}>
        Up Next
      </Text>
      {upcoming.length === 0 ? (
        <Text style={[typography.body, { color: colors.onSurfaceMuted }]}>No more songs queued.</Text>
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(item: SearchResult) => item.videoId}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => selectUpcoming(index)}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={`Play ${item.title}`}
            >
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={[styles.thumbnail, { backgroundColor: colors.surfaceVariant }]}
                contentFit="cover"
              />
              <View style={styles.info}>
                <Text style={[typography.itemTitle, styles.title, { color: colors.onSurface }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[typography.caption, { color: colors.onSurfaceMuted }]} numberOfLines={1}>
                  {item.channelTitle}
                  {item.durationSeconds !== null ? ` · ${formatDuration(item.durationSeconds)}` : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => removeUpcoming(index)}
                style={styles.removeButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title} from queue`}
              >
                <Ionicons name="close" size={20} color={colors.onSurfaceMuted} />
              </Pressable>
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
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
  sectionLabel: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    marginBottom: 4,
  },
  removeButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
});
