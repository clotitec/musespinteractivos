'use client';

import { useState, useMemo } from 'react';
import { useMuseums } from '@/hooks/useMuseums';
import { usePassport } from '@/hooks/usePassport';
import MuseumGrid from '@/components/Museum/MuseumGrid';
import Loading from '@/components/ui/Loading';
import { getUniqueValues } from '@/lib/utils';

type SortKey = 'nombre' | 'comunidad' | 'provincia';

export default function ListaPage() {
  const { museums, loading } = useMuseums();
  const passport = usePassport();
  const [sortBy, setSortBy] = useState<SortKey>('nombre');
  const [selectedCCAA, setSelectedCCAA] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 40;

  const comunidades = useMemo(() => getUniqueValues(museums, 'comunidad_normalized'), [museums]);

  const filtered = useMemo(() => {
    let result = [...museums];
    if (selectedCCAA) result = result.filter((m) => m.comunidad_normalized === selectedCCAA);
    result.sort((a, b) => {
      const aVal = (a[sortBy] || '') as string;
      const bVal = (b[sortBy] || '') as string;
      return aVal.localeCompare(bVal, 'es');
    });
    return result;
  }, [museums, selectedCCAA, sortBy]);

  const paginated = useMemo(() => filtered.slice(0, page * perPage), [filtered, page]);
  const hasMore = paginated.length < filtered.length;

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Museos</h2>
          <p className="text-sm text-gray-500">{filtered.length} centros</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCCAA}
            onChange={(e) => { setSelectedCCAA(e.target.value); setPage(1); }}
            className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="">Todas las comunidades</option>
            {comunidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="comunidad">Ordenar por comunidad</option>
            <option value="provincia">Ordenar por provincia</option>
          </select>
        </div>
      </div>

      <MuseumGrid
        museums={paginated}
        isVisited={passport.isVisited}
        isFavorite={passport.isFavorite}
        onToggleFavorite={passport.toggleFavorite}
        onToggleVisited={passport.toggleVisited}
      />

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors border border-purple-500/20"
          >
            Cargar m&aacute;s ({filtered.length - paginated.length} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
