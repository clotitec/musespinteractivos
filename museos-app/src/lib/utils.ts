import type { Museum, MuseumFilters } from './types';

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
    if (filters.comunidad && m.comunidad_normalized !== filters.comunidad) return false;
    if (filters.provincia && m.provincia !== filters.provincia) return false;
    if (filters.tematica && m.tematica_normalized !== filters.tematica) return false;
    if (filters.gratuito && !m.es_gratuito) return false;
    return true;
  });
}

export function getUniqueValues(museums: Museum[], field: keyof Museum): string[] {
  const values = new Set<string>();
  museums.forEach((m) => {
    const val = m[field];
    if (typeof val === 'string' && val) values.add(val);
  });
  return Array.from(values).sort();
}

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
