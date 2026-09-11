'use client';

import { useEffect, useRef, useState } from 'react';
import { FullscreenControl, Map as MapaLibre, NavigationControl, Popup, type GeoJSONSource, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Mountain, Locate } from 'lucide-react';
import { ESTILO_BASE, activarTerreno, esc, prepararMapLibre, prepararMapa3D } from '@/lib/mapa3d';
import type { Museum } from '@/lib/types';

const CENTRO: [number, number] = [-3.7, 40.2];
const ZOOM_INICIAL = 5.4;

type Punto = GeoJSON.Feature<GeoJSON.Point, Record<string, string | number>>;

function aGeoJSON(museums: Museum[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: Punto[] = [];
  for (const m of museums) {
    if (!m.lat || !m.lng) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: {
        id: m.id,
        slug: m.slug,
        nombre: m.nombre,
        lugar: [m.municipio, m.provincia].filter(Boolean).join(', '),
        tematica: m.tematica_normalized || m.tematica || 'General',
        fuente: m.fuente || 'MCU',
        imagen: m.imagen_url || '',
        horario: m.horario || '',
      },
    });
  }
  return { type: 'FeatureCollection', features };
}

function popupHTML(p: Record<string, unknown>): string {
  const imagen = p.imagen ? `<img src="${esc(p.imagen)}" alt="" class="pm-pop-img" loading="lazy" />` : '';
  const fuente = p.fuente && p.fuente !== 'MCU' ? `<span class="pm-pop-chip">${esc(p.fuente)}</span>` : '';
  const horario = p.horario ? `<p class="pm-pop-meta">${esc(String(p.horario).slice(0, 90))}</p>` : '';
  return `
    <div class="pm-pop">
      ${imagen}
      <div class="pm-pop-body">
        <p class="pm-pop-cat">${esc(p.tematica)} ${fuente}</p>
        <h3 class="pm-pop-title">${esc(p.nombre)}</h3>
        <p class="pm-pop-meta">${esc(p.lugar)}</p>
        ${horario}
        <a class="pm-pop-btn" href="/museo/${esc(p.slug)}">Ver ficha</a>
      </div>
    </div>`;
}

interface MapContentProps {
  museums: Museum[];
  onMuseumClick?: (museum: Museum) => void;
}

export default function MapContent({ museums, onMuseumClick }: MapContentProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const listo = useRef(false);
  const museumsRef = useRef(museums);
  const clickRef = useRef(onMuseumClick);
  const [terreno, setTerreno] = useState(true);
  museumsRef.current = museums;
  clickRef.current = onMuseumClick;

  useEffect(() => {
    if (!contenedor.current || mapa.current) return;
    prepararMapLibre();
    const map = new MapaLibre({
      container: contenedor.current,
      style: ESTILO_BASE,
      center: CENTRO,
      zoom: ZOOM_INICIAL,
      pitch: 0,
      maxPitch: 75,
      attributionControl: { compact: true },
    });
    mapa.current = map;
    (window as unknown as { __museosMap?: MapaLibre }).__museosMap = map;
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new FullscreenControl(), 'top-right');

    map.on('load', () => {
      prepararMapa3D(map);
      activarTerreno(map, true);
      map.addSource('museos', {
        type: 'geojson',
        data: aGeoJSON(museumsRef.current),
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 48,
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'museos',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#121117', 30, '#ff7aac', 150, '#e8548d'],
          'circle-radius': ['step', ['get', 'point_count'], 18, 30, 24, 150, 30],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'museos',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 13, 'text-allow-overlap': true },
        paint: { 'text-color': ['step', ['get', 'point_count'], '#ffffff', 30, '#121117', 150, '#ffffff'] },
      });
      map.addLayer({
        id: 'museos-punto',
        type: 'circle',
        source: 'museos',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['match', ['get', 'fuente'], 'MCU', '#ff7aac', '#ffffff'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 5, 12, 8, 16, 11],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#121117',
        },
      });
      listo.current = true;

      map.on('click', 'clusters', (e: MapLayerMouseEvent) => {
        const f = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
        if (!f) return;
        const src = map.getSource('museos') as GeoJSONSource;
        const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
        Promise.resolve(src.getClusterExpansionZoom(f.properties.cluster_id as number)).then((z) => {
          map.easeTo({ center: coords, zoom: Math.min(z + 0.6, 16), duration: 700 });
        });
      });
      map.on('click', 'museos-punto', (e: MapLayerMouseEvent) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, unknown>;
        const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
        new Popup({ offset: 16, maxWidth: '300px' }).setLngLat(coords).setHTML(popupHTML(p)).addTo(map);
        map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 15.3), pitch: 58, bearing: -18, duration: 1800, essential: true });
        const m = museumsRef.current.find((x) => x.id === Number(p.id));
        if (m) clickRef.current?.(m);
      });
      for (const capa of ['clusters', 'museos-punto']) {
        map.on('mouseenter', capa, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', capa, () => { map.getCanvas().style.cursor = ''; });
      }
    });

    return () => {
      map.remove();
      mapa.current = null;
      listo.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapa.current;
    if (!map || !listo.current) return;
    (map.getSource('museos') as GeoJSONSource | undefined)?.setData(aGeoJSON(museums));
  }, [museums]);

  function alternarTerreno() {
    const map = mapa.current;
    if (!map) return;
    const nuevo = !terreno;
    setTerreno(nuevo);
    activarTerreno(map, nuevo);
    map.easeTo({ pitch: nuevo ? Math.max(map.getPitch(), 50) : 0, duration: 900 });
  }

  function vistaEspana() {
    mapa.current?.easeTo({ center: CENTRO, zoom: ZOOM_INICIAL, pitch: 0, bearing: 0, duration: 1200 });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={contenedor} className="h-full w-full" />
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        <button
          onClick={alternarTerreno}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold shadow-sm transition-colors ${
            terreno ? 'border-neutral-900 bg-pink-500 text-neutral-900' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900'
          }`}
          title="Relieve y edificios en 3D"
        >
          <Mountain size={16} /> 3D
        </button>
        <button
          onClick={vistaEspana}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-neutral-700 shadow-sm transition-colors hover:border-neutral-900"
          title="Volver a la vista de España"
        >
          <Locate size={16} /> Espa&ntilde;a
        </button>
      </div>
    </div>
  );
}
