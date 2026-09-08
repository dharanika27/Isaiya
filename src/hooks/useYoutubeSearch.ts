import { useEffect, useState } from 'react';
import { searchSongs } from '../data/repository/youtubeRepository';
import { YouTubeApiError } from '../data/remote/youtubeApi';
import type { Language } from '../domain/language';
import type { SearchResult } from '../domain/searchResult';

const DEBOUNCE_MS = 450;
const TIMEOUT_MS = 10000;
const MIN_QUERY_LENGTH = 2;

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: SearchResult[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

function toErrorMessage(error: unknown): string {
  if (error instanceof YouTubeApiError) {
    switch (error.reason) {
      case 'missingKey':
        return 'YouTube search is not configured yet.';
      case 'quota':
        return 'YouTube search is temporarily unavailable due to usage limits. Please try again later.';
      case 'network':
        return 'No internet connection. Please check your connection and try again.';
      case 'timeout':
        return 'This is taking longer than expected. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

export function useYoutubeSearch(query: string, language: Language, retryToken = 0): SearchState {
  const [state, setState] = useState<SearchState>({ status: 'idle' });

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setState({ status: 'idle' });
      return;
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    const debounceId = setTimeout(async () => {
      setState({ status: 'loading' });
      try {
        const results = await searchSongs(trimmed, language, controller.signal);
        setState(results.length > 0 ? { status: 'success', results } : { status: 'empty' });
      } catch (error) {
        if (controller.signal.aborted && !timedOut) return;
        const mappedError = timedOut ? new YouTubeApiError('timeout', 'Timed out.') : error;
        setState({ status: 'error', message: toErrorMessage(mappedError) });
      } finally {
        clearTimeout(timeoutId);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceId);
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, language, retryToken]);

  return state;
}
