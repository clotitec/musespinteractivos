'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMuseums } from '@/hooks/useMuseums';
import { usePassport } from '@/hooks/usePassport';
import SearchBar from '@/components/Search/SearchBar';
import Filters from '@/components/Search/Filters';
import MuseumGrid from '@/components/Museum/MuseumGrid';
import Loading from '@/components/ui/Loading';
import { filterMuseums, getUniqueValues } from '@/lib/utils';
import type { MuseumFilters } from '@/lib/types';

function BuscarInner() {
  const sp = useSearchParams();
  const { museums, loading } = useMuseums();
  const passport = usePassport();
  const [filters, setFilters] = useState<MuseumFilters>(() => ({
    search: sp.get('q') ?? '',
    comunidad: sp.get('comunidad') ?? '',
    provincia: sp.get('provincia') ?? '',
    tematica: sp.get('tematica') ?? '',
    titularidad: '',
    gratuito: false, conServicios: false, accesible: false, conImagen: false,
    soloOficial: sp.get('oficial') === '1',
  }));

  const filtered = useMemo(() => filterMuseums(museums, filters), [museums, filters]);
  const comunidades = useMemo(() => getUniqueValues(museums, 'comunidad_normalized'), [museums]);
  const provincias = useMemo(() => getUniqueValues(museums, 'provincia'), [museums]);
  const tematicas = useMemo(() => getUniqueValues(museums, 'tematica_normalized'), [museums]);
  const titularidades = useMemo(() => getUniqueValues(museums, 'titularidad'), [museums]);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Buscar museos</h1>
        <p className="mt-1 text-neutral-500">Encuentra museos y colecciones en toda Espa&ntilde;a</p>
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
        titularidades={titularidades}
      />

      <p className="text-sm text-neutral-500"><strong className="text-neutral-900">{filtered.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</strong> resultados</p>

      <MuseumGrid
        museums={filtered.slice(0, 60)}
        isVisited={passport.isVisited}
        isFavorite={passport.isFavorite}
        onToggleFavorite={passport.toggleFavorite}
        onToggleVisited={passport.toggleVisited}
      />

      {filtered.length > 60 && (
        <p className="text-center text-sm text-neutral-500">
          Mostrando 60 de {filtered.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} resultados. Usa los filtros para refinar.
        </p>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BuscarInner />
    </Suspense>
  );
}
