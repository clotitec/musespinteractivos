'use client';

import { useState, useEffect } from 'react';
import type { Museum } from '@/lib/types';

let cache: Promise<Museum[]> | null = null;

export function loadMuseums(): Promise<Museum[]> {
  if (!cache) {
    cache = fetch('/data/museos.json')
      .then((r) => {
        if (!r.ok) throw new Error(`No se pudo cargar el catálogo (${r.status})`);
        return r.json() as Promise<Museum[]>;
      })
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
}

export function useMuseums() {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMuseums()
      .then(setMuseums)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error cargando museos'))
      .finally(() => setLoading(false));
  }, []);

  return { museums, loading, error };
}

export function useMuseum(slug: string) {
  const [museum, setMuseum] = useState<Museum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMuseums()
      .then((all) => setMuseum(all.find((m) => m.slug === slug) ?? null))
      .catch(() => setMuseum(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return { museum, loading };
}
