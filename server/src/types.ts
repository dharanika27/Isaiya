export type SearchIntentType = 'song' | 'artist' | 'unknown';

export type Era = 'older' | 'recent' | 'latest';

/**
 * Structured understanding of a search query. This is advisory only: it
 * tells the Expo app which query strings to try against the existing
 * YouTube search pipeline. It never decides which videos are valid — that
 * stays entirely with the existing music relevance scoring on the client.
 *
 * Keep this in sync with src/domain/searchIntent.ts on the Expo side. There
 * is no shared package on purpose (this backend is meant to stay minimal);
 * if the two drift, the client's zod-free runtime shape check in
 * searchAgentApi.ts will just treat a malformed response as a failure and
 * fall back to deterministic search, so drift fails safe.
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

export interface SearchIntentRequest {
  query: string;
  language?: string;
}

export interface SuggestionsRequest {
  prefix: string;
  language?: string;
}

export interface SuggestionsResponse {
  suggestions: string[];
}
