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
    <div className="relative h-[calc(100vh-8rem)] overflow-hidden border border-neutral-200">
      <MapContent museums={museumsWithCoords} onMuseumClick={onMuseumClick} />

      {/* Bottom info bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-2 text-xs text-neutral-500 border border-neutral-200 pointer-events-auto flex items-center gap-2">
          <Map size={12} className="text-red-900" />
          <span>
            <strong className="text-neutral-900">{museumsWithCoords.length}</strong> museos en el mapa
          </span>
        </div>

        {/* Cluster legend */}
        <div className="bg-white/95 backdrop-blur-sm px-3 py-2 text-xs text-neutral-500 border border-neutral-200 pointer-events-auto flex items-center gap-3">
          <Layers size={12} className="text-red-900" />
          <span className="hidden sm:inline">Haz zoom o clic en los grupos para explorar</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-neutral-900" />
              <span className="hidden md:inline">&lt;30</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-900" />
              <span className="hidden md:inline">30-99</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-700" />
              <span className="hidden md:inline">100+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
