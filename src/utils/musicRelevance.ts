export const MIN_MUSIC_DURATION_SECONDS = 60;
export const MAX_MUSIC_DURATION_SECONDS = 15 * 60;

/** Shorts (<60s) and movies/interviews/long-form content (>15min) are excluded.
 * Unknown duration (lookup failed) is never penalized. */
export function isSuitableDuration(durationSeconds: number | null): boolean {
  if (durationSeconds === null) return true;
  return durationSeconds >= MIN_MUSIC_DURATION_SECONDS && durationSeconds <= MAX_MUSIC_DURATION_SECONDS;
}

const POSITIVE_KEYWORDS = ['song', 'video song', 'music', 'audio', 'lyrical', 'lyrics', 'official', 'jukebox'];

/**
 * Strong signals that a result is definitely not a standalone song, even if
 * a positive keyword also happens to appear in the title (e.g. an "audio
 * launch event" or a coding "song" joke video). These always exclude.
 *
 * Deliberately does NOT include "movie" — Indian song titles routinely
 * reference the film they're from (e.g. "<Movie> Video Song"), and that's a
 * legitimate naming style, not a signal the result is a trailer or clip.
 */
const HARD_NEGATIVE_KEYWORDS = [
  // film/promo content
  'trailer',
  'teaser',
  'episode',
  'episodes',
  'interview',
  'review',
  'reviews',
  'web series',
  'promo',
  'making of',
  'behind the scenes',
  'live match',
  'press meet',
  'reaction',
  'troll',
  'highlights',
  'spoof',
  'shorts',
  // tech/education/talk content (e.g. a plain "Angular" search should not surface these)
  'tutorial',
  'tutorials',
  'course',
  'courses',
  'crash course',
  'full course',
  'masterclass',
  'bootcamp',
  'lecture',
  'lesson',
  'lessons',
  'class',
  'classes',
  'training',
  'workshop',
  'webinar',
  'programming',
  'coding',
  'developer',
  'framework',
  'tech',
  'technology',
  'explained',
  'how to',
  'tips and tricks',
  'podcast',
  'podcasts',
  'documentary',
  'vlog',
  'unboxing',
  'gameplay',
  'walkthrough',
  // compilation/playlist-style single uploads (true YouTube playlists are
  // already excluded upstream via the search API's type=video parameter)
  'playlist',
  'playlists',
  'compilation',
];

function containsPhrase(title: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(title);
}

function hasAnyKeyword(title: string, keywords: string[]): boolean {
  return keywords.some((keyword) => containsPhrase(title, keyword));
}

/**
 * Strict rule-based music relevance filter: a result must clearly look like
 * an individual song/music/audio/lyrical/video-song upload to pass. A hard
 * negative signal (tutorial, course, tech, podcast, trailer, playlist, ...)
 * always excludes, even over a coincidental positive match. Otherwise, a
 * positive music keyword is required — an unrelated query (e.g. "Angular")
 * with no music signal at all is excluded rather than kept by default.
 */
export function isLikelyMusic(title: string): boolean {
  if (hasAnyKeyword(title, HARD_NEGATIVE_KEYWORDS)) return false;
  return hasAnyKeyword(title, POSITIVE_KEYWORDS);
}

/** Number of positive music keywords matched, used to rank stronger music
 * signals first among results that already passed isLikelyMusic. */
export function musicRelevanceScore(title: string): number {
  return POSITIVE_KEYWORDS.reduce((score, keyword) => (containsPhrase(title, keyword) ? score + 1 : score), 0);
}
