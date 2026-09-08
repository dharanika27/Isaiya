import { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueue } from '../state/QueueContext';
import { useLanguage } from '../state/LanguageContext';
import { useRecentlyPlayed } from '../state/RecentlyPlayedContext';
import { generateRecommendations } from '../data/repository/recommendationRepository';
import type { SearchResult } from '../domain/searchResult';
import type { RootStackParamList } from '../navigation/types';

const RECENT_EXCLUSION_WINDOW = 15;

/**
 * Starts playback of a single selected song immediately, then asynchronously
 * builds a rule-based "Up Next" queue behind it (requirements.md section 13).
 * Recommendation lookup failures are swallowed so playback is never blocked.
 */
export function usePlaySong() {
  const { playQueue, appendUpcoming } = useQueue();
  const { language } = useLanguage();
  const { recentlyPlayed } = useRecentlyPlayed();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const activeRequestRef = useRef(0);

  return useCallback(
    (item: SearchResult) => {
      playQueue([item], 0);
      navigation.navigate('Player');

      const requestId = ++activeRequestRef.current;
      const exclude = new Set<string>([
        item.videoId,
        ...recentlyPlayed.slice(0, RECENT_EXCLUSION_WINDOW).map((entry) => entry.videoId),
      ]);

      generateRecommendations(item, language, exclude)
        .then((recommended) => {
          if (requestId !== activeRequestRef.current || recommended.length === 0) return;
          appendUpcoming(recommended);
        })
        .catch(() => {});
    },
    [playQueue, appendUpcoming, language, recentlyPlayed, navigation]
  );
}
