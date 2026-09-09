export const MIN_MUSIC_DURATION_SECONDS = 60;
export const MAX_MUSIC_DURATION_SECONDS = 15 * 60;

/** Shorts (<60s) and movies/interviews/long-form content (>15min) are excluded.
 * Unknown duration (lookup failed) is never penalized. */
export function isSuitableDuration(durationSeconds: number | null): boolean {
  if (durationSeconds === null) return true;
  return durationSeconds >= MIN_MUSIC_DURATION_SECONDS && durationSeconds <= MAX_MUSIC_DURATION_SECONDS;
}

/** Only a result scoring at or above this is confident enough to be "a song".
 * Calibrated against ~150 real YouTube results (see PR discussion): at this
 * threshold, every Angular/Python tutorial in a live test was excluded while
 * genuine songs (including bare-title official uploads) still passed. */
export const MUSIC_RELEVANCE_THRESHOLD = 2;

const MUSIC_CATEGORY_ID = '10';

/** Categories that are structurally never music. Deliberately excludes
 * Entertainment (24) and People & Blogs (22): live testing showed real
 * official film-song uploads and lyric/dance-cover videos routinely get
 * tagged under those two, so treating them as negative would reject
 * legitimate songs. */
const NEGATIVE_CATEGORY_IDS = new Set(['15', '17', '19', '20', '25', '26', '27', '28']);

const TITLE_POSITIVE_KEYWORDS = ['song', 'video song', 'music', 'audio', 'lyrical', 'lyrics', 'lyric', 'official', 'jukebox'];

/** Reliable, structural channel signals rather than a content blocklist:
 * "- Topic" is a suffix YouTube itself auto-generates only for channels
 * backing legitimate rights-holder music releases (never for tutorials). */
const CHANNEL_POSITIVE_PATTERNS = ['vevo', 'music', 'records', 'sound', 'saregama', 'entertainment'];

/**
 * Compact, concept-level negative signal list — one entry per non-music
 * category the user named (tutorials, courses, lessons, coding/programming,
 * interviews, podcasts, reviews, reactions, gaming, news, travel/tourism,
 * vlogs, documentaries, lectures, explanations), plus a handful of terms
 * empirically observed (live-tested) to be near-universal in tutorial titles
 * ("learn"/"learning", "beginner(s)", "roadmap"). This is a small, named,
 * traceable list — not a sprawling blocklist — and it is only ever used as
 * one signal among several in a combined score, never as a standalone gate.
 */
const NEGATIVE_SIGNALS = [
  'tutorial',
  'tutorials',
  'course',
  'courses',
  'crash course',
  'full course',
  'lesson',
  'lessons',
  'lecture',
  'lectures',
  'programming',
  'coding',
  'developer',
  'framework',
  'interview',
  'interviews',
  'podcast',
  'podcasts',
  'review',
  'reviews',
  'reaction',
  'reactions',
  'gaming',
  'gameplay',
  'walkthrough',
  'news',
  'travel',
  'tourism',
  'vlog',
  'vlogs',
  'documentary',
  'documentaries',
  'explained',
  'explanation',
  'explanations',
  'learn',
  'learning',
  'beginner',
  'beginners',
  'roadmap',
  'webinar',
  'workshop',
  'training',
  'class',
  'classes',
  'masterclass',
  'bootcamp',
  'how to',
  'playlist',
  'compilation',
];

function containsPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function hasAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => containsPhrase(text, phrase));
}

export interface MusicRelevanceInput {
  title: string;
  description: string;
  channelTitle: string;
  categoryId: string | null;
  liveBroadcastContent: string;
}

/**
 * Combined music-relevance score: category metadata + title/description/
 * channel positive and negative signals + live-broadcast status. Higher is
 * more confident. Callers should keep only results at or above
 * MUSIC_RELEVANCE_THRESHOLD, and may sort by this score to rank the most
 * confident matches first among those.
 */
export function computeMusicRelevance(input: MusicRelevanceInput): number {
  const { title, description, channelTitle, categoryId, liveBroadcastContent } = input;
  let score = 0;

  if (categoryId === MUSIC_CATEGORY_ID) score += 3;
  if (categoryId !== null && NEGATIVE_CATEGORY_IDS.has(categoryId)) score -= 6;

  if (channelTitle.trim().toLowerCase().endsWith('- topic')) score += 4;
  if (hasAny(channelTitle, CHANNEL_POSITIVE_PATTERNS)) score += 2;
  if (hasAny(channelTitle, NEGATIVE_SIGNALS)) score -= 5;

  if (hasAny(title, TITLE_POSITIVE_KEYWORDS)) score += 2;
  if (hasAny(title, NEGATIVE_SIGNALS)) score -= 6;

  if (hasAny(description, NEGATIVE_SIGNALS)) score -= 3;

  if (liveBroadcastContent !== 'none') score -= 5;

  return score;
}
