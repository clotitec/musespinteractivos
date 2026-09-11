'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/ui/Loading';
import { Map, Layers } from 'lucide-react';
import type { Museum } from '@/lib/types';

const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => <Loading text="Cargando mapa..." />,
});

interface MapViewProps {
  museums: Museum[];
  onMuseumClick?: (museum: Museum) => void;
}

export default function MapView({ museums, onMuseumClick }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Loading text="Cargando mapa..." />;

  const museumsWithCoords = museums.filter((m) => m.lat && m.lng);

  return (
    <div className="relative h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-neutral-200">
      <MapContent museums={museumsWithCoords} onMuseumClick={onMuseumClick} />

      {/* Barra inferior: por encima de la atribución de MapLibre (≈32 px) para no taparla */}
      <div className="absolute bottom-10 left-4 right-4 flex items-center justify-between z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-2 text-xs text-neutral-500 border border-neutral-200 rounded-lg pointer-events-auto flex items-center gap-2">
          <Map size={12} className="text-neutral-900" />
          <span>
            <strong className="text-neutral-900">{museumsWithCoords.length}</strong> museos en el mapa
          </span>
        </div>

        <div className="bg-white/95 backdrop-blur-sm px-3 py-2 text-xs text-neutral-500 border border-neutral-200 rounded-lg pointer-events-auto flex items-center gap-2">
          <Layers size={12} className="text-neutral-900" />
          <span className="hidden sm:inline">Relieve y edificios 3D &middot; pulsa un museo para volar a su ubicaci&oacute;n</span>
          <span className="sm:hidden">Pulsa un museo</span>
        </div>
      </div>
    </div>
  );
}
