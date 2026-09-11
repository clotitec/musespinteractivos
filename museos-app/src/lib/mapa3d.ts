import { setWorkerUrl, type Map as MapaLibre } from 'maplibre-gl';

export const ESTILO_BASE = 'https://tiles.openfreemap.org/styles/positron';
export const DEM_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
/** Worker de MapLibre servido desde public/ (lo copia scripts/copiar-worker-maplibre.mjs). */
export const WORKER_URL = '/maplibre/maplibre-gl-worker.mjs';

let workerConfigurado = false;

/**
 * Fija la URL del worker antes de crear el primer mapa. Sin esto, en el bundle de
 * Next/Turbopack `import.meta.url` no es http y MapLibre crea un worker vacío:
 * el estilo carga pero nunca llegan teselas ni salta el evento `load`.
 */
export function prepararMapLibre() {
  if (workerConfigurado || typeof window === 'undefined') return;
  setWorkerUrl(WORKER_URL);
  workerConfigurado = true;
}

/** Añade relieve, sombreado, cielo y edificios 3D a un mapa ya cargado (idempotente). */
export function prepararMapa3D(map: MapaLibre) {
  if (!map.getSource('dem')) {
    map.addSource('dem', {
      type: 'raster-dem',
      tiles: [DEM_TILES],
      tileSize: 256,
      maxzoom: 14,
      encoding: 'terrarium',
      attribution: 'Relieve © Mapzen / AWS',
    });
  }
  const primerSimbolo = map.getStyle().layers?.find((l) => l.type === 'symbol')?.id;
  if (!map.getLayer('hillshade')) {
    map.addLayer(
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        paint: { 'hillshade-exaggeration': 0.35, 'hillshade-shadow-color': '#5b5866', 'hillshade-highlight-color': '#ffffff' },
      },
      primerSimbolo,
    );
  }
  if (map.getSource('openmaptiles') && !map.getLayer('edificios-3d')) {
    map.addLayer(
      {
        id: 'edificios-3d',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6],
            3, '#ECEAF0', 12, '#D8D4DE', 30, '#BCB7C7', 80, '#928C9E',
          ],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.2, ['coalesce', ['get', 'render_height'], 6]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.92,
          'fill-extrusion-vertical-gradient': true,
        },
      },
      primerSimbolo,
    );
  }
  try {
    map.setSky({
      'sky-color': '#cfe4f5',
      'horizon-color': '#f3f1f6',
      'fog-color': '#e9e7ee',
      'fog-ground-blend': 0.6,
      'horizon-fog-blend': 0.5,
      'sky-horizon-blend': 0.6,
    });
  } catch {
    // versiones sin cielo: se ignora
  }
}

export function activarTerreno(map: MapaLibre, activo: boolean) {
  try {
    map.setTerrain(activo ? { source: 'dem', exaggeration: 1.3 } : null);
  } catch {
    // el relieve es opcional
  }
}

export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}
