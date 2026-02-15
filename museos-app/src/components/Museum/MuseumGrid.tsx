'use client';

import MuseumCard from './MuseumCard';
import type { Museum } from '@/lib/types';

interface MuseumGridProps {
  museums: Museum[];
  isVisited?: (id: number) => boolean;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (id: number) => void;
  onToggleVisited?: (id: number) => void;
}

export default function MuseumGrid({ museums, isVisited, isFavorite, onToggleFavorite, onToggleVisited }: MuseumGridProps) {
  if (museums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-lg">No se encontraron museos</p>
        <p className="text-sm">Prueba a cambiar los filtros de b&uacute;squeda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {museums.map((museum) => (
        <MuseumCard
          key={museum.id}
          museum={museum}
          isVisited={isVisited?.(museum.id)}
          isFavorite={isFavorite?.(museum.id)}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
        />
      ))}
    </div>
  );
}
