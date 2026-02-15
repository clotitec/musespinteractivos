"""
Import museum data to Supabase.
Reads museums_final.json and upserts into the museums table.

Usage:
  python scripts/import_to_supabase.py <SUPABASE_URL> <SUPABASE_KEY>
"""

import json
import sys
import os
import requests
import time

sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

# Try different data sources in order of preference
DATA_FILES = [
    os.path.join(PROJECT_DIR, "data", "museums_final.json"),
    os.path.join(PROJECT_DIR, "data", "museums_geocoded.json"),
    os.path.join(PROJECT_DIR, "data", "museums_complete.json"),
    os.path.join(PROJECT_DIR, "data", "museums_raw.json"),
]

# Fields that map to the Supabase schema
MUSEUM_FIELDS = [
    "id", "nombre", "slug", "tipo_centro", "clasificacion",
    "direccion", "direccion_completa", "cp", "municipio", "provincia",
    "comunidad", "comunidad_normalized", "lat", "lng",
    "telefono", "fax", "email", "web", "director",
    "horario", "dias_cierre", "precio", "precio_reducido", "tipo_acceso", "aforo",
    "tematica", "tematica_normalized", "titularidad", "gestion",
    "descripcion", "colecciones", "edificio",
    "fecha_creacion", "visitantes_anuales", "visitantes_anuales_num",
    "superficie_permanente", "superficie_permanente_num",
    "superficie_temporal", "superficie_temporal_num",
    "es_gratuito", "completeness", "precio_num",
    "imagen_url", "servicios", "accesibilidad", "redes_sociales",
]


def load_museums():
    """Load museums from the best available source."""
    for filepath in DATA_FILES:
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Handle both flat list and nested structure
            if isinstance(data, list):
                museums = data
            elif isinstance(data, dict) and "museums" in data:
                museums = data["museums"]
            else:
                continue

            print(f"  Loaded {len(museums)} museums from {os.path.basename(filepath)}")
            return museums

    print("ERROR: No museum data file found!")
    return []


def clean_museum_for_insert(museum):
    """Extract and clean fields for Supabase insert. Always includes ALL fields."""
    row = {}
    for field in MUSEUM_FIELDS:
        val = museum.get(field)

        # Default to None
        if val == "" or val is None:
            row[field] = None
            continue

        # Handle numeric fields
        if field == "aforo":
            try:
                row[field] = int(float(str(val).replace(",", "").replace(".", "")))
            except (ValueError, TypeError):
                row[field] = None
        elif field in ("visitantes_anuales_num", "completeness"):
            try:
                row[field] = int(val)
            except (ValueError, TypeError):
                row[field] = None
        elif field in ("lat", "lng", "superficie_permanente_num", "superficie_temporal_num", "precio_num"):
            try:
                row[field] = float(val)
            except (ValueError, TypeError):
                row[field] = None
        elif field in ("servicios", "accesibilidad", "redes_sociales"):
            row[field] = val if isinstance(val, (list, dict)) else None
        elif field == "es_gratuito":
            row[field] = bool(val)
        else:
            row[field] = str(val)

    return row


def upsert_batch(supabase_url, supabase_key, museums, batch_size=50):
    """Upsert museums in batches to Supabase."""
    url = f"{supabase_url}/rest/v1/museums"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    total = len(museums)
    success = 0
    errors = 0

    for i in range(0, total, batch_size):
        batch = museums[i:i + batch_size]

        try:
            resp = requests.post(url, headers=headers, json=batch, timeout=30)
            if resp.status_code in (200, 201):
                success += len(batch)
            else:
                print(f"  ERROR batch {i}-{i+len(batch)}: {resp.status_code} {resp.text[:200]}")
                errors += len(batch)
        except Exception as e:
            print(f"  ERROR batch {i}-{i+len(batch)}: {e}")
            errors += len(batch)

        if (i + batch_size) % 200 == 0 or i + batch_size >= total:
            print(f"  [{min(i + batch_size, total)}/{total}] OK: {success}, Errors: {errors}")

        time.sleep(0.2)

    return success, errors


def main():
    if len(sys.argv) < 3:
        print("Usage: python import_to_supabase.py <SUPABASE_URL> <SUPABASE_KEY>")
        print("  SUPABASE_URL: e.g., https://abc123.supabase.co")
        print("  SUPABASE_KEY: Your service_role key (not anon key) for write access")
        sys.exit(1)

    supabase_url = sys.argv[1].rstrip("/")
    supabase_key = sys.argv[2]

    print("=" * 60)
    print("Importador de Museos a Supabase")
    print("=" * 60)

    # Load data
    print("\n[1/3] Cargando datos...")
    museums = load_museums()
    if not museums:
        sys.exit(1)

    # Clean data
    print(f"\n[2/3] Preparando {len(museums)} museos para importar...")
    cleaned = []
    for m in museums:
        if m.get("error"):
            continue
        row = clean_museum_for_insert(m)
        if row.get("id") and row.get("nombre"):
            cleaned.append(row)

    print(f"  {len(cleaned)} museos listos (descartados {len(museums) - len(cleaned)} con errores)")

    # Upsert
    print(f"\n[3/3] Importando a Supabase...")
    success, errors = upsert_batch(supabase_url, supabase_key, cleaned)

    print(f"\n{'=' * 60}")
    print(f"RESUMEN:")
    print(f"  Importados: {success}")
    print(f"  Errores: {errors}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
