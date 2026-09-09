import { YOUTUBE_API_KEY } from '../../config/env';
import type { Language } from '../../domain/language';
import type { SearchResult } from '../../domain/searchResult';
import { normalizeTitle } from '../../utils/text';
import { computeMusicRelevance, isSuitableDuration, MUSIC_RELEVANCE_THRESHOLD } from '../../utils/musicRelevance';
import { fetchVideoMetadata, searchVideos, YouTubeApiError, type RawSearchItem } from '../remote/youtubeApi';

const MAX_CACHE_ENTRIES = 20;
const resultCache = new Map<string, SearchResult[]>();

function buildQuery(query: string, language: Language): string {
  return language.searchKeyword ? `${query} ${language.searchKeyword}` : query;
}

function cacheKey(query: string, language: Language): string {
  return `${language.code}:${query.trim().toLowerCase()}`;
}

interface ScoredCandidate extends RawSearchItem {
  durationSeconds: number | null;
  score: number;
}

function dedupeByVideoId<T extends { videoId: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.videoId)) return false;
    seen.add(item.videoId);
    return true;
  });
}

/** Beyond exact videoId matches, collapses different uploads of the same
 * song (official video / lyric video / audio-only, etc.) to one result. */
function dedupeByNormalizedTitle<T extends { title: string }>(items: T[]): T[] {
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
 * ISAIYA is a music search engine, not a general YouTube search: this
 * pipeline is YouTube API -> raw results -> duration filter (60s-15min) ->
 * music relevance scoring (category + title/description/channel signals,
 * see musicRelevance.ts) -> strict confidence threshold (results below it
 * are dropped entirely, not just ranked lower) -> duplicate removal -> final
 * results, ranked by confidence. videoCategoryId=10 is deliberately NOT used
 * as a query-time restriction (live testing showed it neither reliably
 * excludes mistagged tutorials nor reliably includes mistagged songs) — it's
 * only one input to the relevance score, computed per-result. Language
 * priority comes from the query itself (buildQuery appends the language's
 * search keyword). If nothing survives the threshold, this returns an empty
 * array rather than backfilling with low-confidence results.
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

  let metadata: Record<string, { durationSeconds: number | null; categoryId: string | null }> = {};
  try {
    metadata = await fetchVideoMetadata(rawResults.map((item) => item.videoId), YOUTUBE_API_KEY, signal);
  } catch {
    // Metadata lookup is best-effort; items just fall back to unknown duration/category below.
  }

  const withMetadata = rawResults.map((item) => ({
    item,
    durationSeconds: metadata[item.videoId]?.durationSeconds ?? null,
    categoryId: metadata[item.videoId]?.categoryId ?? null,
  }));

  const durationFiltered = withMetadata.filter((entry) => isSuitableDuration(entry.durationSeconds));

  const scored: ScoredCandidate[] = durationFiltered.map((entry) => ({
    ...entry.item,
    durationSeconds: entry.durationSeconds,
    score: computeMusicRelevance({
      title: entry.item.title,
      description: entry.item.description,
      channelTitle: entry.item.channelTitle,
      categoryId: entry.categoryId,
      liveBroadcastContent: entry.item.liveBroadcastContent,
    }),
  }));

  const confident = scored.filter((entry) => entry.score >= MUSIC_RELEVANCE_THRESHOLD);
  confident.sort((a, b) => b.score - a.score);

  const deduped = dedupeByNormalizedTitle(dedupeByVideoId(confident));

  const results: SearchResult[] = deduped.map((entry) => ({
    videoId: entry.videoId,
    title: entry.title,
    channelTitle: entry.channelTitle,
    thumbnailUrl: entry.thumbnailUrl,
    durationSeconds: entry.durationSeconds,
  }));

  resultCache.set(key, results);
  if (resultCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = resultCache.keys().next().value;
    if (oldestKey !== undefined) resultCache.delete(oldestKey);
  }

  return results;
}
