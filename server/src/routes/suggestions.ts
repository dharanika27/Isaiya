import { Router } from 'express';
import { getProvider } from '../agent/provider';
import { TtlCache } from '../cache';
import type { SuggestionsRequest } from '../types';

const SUGGESTIONS_CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new TtlCache<string[]>(SUGGESTIONS_CACHE_TTL_MS);

function cacheKey(prefix: string, language?: string): string {
  return `${language ?? ''}:${prefix.trim().toLowerCase()}`;
}

export const suggestionsRouter = Router();

suggestionsRouter.post('/api/search-suggestions', async (req, res) => {
  const body = req.body as Partial<SuggestionsRequest>;
  const prefix = typeof body.prefix === 'string' ? body.prefix.trim() : '';

  if (prefix.length < 2) {
    res.json({ suggestions: [] });
    return;
  }

  const language = typeof body.language === 'string' ? body.language : undefined;
  const key = cacheKey(prefix, language);
  const cached = cache.get(key);
  if (cached) {
    res.json({ suggestions: cached });
    return;
  }

  try {
    const suggestions = await getProvider().suggest(prefix, language);
    cache.set(key, suggestions);
    res.json({ suggestions });
  } catch (error) {
    console.error('[search-agent] suggest failed', error);
    res.json({ suggestions: [] });
  }
});
