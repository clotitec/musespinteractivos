-- Museos de España - Supabase Schema
-- Execute this in the Supabase SQL Editor

-- Museums table
CREATE TABLE IF NOT EXISTS museums (
  id BIGINT PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE,
  tipo_centro TEXT,
  clasificacion TEXT,

  -- Location
  direccion TEXT,
  direccion_completa TEXT,
  cp TEXT,
  municipio TEXT,
  provincia TEXT,
  comunidad TEXT,
  comunidad_normalized TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,

  -- Contact
  telefono TEXT,
  fax TEXT,
  email TEXT,
  web TEXT,
  director TEXT,

  -- Visit info
  horario TEXT,
  dias_cierre TEXT,
  precio TEXT,
  precio_reducido TEXT,
  tipo_acceso TEXT,
  aforo INTEGER,

  -- Details
  tematica TEXT,
  tematica_normalized TEXT,
  titularidad TEXT,
  gestion TEXT,
  descripcion TEXT,
  colecciones TEXT,
  edificio TEXT,
  fecha_creacion TEXT,
  visitantes_anuales TEXT,
  visitantes_anuales_num INTEGER,
  superficie_permanente TEXT,
  superficie_permanente_num REAL,
  superficie_temporal TEXT,
  superficie_temporal_num REAL,

  -- Enriched fields
  es_gratuito BOOLEAN DEFAULT FALSE,
  completeness INTEGER DEFAULT 0,
  precio_num REAL,

  -- Metadata
  imagen_url TEXT,
  servicios JSONB DEFAULT '[]'::jsonb,
  accesibilidad JSONB DEFAULT '{}'::jsonb,
  redes_sociales JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statistics table
CREATE TABLE IF NOT EXISTS statistics (
  id SERIAL PRIMARY KEY,
  year INTEGER,
  provincia TEXT,
  comunidad TEXT,
  total_museos INTEGER,
  total_visitantes BIGINT,
  datos_extra JSONB,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_museums_comunidad ON museums(comunidad_normalized);
CREATE INDEX IF NOT EXISTS idx_museums_provincia ON museums(provincia);
CREATE INDEX IF NOT EXISTS idx_museums_tematica ON museums(tematica_normalized);
CREATE INDEX IF NOT EXISTS idx_museums_coords ON museums(lat, lng);
CREATE INDEX IF NOT EXISTS idx_museums_slug ON museums(slug);
CREATE INDEX IF NOT EXISTS idx_museums_gratuito ON museums(es_gratuito);

-- Enable Row Level Security
ALTER TABLE museums ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Museums are publicly readable"
  ON museums FOR SELECT
  USING (true);

CREATE POLICY "Statistics are publicly readable"
  ON statistics FOR SELECT
  USING (true);
