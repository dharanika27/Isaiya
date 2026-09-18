import type { SearchIntent } from '../types';
import { RuleBasedProvider } from './ruleBasedProvider';
import { GeminiProvider } from './geminiProvider';

/**
 * Pluggable LLM provider seam. RuleBasedProvider (ruleBasedProvider.ts)
 * needs no API key and runs entirely locally, so the Search Agent is fully
 * functional out of the box. GeminiProvider (geminiProvider.ts) is a real
 * LLM provider selected via LLM_PROVIDER=gemini. To add another provider,
 * implement this interface in a new file and select it in getProvider()
 * below. Every provider must be resilient on its own — throw on failure,
 * don't swallow it — and getProvider() never throws itself, so a
 * misconfigured LLM_PROVIDER value or missing key just logs a warning and
 * falls back to the rule-based provider rather than breaking the server.
 */
export interface LlmProvider {
  readonly name: string;
  resolveIntent(query: string, language?: SearchIntent['language']): Promise<SearchIntent>;
  suggest(prefix: string, language?: SearchIntent['language']): Promise<string[]>;
}

/**
 * Tries each provider in order, falling through to the next on any failure.
 * This is the "Gemini -> RuleBasedProvider" half of the required fallback
 * chain; the final "-> fallbackIntent(originalQuery)" link is the route
 * handlers' own catch block (searchIntent.ts / suggestions.ts), which is
 * reached only if every provider in the chain throws.
 */
class FallbackChainProvider implements LlmProvider {
  readonly name: string;

  constructor(private readonly providers: LlmProvider[]) {
    this.name = `fallback-chain(${providers.map((p) => p.name).join(' -> ')})`;
  }

  async resolveIntent(query: string, language?: SearchIntent['language']): Promise<SearchIntent> {
    for (const provider of this.providers) {
      try {
        return await provider.resolveIntent(query, language);
      } catch (error) {
        console.warn(`[search-agent] ${provider.name}.resolveIntent failed, trying next provider:`, error);
      }
    }
    throw new Error('All providers in the fallback chain failed');
  }

  async suggest(prefix: string, language?: SearchIntent['language']): Promise<string[]> {
    for (const provider of this.providers) {
      try {
        return await provider.suggest(prefix, language);
      } catch (error) {
        console.warn(`[search-agent] ${provider.name}.suggest failed, trying next provider:`, error);
      }
    }
    throw new Error('All providers in the fallback chain failed');
  }
}

let cachedProvider: LlmProvider | undefined;

export function getProvider(): LlmProvider {
  if (cachedProvider) return cachedProvider;

  const requested = (process.env.LLM_PROVIDER ?? 'rule-based').trim().toLowerCase();
  const ruleBased = new RuleBasedProvider();

  if (requested === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.warn('[search-agent] LLM_PROVIDER="gemini" but GEMINI_API_KEY is not set; using the rule-based provider only.');
      cachedProvider = ruleBased;
    } else {
      const model = process.env.GEMINI_MODEL?.trim() || 'gemini-flash-latest';
      cachedProvider = new FallbackChainProvider([new GeminiProvider(apiKey, model), ruleBased]);
    }
  } else {
    if (requested !== 'rule-based' && requested !== 'none' && requested !== '') {
      console.warn(
        `[search-agent] LLM_PROVIDER="${requested}" has no implementation registered; ` +
          'falling back to the rule-based provider. Add a real provider in provider.ts to enable it.'
      );
    }
    cachedProvider = ruleBased;
  }

  return cachedProvider;
}
