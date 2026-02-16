import type { Museum, MuseumFilters } from './types';

// ── Official 17 CCAA + 2 autonomous cities ─────────────────────────
const CCAA_CANONICAL: Record<string, string> = {
  // Andalucía
  'andalucia': 'Andalucía',
  'andalucía': 'Andalucía',
  'junta de andalucía': 'Andalucía',
  'junta de andalucia': 'Andalucía',
  // Aragón
  'aragon': 'Aragón',
  'aragón': 'Aragón',
  // Asturias
  'asturias': 'Asturias',
  'principado de asturias': 'Asturias',
  // Baleares
  'baleares': 'Illes Balears',
  'islas baleares': 'Illes Balears',
  'illes balears': 'Illes Balears',
  'illes baleares': 'Illes Balears',
  'balears': 'Illes Balears',
  // Canarias
  'canarias': 'Canarias',
  'islas canarias': 'Canarias',
  // Cantabria
  'cantabria': 'Cantabria',
  // Castilla y León
  'castilla y leon': 'Castilla y León',
  'castilla y león': 'Castilla y León',
  'castilla-león': 'Castilla y León',
  'castilla-leon': 'Castilla y León',
  // Castilla-La Mancha
  'castilla-la mancha': 'Castilla-La Mancha',
  'castilla la mancha': 'Castilla-La Mancha',
  // Cataluña
  'cataluña': 'Cataluña',
  'catalunya': 'Cataluña',
  'cataluna': 'Cataluña',
  // Comunitat Valenciana
  'comunitat valenciana': 'Comunitat Valenciana',
  'comunidad valenciana': 'Comunitat Valenciana',
  'valencia': 'Comunitat Valenciana',
  'c. valenciana': 'Comunitat Valenciana',
  // Extremadura
  'extremadura': 'Extremadura',
  // Galicia
  'galicia': 'Galicia',
  // La Rioja
  'la rioja': 'La Rioja',
  'rioja': 'La Rioja',
  // Comunidad de Madrid
  'madrid': 'Comunidad de Madrid',
  'comunidad de madrid': 'Comunidad de Madrid',
  'c. de madrid': 'Comunidad de Madrid',
  // Murcia
  'murcia': 'Región de Murcia',
  'región de murcia': 'Región de Murcia',
  'region de murcia': 'Región de Murcia',
  // Navarra
  'navarra': 'Navarra',
  'comunidad foral de navarra': 'Navarra',
  'nafarroa': 'Navarra',
  // País Vasco
  'pais vasco': 'País Vasco',
  'país vasco': 'País Vasco',
  'euskadi': 'País Vasco',
  // Ceuta
  'ceuta': 'Ceuta',
  'ciudad autónoma de ceuta': 'Ceuta',
  'ciudad autonoma de ceuta': 'Ceuta',
  // Melilla
  'melilla': 'Melilla',
  'ciudad autónoma de melilla': 'Melilla',
  'ciudad autonoma de melilla': 'Melilla',
};

/**
 * Normalize a comunidad string to one of the 19 official names
 * (17 CCAA + Ceuta + Melilla).
 */
function normalizeComunidad(raw: string): string {
  const key = raw.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents for lookup
    .replace(/\s+/g, ' ');

  // Try exact match first (with accents stripped)
  if (CCAA_CANONICAL[key]) return CCAA_CANONICAL[key];

  // Also try matching the original lowercased (preserving accents in the key)
  const keyAccented = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  if (CCAA_CANONICAL[keyAccented]) return CCAA_CANONICAL[keyAccented];

  // Fuzzy — check if any canonical key is contained in the raw string
  for (const [pattern, canonical] of Object.entries(CCAA_CANONICAL)) {
    if (key.includes(pattern) || pattern.includes(key)) {
      return canonical;
    }
  }

  return raw.trim(); // fallback: return trimmed original
}

// ── 52 official Spanish provinces ───────────────────────────────────
const PROVINCE_CANONICAL: Record<string, string> = {
  'a coruña': 'A Coruña',
  'la coruña': 'A Coruña',
  'coruña': 'A Coruña',
  'álava': 'Álava',
  'alava': 'Álava',
  'araba': 'Álava',
  'araba/álava': 'Álava',
  'albacete': 'Albacete',
  'alicante': 'Alicante',
  'alacant': 'Alicante',
  'almería': 'Almería',
  'almeria': 'Almería',
  'asturias': 'Asturias',
  'ávila': 'Ávila',
  'avila': 'Ávila',
  'badajoz': 'Badajoz',
  'barcelona': 'Barcelona',
  'bizkaia': 'Bizkaia',
  'vizcaya': 'Bizkaia',
  'burgos': 'Burgos',
  'cáceres': 'Cáceres',
  'caceres': 'Cáceres',
  'cádiz': 'Cádiz',
  'cadiz': 'Cádiz',
  'cantabria': 'Cantabria',
  'castellón': 'Castellón',
  'castellon': 'Castellón',
  'castelló': 'Castellón',
  'ciudad real': 'Ciudad Real',
  'córdoba': 'Córdoba',
  'cordoba': 'Córdoba',
  'cuenca': 'Cuenca',
  'gipuzkoa': 'Gipuzkoa',
  'guipúzcoa': 'Gipuzkoa',
  'guipuzcoa': 'Gipuzkoa',
  'girona': 'Girona',
  'gerona': 'Girona',
  'granada': 'Granada',
  'guadalajara': 'Guadalajara',
  'huelva': 'Huelva',
  'huesca': 'Huesca',
  'illes balears': 'Illes Balears',
  'islas baleares': 'Illes Balears',
  'baleares': 'Illes Balears',
  'balears': 'Illes Balears',
  'jaén': 'Jaén',
  'jaen': 'Jaén',
  'león': 'León',
  'leon': 'León',
  'lleida': 'Lleida',
  'lérida': 'Lleida',
  'lerida': 'Lleida',
  'lugo': 'Lugo',
  'madrid': 'Madrid',
  'málaga': 'Málaga',
  'malaga': 'Málaga',
  'murcia': 'Murcia',
  'navarra': 'Navarra',
  'nafarroa': 'Navarra',
  'ourense': 'Ourense',
  'orense': 'Ourense',
  'palencia': 'Palencia',
  'las palmas': 'Las Palmas',
  'palmas': 'Las Palmas',
  'pontevedra': 'Pontevedra',
  'la rioja': 'La Rioja',
  'rioja': 'La Rioja',
  'salamanca': 'Salamanca',
  'santa cruz de tenerife': 'Santa Cruz de Tenerife',
  'tenerife': 'Santa Cruz de Tenerife',
  'segovia': 'Segovia',
  'sevilla': 'Sevilla',
  'soria': 'Soria',
  'tarragona': 'Tarragona',
  'teruel': 'Teruel',
  'toledo': 'Toledo',
  'valencia': 'Valencia',
  'valència': 'Valencia',
  'valladolid': 'Valladolid',
  'zamora': 'Zamora',
  'zaragoza': 'Zaragoza',
  'ceuta': 'Ceuta',
  'melilla': 'Melilla',
};

/**
 * Normalize a province name to its official form.
 */
function normalizeProvincia(raw: string): string {
  const key = raw.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  if (PROVINCE_CANONICAL[key]) return PROVINCE_CANONICAL[key];

  // Try with accents preserved
  const keyAccented = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  if (PROVINCE_CANONICAL[keyAccented]) return PROVINCE_CANONICAL[keyAccented];

  return raw.trim(); // fallback
}

// ── Filters ─────────────────────────────────────────────────────────

export function filterMuseums(museums: Museum[], filters: MuseumFilters): Museum[] {
  return museums.filter((m) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = [m.nombre, m.municipio, m.provincia, m.comunidad, m.tematica]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.comunidad) {
      const museumCCAA = normalizeComunidad(m.comunidad_normalized || m.comunidad || '');
      if (museumCCAA !== filters.comunidad) return false;
    }
    if (filters.provincia) {
      const museumProv = normalizeProvincia(m.provincia || '');
      if (museumProv !== filters.provincia) return false;
    }
    if (filters.tematica && m.tematica_normalized !== filters.tematica) return false;
    if (filters.titularidad && m.titularidad !== filters.titularidad) return false;
    if (filters.gratuito && !m.es_gratuito) return false;
    if (filters.conServicios && !hasServices(m)) return false;
    if (filters.accesible && !hasAccessibility(m)) return false;
    if (filters.conImagen && !m.imagen_url) return false;
    return true;
  });
}

export function getUniqueValues(museums: Museum[], field: keyof Museum): string[] {
  const values = new Set<string>();
  museums.forEach((m) => {
    const val = m[field];
    if (typeof val === 'string' && val.trim()) {
      if (field === 'comunidad_normalized' || field === 'comunidad') {
        values.add(normalizeComunidad(val));
      } else if (field === 'provincia') {
        values.add(normalizeProvincia(val));
      } else {
        values.add(val.trim());
      }
    }
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'es'));
}

// ── Completeness ────────────────────────────────────────────────────

const COMPLETENESS_FIELDS: (keyof Museum)[] = [
  'nombre', 'tipo_centro', 'direccion', 'municipio', 'provincia',
  'comunidad', 'lat', 'lng', 'telefono', 'email', 'web', 'director',
  'horario', 'dias_cierre', 'precio', 'aforo', 'tematica', 'titularidad',
  'descripcion', 'fecha_creacion', 'visitantes_anuales', 'imagen_url',
  'servicios', 'accesibilidad', 'redes_sociales', 'clasificacion',
  'superficie_permanente', 'superficie_temporal', 'gestion', 'tipo_acceso',
];

export function calculateCompleteness(museum: Museum): number {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const val = museum[f];
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true; // number, boolean
  });
  return Math.round((filled.length / COMPLETENESS_FIELDS.length) * 100);
}

// ── Format helpers ──────────────────────────────────────────────────

export function formatSurface(superficie?: string): string | null {
  if (!superficie) return null;
  const num = parseFloat(superficie.replace(/[^\d.,]/g, '').replace(',', '.'));
  return isNaN(num) ? superficie : `${num.toLocaleString('es-ES')} m²`;
}

export function formatVisitors(num?: number): string | null {
  if (!num) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}K`;
  return num.toLocaleString('es-ES');
}

export function getSocialPlatform(key: string): string {
  const k = key.toLowerCase();
  if (k.includes('twitter') || k.includes('x.com')) return 'Twitter';
  if (k.includes('facebook') || k.includes('fb')) return 'Facebook';
  if (k.includes('instagram') || k.includes('insta')) return 'Instagram';
  if (k.includes('youtube')) return 'YouTube';
  if (k.includes('linkedin')) return 'LinkedIn';
  if (k.includes('tiktok')) return 'TikTok';
  return key;
}

export function hasServices(museum: Museum): boolean {
  return Array.isArray(museum.servicios) && museum.servicios.length > 0;
}

export function hasAccessibility(museum: Museum): boolean {
  return !!museum.accesibilidad && Object.keys(museum.accesibilidad).length > 0;
}

export function hasSocialMedia(museum: Museum): boolean {
  return !!museum.redes_sociales && Object.keys(museum.redes_sociales).length > 0;
}

// ── Helpers ─────────────────────────────────────────────────────────

export function getMuseumIcon(tematica?: string): string {
  const icons: Record<string, string> = {
    'Arqueología': '🏛️',
    'Arte Contemporáneo': '🎨',
    'Artes Decorativas': '🖼️',
    'Bellas Artes': '🎭',
    'Casa-Museo': '🏠',
    'Ciencia y Tecnología': '🔬',
    'Ciencias Naturales': '🌿',
    'De Sitio': '📍',
    'Especializado': '⭐',
    'Etnografía': '🌍',
    'General': '🏛️',
    'Histórico': '📜',
    'Textiles': '🧵',
  };
  return icons[tematica || ''] || '🏛️';
}

export function formatPrice(precio?: string): string {
  if (!precio) return 'No disponible';
  const lower = precio.toLowerCase();
  if (lower.includes('gratuit') || lower === '0' || lower === '0,00 €') return 'Gratuito';
  return precio;
}

// Re-export normalizers for use in other components (e.g. StatsView, PassportView)
export { normalizeComunidad, normalizeProvincia };
