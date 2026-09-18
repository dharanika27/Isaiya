export type LanguageCode = 'TAMIL' | 'TELUGU' | 'MALAYALAM' | 'ALL';

export interface Language {
  code: LanguageCode;
  label: string;
  searchKeyword: string | null;
}

export const LANGUAGES: Language[] = [
  { code: 'TAMIL', label: 'தமிழ்', searchKeyword: 'Tamil song' },
  { code: 'TELUGU', label: 'తెలుగు', searchKeyword: 'Telugu song' },
  { code: 'MALAYALAM', label: 'മലയാളം', searchKeyword: 'Malayalam song' },
  { code: 'ALL', label: 'All', searchKeyword: 'song' },
];

/** Maps this app's LanguageCode ('TAMIL', all-caps) to the Search Agent's
 * vocabulary ('Tamil', title-case, matching server/src/agent/musicKnowledge.ts).
 * 'ALL' maps to undefined (no language hint) since it isn't a specific
 * language the agent's artist/song dataset can match against. */
export function toSearchAgentLanguage(code: LanguageCode): 'Tamil' | 'Telugu' | 'Malayalam' | undefined {
  switch (code) {
    case 'TAMIL':
      return 'Tamil';
    case 'TELUGU':
      return 'Telugu';
    case 'MALAYALAM':
      return 'Malayalam';
    case 'ALL':
      return undefined;
  }
}
