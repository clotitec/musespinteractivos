'use client';

import { useState, useMemo } from 'react';
import { useMuseums } from '@/hooks/useMuseums';
import { usePassport } from '@/hooks/usePassport';
import SearchBar from '@/components/Search/SearchBar';
import Filters from '@/components/Search/Filters';
import MuseumGrid from '@/components/Museum/MuseumGrid';
import Loading from '@/components/ui/Loading';
import { filterMuseums, getUniqueValues } from '@/lib/utils';
import type { MuseumFilters } from '@/lib/types';

export default function BuscarPage() {
  const { museums, loading } = useMuseums();
  const passport = usePassport();
  const [filters, setFilters] = useState<MuseumFilters>({
    search: '', comunidad: '', provincia: '', tematica: '', gratuito: false,
  });

  const filtered = useMemo(() => filterMuseums(museums, filters), [museums, filters]);
  const comunidades = useMemo(() => getUniqueValues(museums, 'comunidad_normalized'), [museums]);
  const provincias = useMemo(() => getUniqueValues(museums, 'provincia'), [museums]);
  const tematicas = useMemo(() => getUniqueValues(museums, 'tematica_normalized'), [museums]);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Buscar Museos</h2>
        <p className="text-sm text-gray-500">Encuentra museos y colecciones en toda Espa&ntilde;a</p>
      </div>

      <SearchBar
        value={filters.search}
        onChange={(search) => setFilters({ ...filters, search })}
        placeholder="Buscar por nombre, ciudad, provincia..."
      />

      <Filters
        filters={filters}
        onChange={setFilters}
        comunidades={comunidades}
        provincias={provincias}
        tematicas={tematicas}
      />

      <p className="text-xs text-gray-500">{filtered.length} resultados</p>

      <MuseumGrid
        museums={filtered.slice(0, 60)}
        isVisited={passport.isVisited}
        isFavorite={passport.isFavorite}
        onToggleFavorite={passport.toggleFavorite}
        onToggleVisited={passport.toggleVisited}
      />

      {filtered.length > 60 && (
        <p className="text-center text-xs text-gray-500">
          Mostrando 60 de {filtered.length} resultados. Usa los filtros para refinar.
        </p>
      )}
    </div>
  );
}
