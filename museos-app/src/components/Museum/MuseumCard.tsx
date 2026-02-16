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
    <div className="group bg-white border border-neutral-200 overflow-hidden hover:border-blue-500 transition-colors">
      {/* Header with subtle background */}
      <div className="h-28 bg-neutral-50 relative flex items-end p-4 border-b border-neutral-100">
        <span className="text-4xl absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
          {getMuseumIcon(museum.tematica_normalized)}
        </span>
        {museum.es_gratuito && (
          <span className="absolute top-3 left-3 bg-white text-neutral-900 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 border border-neutral-200">
            Gratuito
          </span>
        )}
        <div className="flex gap-1 absolute bottom-3 right-3">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(museum.id); }}
              className={`p-1.5 transition-all ${isFavorite ? 'text-red-700' : 'text-neutral-300 hover:text-red-700'}`}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          {onToggleVisited && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleVisited(museum.id); }}
              className={`p-1.5 transition-all ${isVisited ? 'text-green-700' : 'text-neutral-300 hover:text-green-700'}`}
            >
              <Check size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/museo/${museum.slug}`}>
          <h3 className="font-semibold text-sm text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {museum.nombre}
          </h3>
        </Link>

        <div className="space-y-1.5">
          {museum.municipio && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPin size={12} className="text-neutral-400 shrink-0" />
              <span className="truncate">{museum.municipio}, {museum.provincia}</span>
            </div>
          )}
          {museum.horario && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Clock size={12} className="text-neutral-400 shrink-0" />
              <span className="truncate">{museum.horario}</span>
            </div>
          )}
          {museum.web && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Globe size={12} className="text-neutral-400 shrink-0" />
              <a
                href={museum.web}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-neutral-900 underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                Web oficial
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
            {museum.tematica_normalized || museum.tematica || 'General'}
          </span>
          <span className="text-[10px] text-neutral-400">
            {formatPrice(museum.precio)}
          </span>
        </div>
      </div>
    </div>
  );
}
