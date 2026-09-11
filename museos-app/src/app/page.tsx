'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useMuseums } from '@/hooks/useMuseums';
import MapView from '@/components/Map/MapView';
import SearchBar from '@/components/Search/SearchBar';
import Filters from '@/components/Search/Filters';
import Loading from '@/components/ui/Loading';
import { filterMuseums, getUniqueValues, getMuseumIcon } from '@/lib/utils';
import type { MuseumFilters } from '@/lib/types';

const BTN = 'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold transition-colors';
const BTN_PRIMARY = `${BTN} bg-neutral-900 text-white hover:bg-neutral-700`;
const BTN_OUTLINE = `${BTN} border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white`;

function num(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function HomePage() {
  const { museums, loading, error } = useMuseums();
  const [filters, setFilters] = useState<MuseumFilters>({
    search: '', comunidad: '', provincia: '', tematica: '', titularidad: '',
    gratuito: false, conServicios: false, accesible: false, conImagen: false, soloOficial: false,
  });

  const filtered = useMemo(() => filterMuseums(museums, filters), [museums, filters]);
  const comunidades = useMemo(() => getUniqueValues(museums, 'comunidad_normalized'), [museums]);
  const provincias = useMemo(() => getUniqueValues(museums, 'provincia'), [museums]);
  const tematicas = useMemo(() => getUniqueValues(museums, 'tematica_normalized'), [museums]);
  const titularidades = useMemo(() => getUniqueValues(museums, 'titularidad'), [museums]);

  const stats = useMemo(() => ({
    total: museums.length,
    oficiales: museums.filter((m) => m.fuente === 'MCU').length,
    conImagen: museums.filter((m) => m.imagen_url).length,
    conHorario: museums.filter((m) => m.horario).length,
    conVisitaVirtual: museums.filter((m) => m.visita_virtual).length,
  }), [museums]);

  const porTematica = useMemo(() => {
    const c = new Map<string, number>();
    for (const m of museums) {
      if (m.fuente !== 'MCU') continue;
      const t = m.tematica_normalized || m.tematica || 'General';
      c.set(t, (c.get(t) ?? 0) + 1);
    }
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [museums]);

  return (
    <>
      {/* Hero */}
      <section className="bg-pink-500 text-neutral-900">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-24 grid gap-10 md:grid-cols-[1.25fr_1fr] md:items-center">
          <div>
            <span className="inline-block rounded-lg border-2 border-neutral-900 px-3 py-1 text-sm font-bold">
              Todos los museos de Espa&ntilde;a
            </span>
            <h1 className="mt-5 font-display font-bold text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Encuentra tu pr&oacute;ximo museo. Todo en un mapa.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">
              Horarios, precios, fotos y visitas virtuales de {loading ? 'miles de' : num(stats.total)} museos y colecciones,
              con las {loading ? '' : num(stats.oficiales) + ' '}fichas oficiales del Directorio de Museos de Espa&ntilde;a.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#mapa" className={BTN_PRIMARY}>Explorar el mapa <ArrowRight size={18} /></a>
              <Link href="/buscar" className={BTN_OUTLINE}>Buscar por nombre</Link>
            </div>
          </div>
          <div className="hidden md:grid gap-4">
            <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(18,17,23,0.12)]">
              <p className="text-sm font-semibold text-neutral-500">Centros en el mapa</p>
              <p className="mt-1 font-display text-5xl font-bold">{loading ? '—' : num(stats.total)}</p>
              <p className="mt-2 text-sm text-neutral-500">{loading ? '' : `${num(stats.oficiales)} del directorio oficial`}</p>
            </div>
            <div className="ml-10 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(18,17,23,0.12)]">
              <p className="text-sm font-semibold text-neutral-500">Con horario publicado</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="rounded-md bg-pink-100 px-2 py-1 text-sm font-bold">{loading ? '—' : num(stats.conHorario)}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-pink-500" style={{ width: stats.total ? `${Math.round((stats.conHorario / stats.total) * 100)}%` : '0%' }} />
                </div>
              </div>
              <p className="mt-3 text-sm text-neutral-500">{loading ? '' : `${num(stats.conVisitaVirtual)} con visita virtual`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cifras */}
      <section className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            [loading ? '—' : num(stats.total), 'museos y colecciones'],
            [loading ? '—' : num(stats.oficiales), 'fichas del directorio oficial'],
            ['19', 'comunidades autónomas'],
            [loading ? '—' : num(stats.conImagen), 'con fotografía'],
          ].map(([n, t]) => (
            <div key={t} className="text-center">
              <p className="font-display text-3xl font-bold md:text-4xl">{n}</p>
              <p className="mt-1 text-sm text-neutral-500">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mapa */}
      <section id="mapa" className="max-w-7xl mx-auto px-4 py-10 space-y-4 scroll-mt-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Explora el mapa</h2>
            <p className="mt-1 text-neutral-500">Filtra por comunidad, provincia, tem&aacute;tica o servicios.</p>
          </div>
          {!loading && (
            <p className="text-sm text-neutral-500">
              <strong className="text-neutral-900">{num(filtered.length)}</strong> resultados &middot; {num(filtered.filter((m) => m.lat && m.lng).length)} en el mapa
            </p>
          )}
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="flex h-[40vh] items-center justify-center text-neutral-500">Error: {error}</div>
        ) : (
          <>
            <SearchBar value={filters.search} onChange={(search) => setFilters({ ...filters, search })} />
            <Filters
              filters={filters}
              onChange={setFilters}
              comunidades={comunidades}
              provincias={provincias}
              tematicas={tematicas}
              titularidades={titularidades}
            />
            <MapView museums={filtered} />
          </>
        )}
      </section>

      {/* Temáticas */}
      {!loading && porTematica.length > 0 && (
        <section className="bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 py-14">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Explora por tem&aacute;tica</h2>
            <p className="mt-1 text-neutral-500">Museos del directorio oficial por tipo de colecci&oacute;n.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {porTematica.map(([t, n]) => (
                <Link
                  key={t}
                  href={`/buscar?tematica=${encodeURIComponent(t)}`}
                  className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-900"
                >
                  <span className="text-3xl">{getMuseumIcon(t)}</span>
                  <span className="flex-1">
                    <span className="block font-display text-xl font-bold">{t}</span>
                    <span className="block text-sm text-neutral-500">{num(n)} museos</span>
                  </span>
                  <ChevronRight size={20} className="text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-neutral-900" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA museos */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid gap-6 rounded-2xl border border-neutral-200 p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="inline-block rounded-lg border-2 border-neutral-900 px-3 py-1 text-sm font-bold">Para museos y ayuntamientos</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Reclama tu ficha y lleva tu museo a quien no puede visitarlo</h2>
            <p className="mt-3 text-neutral-500">Visita virtual 360, audiogu&iacute;as por QR, juegos y presencia en residencias. Un contrato menor, dos contratos claros.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/para-museos" className={BTN_PRIMARY}>Ver soluciones</Link>
            <Link href="/para-museos#contacto" className={BTN_OUTLINE}>Pedir propuesta</Link>
          </div>
        </div>
      </section>
    </>
  );
}
