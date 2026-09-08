import type { Language } from '../../domain/language';
import type { SearchResult } from '../../domain/searchResult';
import { searchSongs } from './youtubeRepository';

const RECOMMENDATION_COUNT = 10;

/**
 * Simple rule-based recommendation queue (requirements.md section 13):
 * related query (same channel/artist, language-aware) -> candidates, already
 * duration/music-relevance/duplicate filtered by searchSongs -> remove
 * current + recently played items -> cap queue size. Falls back to an empty
 * list on any API failure so playback of the current item is never blocked
 * by recommendation generation.
 */
export async function generateRecommendations(
  seed: SearchResult,
  language: Language,
  exclude: Set<string>,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  const query = seed.channelTitle.trim() || seed.title;

  try {
    const candidates = await searchSongs(query, language, signal);
    return candidates.filter((item) => !exclude.has(item.videoId)).slice(0, RECOMMENDATION_COUNT);
  } catch {
    return [];
  }
}
