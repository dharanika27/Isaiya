import { toSearchAgentLanguage, type Language } from '../../domain/language';
import { fallbackIntent, type SearchIntent } from '../../domain/searchIntent';
import { fetchSearchIntent, fetchSuggestions } from '../remote/searchAgentApi';

const MAX_CACHE_ENTRIES = 30;
const intentCache = new Map<string, SearchIntent>();
const suggestionsCache = new Map<string, string[]>();

function setWithLimit<V>(cache: Map<string, V>, key: string, value: V): void {
  cache.set(key, value);
  if (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
}

function cacheKey(text: string, language: Language): string {
  return `${language.code}:${text.trim().toLowerCase()}`;
}

/**
 * The Search Agent module. Independent from UI — no React imports here.
 * This is the only place that decides what to do when the AI backend is
 * unavailable: every method here is safe to call even if the backend has
 * never been configured (SEARCH_AGENT_BASE_URL unset), is down, or times
 * out. Callers never need their own try/catch for agent failures.
 *
 * This module never decides which YouTube videos are valid — it only
 * proposes query strings and suggestion text. The existing search pipeline
 * (youtubeRepository.searchSongs) remains the sole source of truth for
 * results.
 */

/** Resolves a search query into structured intent. On any failure, returns
 * a trivial intent (`{ intent: 'unknown', searchQueries: [query] }`) —
 * identical to today's exact pre-agent search behavior. */
export async function resolveSearchIntent(query: string, language: Language, signal?: AbortSignal): Promise<SearchIntent> {
  const trimmed = query.trim();
  if (!trimmed) return fallbackIntent(trimmed);

  const key = cacheKey(trimmed, language);
  const cached = intentCache.get(key);
  if (cached) return cached;

  try {
    const intent = await fetchSearchIntent(trimmed, toSearchAgentLanguage(language.code), signal);
    setWithLimit(intentCache, key, intent);
    return intent;
  } catch {
    // Search Agent unavailable/slow/malformed: fall back silently rather
    // than surface an error. Deliberately not cached, so a transient outage
    // doesn't stick once the agent recovers.
    return fallbackIntent(trimmed);
  }
}

/** Autocomplete suggestions for a partial query. On any failure, returns an
 * empty list — the suggestions UI simply has nothing to show, never an
 * error state, and normal search is entirely unaffected. */
export async function getSuggestions(prefix: string, language: Language, signal?: AbortSignal): Promise<string[]> {
  const trimmed = prefix.trim();
  if (trimmed.length < 2) return [];

  const key = cacheKey(trimmed, language);
  const cached = suggestionsCache.get(key);
  if (cached) return cached;

  try {
    const suggestions = await fetchSuggestions(trimmed, toSearchAgentLanguage(language.code), signal);
    setWithLimit(suggestionsCache, key, suggestions);
    return suggestions;
  } catch {
    return [];
  }
}
