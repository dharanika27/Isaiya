import type { SearchResult } from './searchResult';
import type { LanguageCode } from './language';

export interface FavoriteItem extends SearchResult {
  addedAt: number;
  languageCode: LanguageCode;
}

export interface RecentlyPlayedItem extends SearchResult {
  playedAt: number;
  languageCode: LanguageCode;
}
