import { GoogleGenAI, Type } from '@google/genai';
import type { Era, SearchIntent, SearchIntentType } from '../types';
import type { LlmProvider } from './provider';

const DEFAULT_TIMEOUT_MS = 2000;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  description: 'Structured understanding of a South Indian music search query.',
  properties: {
    intent: {
      type: Type.STRING,
      enum: ['song', 'artist', 'unknown'],
      description:
        '"song" for a specific song title, "artist" for an artist/singer/composer name or "<artist> songs/hits", ' +
        '"unknown" if the query has no clear music intent (e.g. a programming language, framework, or unrelated topic).',
    },
    artist: {
      type: Type.STRING,
      description: 'The artist/singer/composer name, only if identifiable. Omit otherwise.',
    },
    language: {
      type: Type.STRING,
      enum: ['Tamil', 'Telugu', 'Malayalam'],
      description: 'The music language, only if identifiable from the query itself. Omit otherwise.',
    },
    era: {
      type: Type.STRING,
      enum: ['older', 'recent', 'latest'],
      description: 'Only if the query mentions an era (e.g. "old", "classic", "latest", "new"). Omit otherwise.',
    },
    searchQueries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: '1',
      maxItems: '2',
      description: 'Up to 2 concrete YouTube search strings likely to find the actual song(s) the user means.',
    },
  },
  required: ['intent', 'searchQueries'],
};

function buildPrompt(query: string, language?: SearchIntent['language']): string {
  return [
    'You understand South Indian (Tamil, Telugu, Malayalam) music search queries for a music discovery app.',
    'Classify the query and propose YouTube search strings that would find the actual song(s) the user means.',
    'Never invent a music intent for a query that is clearly not about music (e.g. a programming language, ' +
      'framework, or general tech/non-music topic) — classify those as "unknown" and use the original query as ' +
      'the only search string.',
    language ? `The user currently has "${language}" selected as their preferred language.` : '',
    `Query: ${JSON.stringify(query)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

const VALID_INTENTS: SearchIntentType[] = ['song', 'artist', 'unknown'];
const VALID_LANGUAGES: NonNullable<SearchIntent['language']>[] = ['Tamil', 'Telugu', 'Malayalam'];
const VALID_ERAS: Era[] = ['older', 'recent', 'latest'];

/** Strict runtime validation of Gemini's output. Anything that doesn't match
 * exactly throws, which the caller (FallbackChainProvider, see provider.ts)
 * treats as a normal provider failure and falls through to RuleBasedProvider.
 * Malformed/invalid output must never reach the UI. */
function parseAndValidate(query: string, raw: string): SearchIntent {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Gemini response was not valid JSON');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('Gemini response was not a JSON object');
  }
  const v = data as Record<string, unknown>;

  if (typeof v.intent !== 'string' || !VALID_INTENTS.includes(v.intent as SearchIntentType)) {
    throw new Error('Gemini response missing a valid "intent"');
  }
  if (
    !Array.isArray(v.searchQueries) ||
    v.searchQueries.length === 0 ||
    !v.searchQueries.every((q) => typeof q === 'string' && q.trim().length > 0)
  ) {
    throw new Error('Gemini response missing valid "searchQueries"');
  }
  if (v.artist !== undefined && typeof v.artist !== 'string') {
    throw new Error('Gemini response "artist" must be a string');
  }
  if (v.language !== undefined && !VALID_LANGUAGES.includes(v.language as NonNullable<SearchIntent['language']>)) {
    throw new Error('Gemini response "language" is not a recognized value');
  }
  if (v.era !== undefined && !VALID_ERAS.includes(v.era as Era)) {
    throw new Error('Gemini response "era" is not a recognized value');
  }

  return {
    query,
    intent: v.intent as SearchIntentType,
    artist: v.artist as string | undefined,
    language: v.language as SearchIntent['language'],
    era: v.era as Era | undefined,
    searchQueries: (v.searchQueries as string[]).slice(0, 2),
  };
}

/**
 * Gemini-backed query understanding. Gemini's ONLY job is to classify
 * intent and propose search query strings — it never decides whether a
 * YouTube result is music. That stays entirely with the existing,
 * empirically-calibrated musicRelevance pipeline on the client
 * (untouched by this file).
 *
 * Any failure — missing key, network error, timeout, rate limit, or a
 * malformed/invalid response — throws. This class does not implement its
 * own fallback; FallbackChainProvider (provider.ts) is what falls through
 * to RuleBasedProvider, and the route handlers are the final safety net
 * that returns a trivial fallbackIntent. Nothing here ever surfaces an LLM
 * error to the UI.
 */
export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini';
  private readonly client: GoogleGenAI;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(apiKey: string, model: string, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async resolveIntent(query: string, language?: SearchIntent['language']): Promise<SearchIntent> {
    const trimmed = query.trim();
    if (!trimmed) throw new Error('Empty query');

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: buildPrompt(trimmed, language),
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        httpOptions: { timeout: this.timeoutMs },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini returned no text output');
    return parseAndValidate(trimmed, text);
  }

  /**
   * Deliberately not implemented: autocomplete must stay fast, cheap, and
   * safe to call on every debounced keystroke — calling an LLM per
   * suggestion request would violate that. RuleBasedProvider (or a future
   * dedicated suggestion source) always handles suggest(); in the fallback
   * chain this simply throws immediately so the next provider is used.
   */
  async suggest(): Promise<string[]> {
    throw new Error('GeminiProvider does not implement suggest()');
  }
}
