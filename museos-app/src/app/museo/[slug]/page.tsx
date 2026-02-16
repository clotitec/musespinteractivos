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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Museo no encontrado</h2>
        <Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">Volver al mapa</Link>
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
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
        <ArrowLeft size={16} /> Volver
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{getMuseumIcon(museum.tematica_normalized)}</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {museum.tipo_centro || 'Museo'}
              </span>
              {museum.es_gratuito && (
                <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                  Gratuito
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{museum.nombre}</h1>
            {museum.municipio && (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin size={14} className="text-purple-500 dark:text-purple-400" />
                {museum.municipio}, {museum.provincia} &mdash; {museum.comunidad}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => passport.toggleFavorite(museum.id)}
              className={`p-3 rounded-xl transition-all ${isFav ? 'bg-red-500/20 text-red-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-400'}`}
            >
              <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => passport.toggleVisited(museum.id)}
              className={`p-3 rounded-xl transition-all ${isVisited ? 'bg-green-500/20 text-green-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-green-400'}`}
            >
              <Check size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {museum.descripcion && (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Descripci&oacute;n</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{museum.descripcion}</p>
        </div>
      )}

      {/* Info grid */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Informaci&oacute;n</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon size={16} className="text-purple-500 dark:text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
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
          className="flex items-center justify-center gap-2 bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl p-4 text-sm hover:bg-purple-600/30 transition-colors"
        >
          <Globe size={16} /> Visitar web oficial <ExternalLink size={12} />
        </a>
      )}

      {/* Map preview */}
      {museum.lat && museum.lng && (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ubicaci&oacute;n</h3>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${museum.lat},${museum.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
          >
            <MapPin size={14} /> Abrir en Google Maps <ExternalLink size={12} />
          </a>
          <p className="text-xs text-gray-500 mt-1">
            Coordenadas: {museum.lat?.toFixed(4)}, {museum.lng?.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}
