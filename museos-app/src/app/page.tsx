'use client';

import { useState, useMemo } from 'react';
import { useMuseums } from '@/hooks/useMuseums';
import MapView from '@/components/Map/MapView';
import SearchBar from '@/components/Search/SearchBar';
import Filters from '@/components/Search/Filters';
import Loading from '@/components/ui/Loading';
import { filterMuseums, getUniqueValues } from '@/lib/utils';
import type { MuseumFilters } from '@/lib/types';

export default function HomePage() {
  const { museums, loading, error } = useMuseums();
  const [filters, setFilters] = useState<MuseumFilters>({
    search: '', comunidad: '', provincia: '', tematica: '', titularidad: '',
    gratuito: false, conServicios: false, accesible: false, conImagen: false,
  });

  const filtered = useMemo(() => filterMuseums(museums, filters), [museums, filters]);
  const comunidades = useMemo(() => getUniqueValues(museums, 'comunidad_normalized'), [museums]);
  const provincias = useMemo(() => getUniqueValues(museums, 'provincia'), [museums]);
  const tematicas = useMemo(() => getUniqueValues(museums, 'tematica_normalized'), [museums]);
  const titularidades = useMemo(() => getUniqueValues(museums, 'titularidad'), [museums]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex items-center justify-center h-[60vh] text-neutral-500">
      <p>Error: {error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={filters.search} onChange={(search) => setFilters({ ...filters, search })} />
        </div>
      </div>
      <Filters
        filters={filters}
        onChange={setFilters}
        comunidades={comunidades}
        provincias={provincias}
        tematicas={tematicas}
        titularidades={titularidades}
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{filtered.length} museos encontrados</span>
        <span>{filtered.filter((m) => m.lat && m.lng).length} con ubicaci&oacute;n en el mapa</span>
      </div>
      <MapView museums={filtered} />
    </div>
  );
}
