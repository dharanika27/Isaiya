import { YOUTUBE_API_KEY } from '../../config/env';
import type { Language } from '../../domain/language';
import type { SearchResult } from '../../domain/searchResult';
import { normalizeTitle } from '../../utils/text';
import { isLikelyMusic, isSuitableDuration, musicRelevanceScore } from '../../utils/musicRelevance';
import { fetchVideoDurations, searchVideos, YouTubeApiError } from '../remote/youtubeApi';

const MAX_CACHE_ENTRIES = 20;
const resultCache = new Map<string, SearchResult[]>();

function buildQuery(query: string, language: Language): string {
  return language.searchKeyword ? `${query} ${language.searchKeyword}` : query;
}

function cacheKey(query: string, language: Language): string {
  return `${language.code}:${query.trim().toLowerCase()}`;
}

function dedupeByVideoId(items: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.videoId)) return false;
    seen.add(item.videoId);
    return true;
  });
}

/** Beyond exact videoId matches, collapses different uploads of the same
 * song (official video / lyric video / audio-only, etc.) to one result. */
function dedupeByNormalizedTitle(items: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeTitle(item.title);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * YouTube API -> raw results -> duration filter -> music relevance filter ->
 * duplicate removal -> ISAIYA search results. Language priority comes from
 * the query itself (buildQuery appends the language's search keyword), so
 * results are already language-biased before any of these filters run.
 */
export async function searchSongs(
  query: string,
  language: Language,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  if (!YOUTUBE_API_KEY) {
    throw new YouTubeApiError('missingKey', 'YouTube search is not configured.');
  }

  const key = cacheKey(query, language);
  const cached = resultCache.get(key);
  if (cached) return cached;

  const fullQuery = buildQuery(query, language);
  const rawResults = await searchVideos(fullQuery, YOUTUBE_API_KEY, signal);

  let durations: Record<string, number> = {};
  try {
    durations = await fetchVideoDurations(rawResults.map((item) => item.videoId), YOUTUBE_API_KEY, signal);
  } catch {
    // Duration lookup is best-effort; the search itself still succeeds without it.
  }

  const withDuration: SearchResult[] = rawResults.map((item) => ({
    ...item,
    durationSeconds: durations[item.videoId] ?? null,
  }));

  const durationFiltered = withDuration.filter((item) => isSuitableDuration(item.durationSeconds));
  const musicFiltered = durationFiltered.filter((item) => isLikelyMusic(item.title));
  const deduped = dedupeByNormalizedTitle(dedupeByVideoId(musicFiltered));

  // Stable sort: surface stronger music-keyword matches first without
  // discarding weaker (but still valid) matches lower in the list.
  const results = [...deduped].sort((a, b) => musicRelevanceScore(b.title) - musicRelevanceScore(a.title));

  resultCache.set(key, results);
  if (resultCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = resultCache.keys().next().value;
    if (oldestKey !== undefined) resultCache.delete(oldestKey);
  }

  return results;
}
