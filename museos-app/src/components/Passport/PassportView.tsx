'use client';

import { MapPin, Heart, Trophy, Star } from 'lucide-react';
import MuseumCard from '@/components/Museum/MuseumCard';
import type { Museum } from '@/lib/types';

interface PassportViewProps {
  museums: Museum[];
  visited: number[];
  favorites: number[];
  toggleVisited: (id: number) => void;
  toggleFavorite: (id: number) => void;
  isVisited: (id: number) => boolean;
  isFavorite: (id: number) => boolean;
}

export default function PassportView({
  museums, visited, favorites, toggleVisited, toggleFavorite, isVisited, isFavorite,
}: PassportViewProps) {
  const visitedMuseums = museums.filter((m) => visited.includes(m.id));
  const favoriteMuseums = museums.filter((m) => favorites.includes(m.id));

  // Achievements
  const totalCCAA = new Set(museums.map((m) => m.comunidad_normalized)).size;
  const visitedCCAA = new Set(visitedMuseums.map((m) => m.comunidad_normalized)).size;
  const visitedProvincias = new Set(visitedMuseums.map((m) => m.provincia)).size;

  const achievements = [
    { icon: '🏛️', label: 'Museos visitados', value: visited.length, total: museums.length },
    { icon: '🗺️', label: 'Comunidades', value: visitedCCAA, total: totalCCAA },
    { icon: '📍', label: 'Provincias', value: visitedProvincias, total: 52 },
    { icon: '❤️', label: 'Favoritos', value: favorites.length, total: null },
  ];

  // Level calculation
  const level = visited.length < 5 ? 'Curioso' :
    visited.length < 15 ? 'Explorador' :
    visited.length < 30 ? 'Aficionado' :
    visited.length < 50 ? 'Experto' :
    visited.length < 100 ? 'Maestro' : 'Leyenda';

  const progress = Math.min(100, (visited.length / museums.length) * 100);

  return (
    <div className="space-y-8">
      {/* Passport header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-amber-600/20 border border-gray-800 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl">
            <Trophy />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Pasaporte Cultural</h2>
            <p className="text-sm text-gray-400">
              Nivel: <span className="text-purple-400 font-semibold">{level}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{visited.length} de {museums.length} museos</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Achievement cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {achievements.map(({ icon, label, value, total }) => (
            <div key={label} className="bg-gray-900/50 rounded-xl p-4 text-center">
              <span className="text-2xl">{icon}</span>
              <p className="text-xl font-bold text-gray-200 mt-1">
                {value}{total !== null ? <span className="text-xs text-gray-500">/{total}</span> : null}
              </p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Favorites section */}
      {favoriteMuseums.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-200 mb-4">
            <Heart size={18} className="text-red-400" /> Favoritos ({favoriteMuseums.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteMuseums.map((m) => (
              <MuseumCard
                key={m.id}
                museum={m}
                isVisited={isVisited(m.id)}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                onToggleVisited={toggleVisited}
              />
            ))}
          </div>
        </div>
      )}

      {/* Visited section */}
      {visitedMuseums.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-200 mb-4">
            <MapPin size={18} className="text-green-400" /> Visitados ({visitedMuseums.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visitedMuseums.map((m) => (
              <MuseumCard
                key={m.id}
                museum={m}
                isVisited={true}
                isFavorite={isFavorite(m.id)}
                onToggleFavorite={toggleFavorite}
                onToggleVisited={toggleVisited}
              />
            ))}
          </div>
        </div>
      )}

      {visited.length === 0 && favorites.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Star size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-lg">Tu pasaporte est&aacute; vac&iacute;o</p>
          <p className="text-sm mt-1">Empieza a explorar museos y marca los que visites</p>
        </div>
      )}
    </div>
  );
}
