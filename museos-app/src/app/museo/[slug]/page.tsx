'use client';

import { use } from 'react';
import { useMuseum } from '@/hooks/useMuseums';
import { usePassport } from '@/hooks/usePassport';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Euro, Users,
  Heart, Check, Calendar, Building2, Palette, ExternalLink,
} from 'lucide-react';
import { getMuseumIcon, formatPrice } from '@/lib/utils';

export default function MuseoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { museum, loading } = useMuseum(slug);
  const passport = usePassport();

  if (loading) return <Loading text="Cargando museo..." />;

  if (!museum) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🏛️</span>
        <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Museo no encontrado</h2>
        <Link href="/" className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2">Volver al mapa</Link>
      </div>
    );
  }

  const isVisited = passport.isVisited(museum.id);
  const isFav = passport.isFavorite(museum.id);

  const infoItems = [
    { icon: MapPin, label: 'Direcci\u00f3n', value: museum.direccion_completa || museum.direccion },
    { icon: Phone, label: 'Tel\u00e9fono', value: museum.telefono },
    { icon: Mail, label: 'Email', value: museum.email },
    { icon: Clock, label: 'Horario', value: museum.horario },
    { icon: Calendar, label: 'D\u00edas de cierre', value: museum.dias_cierre },
    { icon: Euro, label: 'Precio', value: formatPrice(museum.precio) },
    { icon: Euro, label: 'Precio reducido', value: museum.precio_reducido },
    { icon: Users, label: 'Aforo', value: museum.aforo?.toString() },
    { icon: Building2, label: 'Titularidad', value: museum.titularidad },
    { icon: Palette, label: 'Tem\u00e1tica', value: museum.tematica },
    { icon: Calendar, label: 'Fecha de creaci\u00f3n', value: museum.fecha_creacion },
    { icon: Users, label: 'Visitantes anuales', value: museum.visitantes_anuales },
  ].filter((item) => item.value && item.value !== 'No disponible');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider hover:text-neutral-900 transition-colors">
        <ArrowLeft size={14} /> Volver
      </Link>

      {/* Hero */}
      <div className="border border-neutral-200 p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{getMuseumIcon(museum.tematica_normalized)}</span>
              <span className="text-[10px] text-white uppercase tracking-wider bg-neutral-900 px-2 py-0.5">
                {museum.tipo_centro || 'Museo'}
              </span>
              {museum.es_gratuito && (
                <span className="text-[10px] text-white uppercase tracking-wider bg-neutral-900 px-2 py-0.5 font-medium">
                  Gratuito
                </span>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">{museum.nombre}</h1>
            {museum.municipio && (
              <p className="text-neutral-500 flex items-center gap-1 text-sm">
                <MapPin size={14} className="text-neutral-400" />
                {museum.municipio}, {museum.provincia} &mdash; {museum.comunidad}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => passport.toggleFavorite(museum.id)}
              className={`p-3 border transition-colors ${isFav ? 'border-red-700 text-red-700' : 'border-neutral-200 text-neutral-300 hover:text-red-700 hover:border-red-700'}`}
            >
              <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => passport.toggleVisited(museum.id)}
              className={`p-3 border transition-colors ${isVisited ? 'border-green-700 text-green-700' : 'border-neutral-200 text-neutral-300 hover:text-green-700 hover:border-green-700'}`}
            >
              <Check size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {museum.descripcion && (
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">Descripci&oacute;n</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">{museum.descripcion}</p>
        </div>
      )}

      {/* Info grid */}
      <div className="border border-neutral-200 p-6">
        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Informaci&oacute;n</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon size={16} className="text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-neutral-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Web link */}
      {museum.web && (
        <a
          href={museum.web}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border border-neutral-900 text-neutral-900 p-4 text-xs uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <Globe size={14} /> Visitar web oficial <ExternalLink size={12} />
        </a>
      )}

      {/* Map preview */}
      {museum.lat && museum.lng && (
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">Ubicaci&oacute;n</h3>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${museum.lat},${museum.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
          >
            <MapPin size={14} /> Abrir en Google Maps <ExternalLink size={12} />
          </a>
          <p className="text-xs text-neutral-400 mt-1">
            Coordenadas: {museum.lat?.toFixed(4)}, {museum.lng?.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}
