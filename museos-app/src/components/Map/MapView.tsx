'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/ui/Loading';
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
    <div className="relative h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-800">
      <MapContent museums={museumsWithCoords} onMuseumClick={onMuseumClick} />
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-400 border border-gray-700">
        {museumsWithCoords.length} museos en el mapa
      </div>
    </div>
  );
}
