const NOISE_PATTERNS: RegExp[] = [
  /\(.*?\)/g,
  /\[.*?\]/g,
  /\|.*$/,
  /official\s*(music\s*)?video/gi,
  /official\s*audio/gi,
  /lyrics?\s*video/gi,
  /full\s*video\s*song/gi,
  /full\s*song/gi,
  /audio\s*song/gi,
  /video\s*song/gi,
  /\bhd\b/gi,
  /\b4k\b/gi,
];

/** Strips uploader noise (tags, quality markers, "official video", etc.) so
 * near-duplicate uploads of the same song normalize to the same key. */
export function normalizeTitle(title: string): string {
  let result = title.toLowerCase();
  for (const pattern of NOISE_PATTERNS) {
    result = result.replace(pattern, ' ');
  }
  return result.replace(/[^a-z0-9]+/g, ' ').trim();
}
