'use client';

import Link from 'next/link';
import { MapPin, Clock, Globe, Heart, Check } from 'lucide-react';
import { getMuseumIcon, formatPrice } from '@/lib/utils';
import type { Museum } from '@/lib/types';

interface MuseumCardProps {
  museum: Museum;
  isVisited?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onToggleVisited?: (id: number) => void;
}

export default function MuseumCard({ museum, isVisited, isFavorite, onToggleFavorite, onToggleVisited }: MuseumCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-purple-400/40 dark:hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/5">
      {/* Header with gradient */}
      <div className="h-32 bg-gradient-to-br from-purple-600/20 to-amber-600/20 relative flex items-end p-4">
        <span className="text-4xl absolute top-3 right-3 opacity-30 group-hover:opacity-60 transition-opacity">
          {getMuseumIcon(museum.tematica_normalized)}
        </span>
        {museum.es_gratuito && (
          <span className="absolute top-3 left-3 bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-green-500/30">
            Gratuito
          </span>
        )}
        <div className="flex gap-1 absolute bottom-3 right-3">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(museum.id); }}
              className={`p-1.5 rounded-lg transition-all ${isFavorite ? 'bg-red-500/20 text-red-400' : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 hover:text-red-400'}`}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          {onToggleVisited && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleVisited(museum.id); }}
              className={`p-1.5 rounded-lg transition-all ${isVisited ? 'bg-green-500/20 text-green-400' : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 hover:text-green-400'}`}
            >
              <Check size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/museo/${museum.slug}`}>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors mb-2">
            {museum.nombre}
          </h3>
        </Link>

        <div className="space-y-1.5">
          {museum.municipio && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} className="text-purple-500 dark:text-purple-400 shrink-0" />
              <span className="truncate">{museum.municipio}, {museum.provincia}</span>
            </div>
          )}
          {museum.horario && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="truncate">{museum.horario}</span>
            </div>
          )}
          {museum.web && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Globe size={12} className="text-blue-500 dark:text-blue-400 shrink-0" />
              <a
                href={museum.web}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-blue-500 dark:hover:text-blue-300"
                onClick={(e) => e.stopPropagation()}
              >
                Web oficial
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-full">
            {museum.tematica_normalized || museum.tematica || 'General'}
          </span>
          <span className="text-[10px] text-gray-500">
            {formatPrice(museum.precio)}
          </span>
        </div>
      </div>
    </div>
  );
}
