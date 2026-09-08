import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '../data/local/storage';
import type { SearchResult } from '../domain/searchResult';
import type { LanguageCode } from '../domain/language';
import type { RecentlyPlayedItem } from '../domain/libraryItem';

const STORAGE_KEY = 'isaiya.recentlyPlayed.v1';
const MAX_ENTRIES = 50;

interface RecentlyPlayedContextValue {
  recentlyPlayed: RecentlyPlayedItem[];
  loaded: boolean;
  recordPlayed: (item: SearchResult, languageCode: LanguageCode) => void;
  clearHistory: () => void;
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextValue | undefined>(undefined);

export function RecentlyPlayedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readJson<RecentlyPlayedItem[]>(STORAGE_KEY, []).then((stored) => {
      setRecentlyPlayed(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) writeJson(STORAGE_KEY, recentlyPlayed);
  }, [recentlyPlayed, loaded]);

  const recordPlayed = useCallback((item: SearchResult, languageCode: LanguageCode) => {
    setRecentlyPlayed((prev) => {
      const withoutDuplicate = prev.filter((entry) => entry.videoId !== item.videoId);
      return [{ ...item, playedAt: Date.now(), languageCode }, ...withoutDuplicate].slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => setRecentlyPlayed([]), []);

  const value = useMemo<RecentlyPlayedContextValue>(
    () => ({ recentlyPlayed, loaded, recordPlayed, clearHistory }),
    [recentlyPlayed, loaded, recordPlayed, clearHistory]
  );

  return <RecentlyPlayedContext.Provider value={value}>{children}</RecentlyPlayedContext.Provider>;
}

export function useRecentlyPlayed(): RecentlyPlayedContextValue {
  const context = useContext(RecentlyPlayedContext);
  if (!context) {
    throw new Error('useRecentlyPlayed must be used within a RecentlyPlayedProvider');
  }
  return context;
}
