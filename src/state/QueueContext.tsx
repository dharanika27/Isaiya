import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SearchResult } from '../domain/searchResult';

interface QueueContextValue {
  current: SearchResult | null;
  upcoming: SearchResult[];
  hasNext: boolean;
  hasPrevious: boolean;
  playQueue: (items: SearchResult[], startIndex: number) => void;
  appendUpcoming: (items: SearchResult[]) => void;
  next: () => void;
  previous: () => void;
  removeUpcoming: (relativeIndex: number) => void;
  selectUpcoming: (relativeIndex: number) => void;
}

const QueueContext = createContext<QueueContextValue | undefined>(undefined);

function dedupeByVideoId(items: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.videoId)) return false;
    seen.add(item.videoId);
    return true;
  });
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const playQueue = useCallback((newItems: SearchResult[], startIndex: number) => {
    const deduped = dedupeByVideoId(newItems);
    const clampedIndex = deduped.length > 0 ? Math.max(0, Math.min(startIndex, deduped.length - 1)) : -1;
    setItems(deduped);
    setCurrentIndex(clampedIndex);
  }, []);

  const appendUpcoming = useCallback((newItems: SearchResult[]) => {
    setItems((prev) => {
      const existingIds = new Set(prev.map((entry) => entry.videoId));
      const additions = dedupeByVideoId(newItems).filter((entry) => !existingIds.has(entry.videoId));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((index) => (index >= 0 && index < items.length - 1 ? index + 1 : index));
  }, [items.length]);

  const previous = useCallback(() => {
    setCurrentIndex((index) => (index > 0 ? index - 1 : index));
  }, []);

  const removeUpcoming = useCallback(
    (relativeIndex: number) => {
      setItems((prev) => {
        const absoluteIndex = currentIndex + 1 + relativeIndex;
        if (absoluteIndex <= currentIndex || absoluteIndex >= prev.length) return prev;
        const copy = [...prev];
        copy.splice(absoluteIndex, 1);
        return copy;
      });
    },
    [currentIndex]
  );

  const selectUpcoming = useCallback((relativeIndex: number) => {
    setCurrentIndex((index) => index + 1 + relativeIndex);
  }, []);

  const current = currentIndex >= 0 ? items[currentIndex] ?? null : null;
  const upcoming = currentIndex >= 0 ? items.slice(currentIndex + 1) : [];

  const value = useMemo<QueueContextValue>(
    () => ({
      current,
      upcoming,
      hasNext: currentIndex >= 0 && currentIndex < items.length - 1,
      hasPrevious: currentIndex > 0,
      playQueue,
      appendUpcoming,
      next,
      previous,
      removeUpcoming,
      selectUpcoming,
    }),
    [
      current,
      upcoming,
      currentIndex,
      items.length,
      playQueue,
      appendUpcoming,
      next,
      previous,
      removeUpcoming,
      selectUpcoming,
    ]
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue(): QueueContextValue {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
