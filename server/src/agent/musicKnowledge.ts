export interface KnownArtist {
  name: string;
  /** Short, natural form used when building suggestion text, e.g. "Anirudh" for "Anirudh Ravichander". */
  shortName: string;
  aliases: string[];
  language: 'Tamil' | 'Telugu' | 'Malayalam';
}

export interface KnownSong {
  title: string;
  artist: string;
  language: 'Tamil' | 'Telugu' | 'Malayalam';
}

/**
 * Small, curated dataset used only to make the deterministic (no-LLM)
 * search agent useful for common South Indian music queries out of the box.
 * This is a positive suggestion/lookup list, not a content filter — it has
 * no bearing on which YouTube videos are ultimately accepted, that is still
 * decided entirely by the existing music relevance scoring pipeline.
 *
 * Deliberately small and easy to extend. A real LLM provider (see
 * provider.ts) can eventually handle the long tail this list doesn't cover.
 */
export const KNOWN_ARTISTS: KnownArtist[] = [
  { name: 'Anirudh Ravichander', shortName: 'Anirudh', aliases: ['anirudh', 'anirudh ravichander'], language: 'Tamil' },
  { name: 'Vijay', shortName: 'Vijay', aliases: ['vijay', 'thalapathy vijay', 'thalapathy'], language: 'Tamil' },
  { name: 'A.R. Rahman', shortName: 'A.R. Rahman', aliases: ['arr', 'a.r. rahman', 'ar rahman', 'a r rahman', 'rahman'], language: 'Tamil' },
  { name: 'Yuvan Shankar Raja', shortName: 'Yuvan', aliases: ['yuvan', 'yuvan shankar raja', 'yuvanshankar'], language: 'Tamil' },
  { name: 'Ilaiyaraaja', shortName: 'Ilaiyaraaja', aliases: ['ilaiyaraaja', 'ilayaraja', 'raja sir'], language: 'Tamil' },
  { name: 'G.V. Prakash Kumar', shortName: 'GV Prakash', aliases: ['gv prakash', 'g.v. prakash', 'gvprakash'], language: 'Tamil' },
  { name: 'Devi Sri Prasad', shortName: 'DSP', aliases: ['dsp', 'devi sri prasad'], language: 'Telugu' },
  { name: 'Thaman S', shortName: 'Thaman', aliases: ['thaman', 'thaman s'], language: 'Telugu' },
];

export const KNOWN_SONGS: KnownSong[] = [
  { title: 'Hukum', artist: 'Anirudh Ravichander', language: 'Tamil' },
  { title: 'Why This Kolaveri Di', artist: 'Anirudh Ravichander', language: 'Tamil' },
  { title: 'Vaathi Coming', artist: 'Anirudh Ravichander', language: 'Tamil' },
  { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', language: 'Tamil' },
  { title: 'Rowdy Baby', artist: 'Dhanush', language: 'Tamil' },
  { title: 'Vaathi Raid', artist: 'Anirudh Ravichander', language: 'Tamil' },
  { title: 'Naatu Naatu', artist: 'M.M. Keeravani', language: 'Telugu' },
];
