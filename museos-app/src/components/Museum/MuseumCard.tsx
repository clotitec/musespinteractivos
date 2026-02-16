'use client';

import Link from 'next/link';
import { MapPin, Clock, Globe, Heart, Check, Share2 } from 'lucide-react';
import { getMuseumIcon, formatPrice, calculateCompleteness, formatVisitors, hasAccessibility, hasSocialMedia } from '@/lib/utils';
import CompletenessRing from './CompletenessRing';
import type { Museum } from '@/lib/types';

interface MuseumCardProps {
  museum: Museum;
  isVisited?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onToggleVisited?: (id: number) => void;
}

export default function MuseumCard({ museum, isVisited, isFavorite, onToggleFavorite, onToggleVisited }: MuseumCardProps) {
  const hasImage = !!museum.imagen_url;
  const completeness = calculateCompleteness(museum);

  return (
    <div className="group bg-white border border-neutral-200 overflow-hidden hover:border-blue-500 transition-colors">
      {/* Header with image or subtle background */}
      <div className="h-32 relative flex items-end p-4 border-b border-neutral-100">
        {hasImage ? (
          <>
            <img
              src={museum.imagen_url!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-neutral-50" />
        )}

        {/* Icon watermark (when no image) */}
        {!hasImage && (
          <span className="text-4xl absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
            {getMuseumIcon(museum.tematica_normalized)}
          </span>
        )}

        {/* Gratuito badge */}
        {museum.es_gratuito && (
          <span className={`absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${
            hasImage ? 'bg-white/90 text-neutral-900' : 'bg-white text-neutral-900 border border-neutral-200'
          }`}>
            Gratuito
          </span>
        )}

        {/* Completeness ring */}
        <div className="absolute top-3 right-3">
          <div className={`${hasImage ? 'bg-white/90' : 'bg-white'} p-0.5`}>
            <CompletenessRing value={completeness} size={22} />
          </div>
        </div>

        {/* Fav/Visited buttons */}
        <div className="flex gap-1 absolute bottom-3 right-3">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(museum.id); }}
              className={`p-1.5 transition-all ${hasImage ? 'drop-shadow-sm' : ''} ${isFavorite ? 'text-red-700' : `${hasImage ? 'text-white/80' : 'text-neutral-300'} hover:text-red-700`}`}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          {onToggleVisited && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleVisited(museum.id); }}
              className={`p-1.5 transition-all ${hasImage ? 'drop-shadow-sm' : ''} ${isVisited ? 'text-green-700' : `${hasImage ? 'text-white/80' : 'text-neutral-300'} hover:text-green-700`}`}
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

        {/* Micro-data chips */}
        <MicroData museum={museum} />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
            {museum.tematica_normalized || museum.tematica || 'General'}
          </span>
          <div className="flex items-center gap-2">
            {hasSocialMedia(museum) && (
              <span title="Redes sociales disponibles"><Share2 size={10} className="text-neutral-300" /></span>
            )}
            <span className="text-[10px] text-neutral-400">
              {formatPrice(museum.precio)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicroData({ museum }: { museum: Museum }) {
  const chips: string[] = [];

  if (museum.visitantes_anuales_num) {
    const formatted = formatVisitors(museum.visitantes_anuales_num);
    if (formatted) chips.push(`${formatted} visitas`);
  }
  if (museum.superficie_permanente) {
    const num = parseFloat(museum.superficie_permanente.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(num)) chips.push(`${num.toLocaleString('es-ES')}m\u00B2`);
  }
  if (hasAccessibility(museum)) {
    chips.push('\u267F Accesible');
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.slice(0, 3).map((chip) => (
        <span key={chip} className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 border border-neutral-100">
          {chip}
        </span>
      ))}
    </div>
  );
}
