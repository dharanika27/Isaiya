import { Router } from 'express';
import { getProvider } from '../agent/provider';
import { TtlCache } from '../cache';
import type { SearchIntent, SearchIntentRequest } from '../types';

const INTENT_CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new TtlCache<SearchIntent>(INTENT_CACHE_TTL_MS);

function cacheKey(query: string, language?: string): string {
  return `${language ?? ''}:${query.trim().toLowerCase()}`;
}

export const searchIntentRouter = Router();

searchIntentRouter.post('/api/search-intent', async (req, res) => {
  const body = req.body as Partial<SearchIntentRequest>;
  const query = typeof body.query === 'string' ? body.query.trim() : '';

  if (!query) {
    res.status(400).json({ error: 'query is required' });
    return;
  }

  const language = typeof body.language === 'string' ? body.language : undefined;
  const key = cacheKey(query, language);
  const cached = cache.get(key);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const intent = await getProvider().resolveIntent(query, language);
    cache.set(key, intent);
    res.json(intent);
  } catch (error) {
    console.error('[search-agent] resolveIntent failed', error);
    // Fail safe: the client already has its own fallback, but return a
    // trivial intent anyway so a well-behaved client never has to guess.
    res.json({ query, intent: 'unknown', searchQueries: [query] } satisfies SearchIntent);
  }
});
