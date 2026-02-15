'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Museum } from '@/lib/types';

export function useMuseums() {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMuseums() {
      try {
        // Supabase has a default 1000-row limit per request
        // Fetch in two pages to get all ~1540 museums
        const [page1, page2] = await Promise.all([
          supabase.from('museums').select('*').order('nombre').range(0, 999),
          supabase.from('museums').select('*').order('nombre').range(1000, 1999),
        ]);

        if (page1.error) throw page1.error;
        if (page2.error) throw page2.error;

        const allMuseums = [...(page1.data || []), ...(page2.data || [])];
        setMuseums(allMuseums);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading museums');
      } finally {
        setLoading(false);
      }
    }

    fetchMuseums();
  }, []);

  return { museums, loading, error };
}

export function useMuseum(slug: string) {
  const [museum, setMuseum] = useState<Museum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMuseum() {
      try {
        const { data } = await supabase
          .from('museums')
          .select('*')
          .eq('slug', slug)
          .single();
        setMuseum(data);
      } catch {
        setMuseum(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMuseum();
  }, [slug]);

  return { museum, loading };
}
