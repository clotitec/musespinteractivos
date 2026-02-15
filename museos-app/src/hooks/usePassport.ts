'use client';

import { useState, useEffect, useCallback } from 'react';

interface PassportData {
  visited: number[];
  favorites: number[];
}

const STORAGE_KEY = 'museos-passport';

function loadPassport(): PassportData {
  if (typeof window === 'undefined') return { visited: [], favorites: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { visited: [], favorites: [] };
}

export function usePassport() {
  const [data, setData] = useState<PassportData>({ visited: [], favorites: [] });

  useEffect(() => {
    setData(loadPassport());
  }, []);

  const save = useCallback((newData: PassportData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const toggleVisited = useCallback((id: number) => {
    setData((prev) => {
      const visited = prev.visited.includes(id)
        ? prev.visited.filter((v) => v !== id)
        : [...prev.visited, id];
      const newData = { ...prev, visited };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setData((prev) => {
      const favorites = prev.favorites.includes(id)
        ? prev.favorites.filter((f) => f !== id)
        : [...prev.favorites, id];
      const newData = { ...prev, favorites };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
  }, []);

  return {
    visited: data.visited,
    favorites: data.favorites,
    toggleVisited,
    toggleFavorite,
    isVisited: (id: number) => data.visited.includes(id),
    isFavorite: (id: number) => data.favorites.includes(id),
    totalVisited: data.visited.length,
    totalFavorites: data.favorites.length,
  };
}
