"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gramdominator_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      }
    } catch {
      // Silently fail if localStorage is unavailable
    }
    setIsInitialized(true);
  }, []);

  const saveFavorites = useCallback((newFavorites: Set<string>) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(newFavorites)),
      );
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  const addFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.add(id);
        saveFavorites(newFavorites);
        return newFavorites;
      });
    },
    [saveFavorites],
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.delete(id);
        saveFavorites(newFavorites);
        return newFavorites;
      });
    },
    [saveFavorites],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  const getFavorites = useCallback(() => Array.from(favorites), [favorites]);

  const toggleFavorite = useCallback(
    (id: string) => {
      if (favorites.has(id)) {
        removeFavorite(id);
      } else {
        addFavorite(id);
      }
    },
    [favorites, addFavorite, removeFavorite],
  );

  return {
    favorites: Array.from(favorites),
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavorites,
    isInitialized,
  };
}
