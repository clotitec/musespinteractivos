'use client';

import { use, useState } from 'react';
import { useMuseum } from '@/hooks/useMuseums';
import { usePassport } from '@/hooks/usePassport';
import Loading from '@/components/ui/Loading';
import CompletenessRing from '@/components/Museum/CompletenessRing';
import AccessibilityGrid from '@/components/Museum/AccessibilityGrid';
import ServiceBadges from '@/components/Museum/ServiceBadges';
import SocialLinks from '@/components/Museum/SocialLinks';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Euro, Users,
  Heart, Check, Calendar, Building2, Palette, ExternalLink,
  Shield, Landmark, BookOpen, Ruler, BarChart3, Key, User,
} from 'lucide-react';
import {
  getMuseumIcon, formatPrice, calculateCompleteness, formatSurface,
  formatVisitors, hasServices, hasAccessibility, hasSocialMedia,
} from '@/lib/utils';

type TabId = 'info' | 'instalaciones' | 'accesibilidad' | 'contacto';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: 'Informaci\u00f3n' },
  { id: 'instalaciones', label: 'Instalaciones' },
  { id: 'accesibilidad', label: 'Accesibilidad' },
  { id: 'contacto', label: 'Contacto y Redes' },
];

export default function MuseoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { museum, loading } = useMuseum(slug);
  const passport = usePassport();
  const [activeTab, setActiveTab] = useState<TabId>('info');

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
  const completeness = calculateCompleteness(museum);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider hover:text-neutral-900 transition-colors">
        <ArrowLeft size={14} /> Volver
      </Link>

      {/* Image banner */}
      {museum.imagen_url && (
        <div className="relative w-full aspect-video max-h-80 overflow-hidden border border-neutral-200">
          <img
            src={museum.imagen_url}
            alt={museum.nombre}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Hero */}
      <div className="border border-neutral-200 p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-3xl">{getMuseumIcon(museum.tematica_normalized)}</span>
              <span className="text-[10px] text-white uppercase tracking-wider bg-neutral-900 px-2 py-0.5">
                {museum.tipo_centro || 'Museo'}
              </span>
              {museum.clasificacion && (
                <span className="text-[10px] text-white uppercase tracking-wider bg-neutral-700 px-2 py-0.5">
                  {museum.clasificacion}
                </span>
              )}
              {museum.es_gratuito && (
                <span className="text-[10px] text-white uppercase tracking-wider bg-neutral-900 px-2 py-0.5 font-medium">
                  Gratuito
                </span>
              )}
              <CompletenessRing value={completeness} size={28} />
            </div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">{museum.nombre}</h1>
            {museum.municipio && (
              <p className="text-neutral-500 flex items-center gap-1 text-sm">
                <MapPin size={14} className="text-neutral-400" />
                {museum.municipio}, {museum.provincia} &mdash; {museum.comunidad}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
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

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {/* ── TAB: Informaci\u00f3n ── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Visit info */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Datos de visita</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Clock} label="Horario" value={museum.horario} />
                <InfoRow icon={Calendar} label="D\u00edas de cierre" value={museum.dias_cierre} />
                <InfoRow icon={Key} label="Tipo de acceso" value={museum.tipo_acceso} />
                <InfoRow icon={Euro} label="Precio" value={formatPrice(museum.precio)} />
                <InfoRow icon={Euro} label="Precio reducido" value={museum.precio_reducido} />
                <InfoRow icon={Users} label="Aforo" value={museum.aforo?.toString()} />
              </div>
            </div>

            {/* Details */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Detalles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Palette} label="Tem\u00e1tica" value={museum.tematica} />
                <InfoRow icon={Building2} label="Titularidad" value={museum.titularidad} />
                <InfoRow icon={BookOpen} label="Clasificaci\u00f3n" value={museum.clasificacion} />
                <InfoRow icon={Landmark} label="Gesti\u00f3n" value={museum.gestion} />
                <InfoRow icon={Calendar} label="Fecha de creaci\u00f3n" value={museum.fecha_creacion} />
                <InfoRow icon={Users} label="Visitantes anuales" value={museum.visitantes_anuales} />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Instalaciones ── */}
        {activeTab === 'instalaciones' && (
          <div className="space-y-6">
            {/* Numeric Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Superficie permanente"
                value={formatSurface(museum.superficie_permanente)}
                icon={Ruler}
              />
              <StatCard
                label="Superficie temporal"
                value={formatSurface(museum.superficie_temporal)}
                icon={Ruler}
              />
              <StatCard
                label="Visitantes anuales"
                value={museum.visitantes_anuales_num ? formatVisitors(museum.visitantes_anuales_num) : null}
                icon={BarChart3}
              />
            </div>

            {/* Completeness */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Completitud de datos</h3>
              <div className="flex items-center gap-4">
                <CompletenessRing value={completeness} size={48} />
                <div className="flex-1">
                  <div className="w-full bg-neutral-100 h-2">
                    <div
                      className="h-2 transition-all"
                      style={{
                        width: `${completeness}%`,
                        backgroundColor: completeness >= 80 ? '#16a34a' : completeness >= 50 ? '#ca8a04' : '#dc2626',
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {completeness}% de los campos de informaci&oacute;n est&aacute;n rellenos
                  </p>
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Datos adicionales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Landmark} label="Gesti\u00f3n" value={museum.gestion} />
                <InfoRow icon={Key} label="Tipo de acceso" value={museum.tipo_acceso} />
                <InfoRow icon={Shield} label="Tipo de centro" value={museum.tipo_centro} />
                <InfoRow icon={BookOpen} label="Clasificaci\u00f3n" value={museum.clasificacion} />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Accesibilidad ── */}
        {activeTab === 'accesibilidad' && (
          <div className="space-y-6">
            {/* Accessibility */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Accesibilidad</h3>
              {hasAccessibility(museum) ? (
                <AccessibilityGrid accesibilidad={museum.accesibilidad!} />
              ) : (
                <p className="text-sm text-neutral-400 italic">No hay informaci&oacute;n de accesibilidad disponible</p>
              )}
            </div>

            {/* Services */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Servicios</h3>
              {hasServices(museum) ? (
                <ServiceBadges servicios={museum.servicios!} />
              ) : (
                <p className="text-sm text-neutral-400 italic">No hay servicios registrados</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Contacto y Redes ── */}
        {activeTab === 'contacto' && (
          <div className="space-y-6">
            {/* Contact info */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Phone} label="Tel\u00e9fono" value={museum.telefono} />
                <InfoRow icon={Phone} label="Fax" value={museum.fax} />
                <InfoRow icon={Mail} label="Email" value={museum.email} />
                <InfoRow icon={User} label="Director/a" value={museum.director} />
              </div>
            </div>

            {/* Web */}
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

            {/* Social Media */}
            <div className="border border-neutral-200 p-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Redes sociales</h3>
              {hasSocialMedia(museum) ? (
                <SocialLinks redes_sociales={museum.redes_sociales!} />
              ) : (
                <p className="text-sm text-neutral-400 italic">No hay redes sociales registradas</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border border-neutral-200 p-6">
        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Ubicaci&oacute;n</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {museum.direccion_completa && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Direcci&oacute;n</p>
              <p className="text-sm text-neutral-700">{museum.direccion_completa}</p>
            </div>
          )}
          {!museum.direccion_completa && museum.direccion && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Direcci&oacute;n</p>
              <p className="text-sm text-neutral-700">{museum.direccion}</p>
            </div>
          )}
          {museum.cp && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">C&oacute;digo postal</p>
              <p className="text-sm text-neutral-700">{museum.cp}</p>
            </div>
          )}
          {museum.municipio && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Municipio</p>
              <p className="text-sm text-neutral-700">{museum.municipio}</p>
            </div>
          )}
          {museum.provincia && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Provincia</p>
              <p className="text-sm text-neutral-700">{museum.provincia}</p>
            </div>
          )}
          {museum.comunidad && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Comunidad</p>
              <p className="text-sm text-neutral-700">{museum.comunidad}</p>
            </div>
          )}
        </div>
        {museum.lat && museum.lng && (
          <div className="pt-3 border-t border-neutral-100">
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
    </div>
  );
}

/* ── Sub-components ── */

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value?: string | null }) {
  if (!value || value === 'No disponible') return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-neutral-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-neutral-700">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | null; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-neutral-400" />
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-display font-bold text-neutral-900">
        {value || <span className="text-neutral-300 text-base font-sans font-normal">Sin datos</span>}
      </p>
    </div>
  );
}
