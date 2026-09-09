import type { SearchIntent, Era } from '../types';
import type { LlmProvider } from './provider';
import { KNOWN_ARTISTS, KNOWN_SONGS, type KnownArtist, type KnownSong } from './musicKnowledge';

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function containsWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

function detectEra(text: string): Era | undefined {
  const t = normalize(text);
  if (/\b(old|80s|90s|classic|evergreen)\b/.test(t)) return 'older';
  if (/\b(latest|new|2024|2025|2026)\b/.test(t)) return 'latest';
  if (/\brecent\b/.test(t)) return 'recent';
  return undefined;
}

/** Prefers the artist whose matched alias is longest (most specific match wins). */
function matchArtist(text: string): KnownArtist | undefined {
  const t = normalize(text);
  let best: { artist: KnownArtist; aliasLength: number } | undefined;
  for (const artist of KNOWN_ARTISTS) {
    for (const alias of artist.aliases) {
      if (containsWord(t, alias) && (!best || alias.length > best.aliasLength)) {
        best = { artist, aliasLength: alias.length };
      }
    }
  }
  return best?.artist;
}

function matchSong(text: string): KnownSong | undefined {
  const t = normalize(text);
  return KNOWN_SONGS.find((song) => t.includes(normalize(song.title)) || normalize(song.title).includes(t));
}

const ARTIST_INTENT_WORDS = ['song', 'songs', 'hits', 'hit', 'music', 'melody', 'melodies'];

function buildFallbackIntent(query: string): SearchIntent {
  return { query, intent: 'unknown', searchQueries: [query] };
}

/**
 * Deterministic (no external API) implementation of the Search Agent.
 * Handles the common South Indian music query shapes explicitly: a known
 * song title, "<artist> songs/hits", or a bare known-artist name. Anything
 * it doesn't recognize resolves to intent "unknown" with the raw query
 * unchanged as the only search candidate — which is exactly today's
 * pre-agent behavior, so an unrecognized query is never worse off than
 * before the agent existed, and the existing relevance filtering on the
 * client remains the only thing deciding what counts as music.
 */
export class RuleBasedProvider implements LlmProvider {
  readonly name = 'rule-based';

  async resolveIntent(query: string, language?: string): Promise<SearchIntent> {
    const trimmed = query.trim();
    if (!trimmed) return buildFallbackIntent(trimmed);

    const era = detectEra(trimmed);
    const song = matchSong(trimmed);
    if (song) {
      return {
        query: trimmed,
        intent: 'song',
        artist: song.artist,
        language: (language as SearchIntent['language']) ?? song.language,
        searchQueries: [`${song.title} song`, `${song.title} ${song.artist} official`],
      };
    }

    const artist = matchArtist(trimmed);
    if (artist) {
      const looksLikeArtistQuery =
        ARTIST_INTENT_WORDS.some((word) => containsWord(trimmed, word)) || normalize(trimmed) === normalize(artist.shortName) || artist.aliases.some((alias) => normalize(trimmed) === alias);
      if (looksLikeArtistQuery) {
        const eraPrefix = era === 'older' ? 'old ' : era === 'latest' ? 'latest ' : '';
        return {
          query: trimmed,
          intent: 'artist',
          artist: artist.name,
          language: (language as SearchIntent['language']) ?? artist.language,
          era,
          searchQueries: [`${eraPrefix}${artist.shortName} songs`, `${artist.shortName} ${artist.language} songs`],
        };
      }
    }

    return buildFallbackIntent(trimmed);
  }

  async suggest(prefix: string, language?: string): Promise<string[]> {
    const p = normalize(prefix);
    if (p.length < 2) return [];

    const suggestions: string[] = [];

    for (const artist of KNOWN_ARTISTS) {
      if (language && artist.language !== language) continue;
      const matches = artist.aliases.some((alias) => alias.startsWith(p)) || normalize(artist.name).startsWith(p);
      if (!matches) continue;
      suggestions.push(artist.name, `${artist.shortName} songs`, `${artist.shortName} ${artist.language} songs`, `${artist.shortName} latest songs`);
    }

    for (const song of KNOWN_SONGS) {
      if (language && song.language !== language) continue;
      const words = normalize(song.title).split(/\s+/);
      if (words.some((word) => word.startsWith(p))) {
        suggestions.push(song.title, `${song.title} song`);
      }
    }

    return Array.from(new Set(suggestions)).slice(0, 6);
  }
}
