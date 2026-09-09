export type SearchIntentType = 'song' | 'artist' | 'unknown';

export type Era = 'older' | 'recent' | 'latest';

/**
 * Structured understanding of a search query, returned by the Search Agent
 * backend (server/). This is advisory only — it tells searchSongs() which
 * query strings to try. It never decides which YouTube videos are valid;
 * that is still decided entirely by the existing music relevance scoring in
 * youtubeRepository.ts/musicRelevance.ts, unchanged.
 *
 * Keep in sync with server/src/types.ts. If the two drift, searchAgentApi's
 * shape check just treats a malformed response as a failure and falls back
 * to deterministic search, so drift fails safe rather than crashing.
 */
export interface SearchIntent {
  query: string;
  intent: SearchIntentType;
  artist?: string;
  language?: 'Tamil' | 'Telugu' | 'Malayalam';
  era?: Era;
  /** Ranked candidate query strings to try, most specific first. Always
   * has at least one entry (falls back to the raw query). */
  searchQueries: string[];
}

/** Used whenever the Search Agent is unavailable, slow, or returns something
 * malformed — identical in effect to today's pre-agent search behavior. */
export function fallbackIntent(query: string): SearchIntent {
  return { query, intent: 'unknown', searchQueries: [query] };
}
