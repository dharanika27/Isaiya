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
