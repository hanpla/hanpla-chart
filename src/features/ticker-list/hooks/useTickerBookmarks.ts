import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "ps_market_bookmarks";

/**
 * Hook to manage bookmarked (favorite) cryptocurrency markets using localStorage.
 */
export function useTickerBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window === "undefined") {
      return new Set<string>();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      }
    } catch {
      // Fallback on JSON parse error
    }
    return new Set<string>();
  });

  // Sync to localStorage whenever bookmarks changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(bookmarks)));
    } catch (err) {
      console.warn("Failed to persist bookmarks to localStorage:", err);
    }
  }, [bookmarks]);

  const toggleBookmark = useCallback((market: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(market)) {
        next.delete(market);
      } else {
        next.add(market);
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (market: string): boolean => bookmarks.has(market),
    [bookmarks],
  );

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
  };
}
