import { useEffect, useState } from 'react';
import { getSuggestions } from '../data/repository/searchAgentRepository';
import type { Language } from '../domain/language';

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

/** Search-as-you-type suggestions. Debounced independently from the actual
 * search (useYoutubeSearch), and never throws — getSuggestions() already
 * degrades to an empty list if the Search Agent is unavailable. */
export function useSearchSuggestions(query: string, language: Language, enabled: boolean): string[] {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!enabled || trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const debounceId = setTimeout(async () => {
      const result = await getSuggestions(trimmed, language, controller.signal);
      if (!controller.signal.aborted) setSuggestions(result);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [query, language, enabled]);

  return suggestions;
}
