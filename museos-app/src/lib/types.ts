export interface Museum {
  id: number;
  nombre: string;
  slug: string;
  tipo_centro: string;
  clasificacion?: string;

  // Location
  direccion?: string;
  direccion_completa?: string;
  cp?: string;
  municipio?: string;
  provincia?: string;
  comunidad?: string;
  comunidad_normalized?: string;
  lat?: number;
  lng?: number;

  // Contact
  telefono?: string;
  fax?: string;
  email?: string;
  web?: string;
  director?: string;

  // Visit
  horario?: string;
  dias_cierre?: string;
  precio?: string;
  precio_reducido?: string;
  tipo_acceso?: string;
  aforo?: number;

  // Details
  tematica?: string;
  tematica_normalized?: string;
  titularidad?: string;
  gestion?: string;
  descripcion?: string;
  fecha_creacion?: string;
  visitantes_anuales?: string;
  visitantes_anuales_num?: number;
  superficie_permanente?: string;
  superficie_temporal?: string;

  // Enriched
  es_gratuito?: boolean;
  completeness?: number;
  precio_num?: number;

  // Metadata
  imagen_url?: string;
  servicios?: string[];
  accesibilidad?: Record<string, boolean>;
  redes_sociales?: Record<string, string>;
}

export interface MuseumFilters {
  search: string;
  comunidad: string;
  provincia: string;
  tematica: string;
  titularidad: string;
  gratuito: boolean;
  conServicios: boolean;
  accesible: boolean;
  conImagen: boolean;
}

export interface StatsData {
  total: number;
  by_comunidad: Record<string, { total: number; museos: number; colecciones: number }>;
  by_provincia: Record<string, number>;
  by_tematica: Record<string, number>;
  with_coordinates: number;
  with_web: number;
  with_horario: number;
  gratuitos: number;
}
