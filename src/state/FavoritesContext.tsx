import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '../data/local/storage';
import type { SearchResult } from '../domain/searchResult';
import type { LanguageCode } from '../domain/language';
import type { FavoriteItem } from '../domain/libraryItem';

const STORAGE_KEY = 'isaiya.favorites.v1';

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  loaded: boolean;
  isFavorite: (videoId: string) => boolean;
  toggleFavorite: (item: SearchResult, languageCode: LanguageCode) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readJson<FavoriteItem[]>(STORAGE_KEY, []).then((stored) => {
      setFavorites(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) writeJson(STORAGE_KEY, favorites);
  }, [favorites, loaded]);

  const isFavorite = useCallback(
    (videoId: string) => favorites.some((item) => item.videoId === videoId),
    [favorites]
  );

  const toggleFavorite = useCallback((item: SearchResult, languageCode: LanguageCode) => {
    setFavorites((prev) => {
      if (prev.some((entry) => entry.videoId === item.videoId)) {
        return prev.filter((entry) => entry.videoId !== item.videoId);
      }
      return [{ ...item, addedAt: Date.now(), languageCode }, ...prev];
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, loaded, isFavorite, toggleFavorite, clearFavorites }),
    [favorites, loaded, isFavorite, toggleFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
