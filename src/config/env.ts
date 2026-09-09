export const YOUTUBE_API_KEY: string | null = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim() || null;

export const hasYouTubeApiKey = YOUTUBE_API_KEY !== null;

/** Base URL of the ISAIYA Search API (server/). Not a secret — it's just an
 * address, the same way EXPO_PUBLIC_* vars already work for this app. When
 * unset, the Search Agent is simply unavailable and every search falls back
 * to today's exact pre-agent behavior (see searchAgentRepository.ts). */
export const SEARCH_AGENT_BASE_URL: string | null = process.env.EXPO_PUBLIC_SEARCH_AGENT_URL?.trim() || null;
