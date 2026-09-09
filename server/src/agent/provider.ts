import type { SearchIntent } from '../types';
import { RuleBasedProvider } from './ruleBasedProvider';

/**
 * Pluggable LLM provider seam. Only RuleBasedProvider (ruleBasedProvider.ts)
 * is implemented today — it needs no API key and runs entirely locally, so
 * the Search Agent is fully functional out of the box. To add a real LLM
 * later (e.g. Anthropic or OpenAI), implement this interface in a new file
 * and select it in getProvider() below via the LLM_PROVIDER env var. Every
 * provider must be resilient on its own; getProvider() additionally never
 * throws, so a misconfigured LLM_PROVIDER value just logs a warning and
 * falls back to the rule-based provider rather than breaking the server.
 */
export interface LlmProvider {
  readonly name: string;
  resolveIntent(query: string, language?: string): Promise<SearchIntent>;
  suggest(prefix: string, language?: string): Promise<string[]>;
}

let cachedProvider: LlmProvider | undefined;

export function getProvider(): LlmProvider {
  if (cachedProvider) return cachedProvider;

  const requested = (process.env.LLM_PROVIDER ?? 'rule-based').trim().toLowerCase();

  if (requested !== 'rule-based' && requested !== 'none' && requested !== '') {
    console.warn(
      `[search-agent] LLM_PROVIDER="${requested}" has no implementation registered yet; ` +
        'falling back to the rule-based provider. Add a real provider in provider.ts to enable it.'
    );
  }

  cachedProvider = new RuleBasedProvider();
  return cachedProvider;
}
