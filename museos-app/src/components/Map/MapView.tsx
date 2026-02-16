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
    <div className="relative h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <MapContent museums={museumsWithCoords} onMuseumClick={onMuseumClick} />

      {/* Bottom info bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-[1000] pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 pointer-events-auto flex items-center gap-2">
          <Map size={12} className="text-red-500 dark:text-red-400" />
          <span>
            <strong className="text-gray-800 dark:text-gray-200">{museumsWithCoords.length}</strong> museos en el mapa
          </span>
        </div>

        {/* Cluster legend */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 pointer-events-auto flex items-center gap-3">
          <Layers size={12} className="text-red-500 dark:text-red-400" />
          <span className="hidden sm:inline">Haz zoom o clic en los grupos para explorar</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-950 to-red-800" />
              <span className="hidden md:inline">&lt;30</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-800 to-red-700" />
              <span className="hidden md:inline">30-99</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-700 to-red-600" />
              <span className="hidden md:inline">100+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
