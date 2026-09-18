import { SEARCH_AGENT_BASE_URL } from '../../config/env';
import type { SearchIntent, SearchIntentType, Era } from '../../domain/searchIntent';

const REQUEST_TIMEOUT_MS = 2500;

export class SearchAgentUnavailableError extends Error {}

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  if (!SEARCH_AGENT_BASE_URL) {
    throw new SearchAgentUnavailableError('Search Agent is not configured (EXPO_PUBLIC_SEARCH_AGENT_URL unset).');
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const onOuterAbort = () => timeoutController.abort();
  signal?.addEventListener('abort', onOuterAbort);

  try {
    const response = await fetch(`${SEARCH_AGENT_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timeoutController.signal,
    });
    if (!response.ok) {
      throw new SearchAgentUnavailableError(`Search Agent responded with ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SearchAgentUnavailableError) throw error;
    throw new SearchAgentUnavailableError(error instanceof Error ? error.message : 'Search Agent request failed');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onOuterAbort);
  }
}

const VALID_INTENT_TYPES: SearchIntentType[] = ['song', 'artist', 'unknown'];
const VALID_ERAS: Era[] = ['older', 'recent', 'latest'];

/** Runtime shape check — a malformed/unexpected response is treated as
 * unavailable rather than trusted, so client/server drift fails safe. */
function isValidSearchIntent(value: unknown): value is SearchIntent {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.query !== 'string') return false;
  if (typeof v.intent !== 'string' || !VALID_INTENT_TYPES.includes(v.intent as SearchIntentType)) return false;
  if (!Array.isArray(v.searchQueries) || v.searchQueries.length === 0 || !v.searchQueries.every((q) => typeof q === 'string')) return false;
  if (v.artist !== undefined && typeof v.artist !== 'string') return false;
  if (v.era !== undefined && !VALID_ERAS.includes(v.era as Era)) return false;
  return true;
}

export async function fetchSearchIntent(query: string, language: string | undefined, signal?: AbortSignal): Promise<SearchIntent> {
  const data = await postJson<unknown>('/api/search-intent', { query, language }, signal);
  if (!isValidSearchIntent(data)) {
    throw new SearchAgentUnavailableError('Search Agent returned a malformed intent.');
  }
  return data;
}

export async function fetchSuggestions(prefix: string, language: string | undefined, signal?: AbortSignal): Promise<string[]> {
  const data = await postJson<unknown>('/api/search-suggestions', { prefix, language }, signal);
  const suggestions = (data as { suggestions?: unknown })?.suggestions;
  if (!Array.isArray(suggestions) || !suggestions.every((s) => typeof s === 'string')) {
    throw new SearchAgentUnavailableError('Search Agent returned malformed suggestions.');
  }
  return suggestions;
}
