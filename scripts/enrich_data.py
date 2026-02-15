"""
Enriquecimiento de datos de museos.
Combina datos del directorio + observatorio, genera slugs, normaliza categorías.
Output: data/museums_final.json listo para importar a Supabase.
"""

import json
import re
import sys
import os
import unicodedata

sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

# Input files
GEOCODED_FILE = os.path.join(PROJECT_DIR, "data", "museums_geocoded.json")
COMPLETE_FILE = os.path.join(PROJECT_DIR, "data", "museums_complete.json")
RAW_FILE = os.path.join(PROJECT_DIR, "data", "museums_raw.json")
OBSERVATORIO_FILE = os.path.join(PROJECT_DIR, "data", "observatorio_data.json")

# Output
OUTPUT_FILE = os.path.join(PROJECT_DIR, "data", "museums_final.json")


def load_museums():
    """Load museums from the best available source."""
    for filepath in [GEOCODED_FILE, COMPLETE_FILE, RAW_FILE]:
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                museums = json.load(f)
            print(f"  Loaded {len(museums)} museums from {os.path.basename(filepath)}")
            return museums
    print("ERROR: No museum data file found!")
    return []


def load_observatorio():
    """Load observatorio data if available."""
    if os.path.exists(OBSERVATORIO_FILE):
        with open(OBSERVATORIO_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"  Loaded observatorio data")
        return data
    return {}


def slugify(text):
    """Convert text to URL-friendly slug."""
    if not text:
        return ""
    # Normalize unicode
    text = unicodedata.normalize("NFKD", text)
    # Remove accents
    text = "".join(c for c in text if not unicodedata.combining(c))
    # Lowercase
    text = text.lower()
    # Replace non-alphanumeric with hyphens
    text = re.sub(r"[^a-z0-9]+", "-", text)
    # Remove leading/trailing hyphens
    text = text.strip("-")
    # Collapse multiple hyphens
    text = re.sub(r"-+", "-", text)
    return text


# Normalize community names
CCAA_NORMALIZE = {
    "Andalucía": "Andalucía",
    "Aragón": "Aragón",
    "Principado de Asturias": "Asturias",
    "Asturias": "Asturias",
    "Illes Balears": "Islas Baleares",
    "Islas Baleares": "Islas Baleares",
    "Canarias": "Canarias",
    "Cantabria": "Cantabria",
    "Castilla y León": "Castilla y León",
    "Castilla-La Mancha": "Castilla-La Mancha",
    "Cataluña": "Cataluña",
    "Catalunya": "Cataluña",
    "Comunitat Valenciana": "Comunidad Valenciana",
    "Comunidad Valenciana": "Comunidad Valenciana",
    "Extremadura": "Extremadura",
    "Galicia": "Galicia",
    "Comunidad de Madrid": "Madrid",
    "Madrid": "Madrid",
    "Región de Murcia": "Murcia",
    "Murcia": "Murcia",
    "Comunidad Foral de Navarra": "Navarra",
    "Navarra": "Navarra",
    "País Vasco": "País Vasco",
    "Euskadi": "País Vasco",
    "La Rioja": "La Rioja",
    "Ceuta": "Ceuta",
    "Melilla": "Melilla",
}

# Normalize thematic categories
TEMATICA_NORMALIZE = {
    "Arqueológico": "Arqueología",
    "Arte Contemporáneo": "Arte Contemporáneo",
    "Artes Decorativas": "Artes Decorativas",
    "Bellas Artes": "Bellas Artes",
    "Casa-Museo": "Casa-Museo",
    "Ciencia y Tecnología": "Ciencia y Tecnología",
    "Ciencias Naturales e Historia Natural": "Ciencias Naturales",
    "De Sitio": "De Sitio",
    "Especializado": "Especializado",
    "Etnografía y Antropología": "Etnografía",
    "General": "General",
    "Histórico": "Histórico",
    "Otros": "Otros",
    "Textiles e Indumentaria": "Textiles",
}


def parse_numeric(val):
    """Try to parse a numeric value from a string."""
    if not val:
        return None
    # Remove non-numeric chars except . and ,
    cleaned = re.sub(r"[^\d.,]", "", str(val))
    if not cleaned:
        return None
    # Handle Spanish number format (1.234,56 -> 1234.56)
    cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def enrich_museum(museum, slug_counter):
    """Enrich a single museum with additional computed fields."""
    enriched = dict(museum)

    # Generate slug
    base_slug = slugify(museum.get("nombre", f"museo-{museum.get('id', 0)}"))
    if not base_slug:
        base_slug = f"museo-{museum.get('id', 0)}"

    # Handle duplicate slugs
    if base_slug in slug_counter:
        slug_counter[base_slug] += 1
        enriched["slug"] = f"{base_slug}-{slug_counter[base_slug]}"
    else:
        slug_counter[base_slug] = 0
        enriched["slug"] = base_slug

    # Normalize comunidad
    ccaa = museum.get("comunidad", "")
    enriched["comunidad_normalized"] = CCAA_NORMALIZE.get(ccaa, ccaa)

    # Normalize tematica
    tematica = museum.get("tematica", "")
    enriched["tematica_normalized"] = TEMATICA_NORMALIZE.get(tematica, tematica)

    # Parse numeric fields
    visitantes = parse_numeric(museum.get("visitantes_anuales"))
    if visitantes:
        enriched["visitantes_anuales_num"] = int(visitantes)

    superficie_p = parse_numeric(museum.get("superficie_permanente"))
    if superficie_p:
        enriched["superficie_permanente_num"] = superficie_p

    superficie_t = parse_numeric(museum.get("superficie_temporal"))
    if superficie_t:
        enriched["superficie_temporal_num"] = superficie_t

    aforo = parse_numeric(museum.get("aforo"))
    if aforo:
        enriched["aforo_num"] = int(aforo)

    # Parse precio to number
    precio = museum.get("precio", "")
    if precio:
        precio_num = parse_numeric(precio)
        if precio_num is not None:
            enriched["precio_num"] = precio_num

    # Determine if free
    tipo_acceso = museum.get("tipo_acceso", "").lower()
    precio_text = str(precio).lower()
    enriched["es_gratuito"] = (
        "gratuito" in tipo_acceso
        or "gratis" in tipo_acceso
        or "libre" in tipo_acceso
        or "gratuita" in precio_text
        or precio_text in ["0", "0,00", "0.00", "0,00 €", "0.00 €"]
    )

    # Compute completeness score (0-100)
    fields_to_check = [
        "nombre", "direccion", "municipio", "provincia", "comunidad",
        "telefono", "email", "web", "horario", "tematica",
        "lat", "lng", "descripcion",
    ]
    filled = sum(1 for f in fields_to_check if museum.get(f))
    enriched["completeness"] = round(filled / len(fields_to_check) * 100)

    return enriched


def compute_statistics(museums):
    """Compute aggregate statistics by province and community."""
    stats = {
        "total": len(museums),
        "by_comunidad": {},
        "by_provincia": {},
        "by_tematica": {},
        "with_coordinates": sum(1 for m in museums if m.get("lat")),
        "with_web": sum(1 for m in museums if m.get("web")),
        "with_horario": sum(1 for m in museums if m.get("horario")),
        "gratuitos": sum(1 for m in museums if m.get("es_gratuito")),
    }

    for m in museums:
        ccaa = m.get("comunidad_normalized", "Sin datos")
        prov = m.get("provincia", "Sin datos")
        tema = m.get("tematica_normalized", "Sin datos")

        # By comunidad
        if ccaa not in stats["by_comunidad"]:
            stats["by_comunidad"][ccaa] = {"total": 0, "museos": 0, "colecciones": 0}
        stats["by_comunidad"][ccaa]["total"] += 1
        if m.get("tipo_centro", "").lower() == "museo":
            stats["by_comunidad"][ccaa]["museos"] += 1
        else:
            stats["by_comunidad"][ccaa]["colecciones"] += 1

        # By provincia
        if prov not in stats["by_provincia"]:
            stats["by_provincia"][prov] = 0
        stats["by_provincia"][prov] += 1

        # By tematica
        if tema not in stats["by_tematica"]:
            stats["by_tematica"][tema] = 0
        stats["by_tematica"][tema] += 1

    return stats


def enrich_all():
    print("=" * 60)
    print("Enriquecimiento de datos de museos")
    print("=" * 60)

    # Load data
    print("\n[1/4] Cargando datos...")
    museums = load_museums()
    observatorio = load_observatorio()

    if not museums:
        print("No museum data found. Aborting.")
        return

    # Enrich each museum
    print(f"\n[2/4] Enriqueciendo {len(museums)} museos...")
    slug_counter = {}
    enriched_museums = []

    for museum in museums:
        if museum.get("error"):
            continue  # Skip museums with scraping errors
        enriched = enrich_museum(museum, slug_counter)
        enriched_museums.append(enriched)

    print(f"  Enriched: {len(enriched_museums)} museums (skipped {len(museums) - len(enriched_museums)} with errors)")

    # Compute statistics
    print("\n[3/4] Calculando estadísticas...")
    stats = compute_statistics(enriched_museums)

    # Build final output
    output = {
        "metadata": {
            "total_museums": len(enriched_museums),
            "generated_at": __import__("time").strftime("%Y-%m-%d %H:%M:%S"),
            "sources": [
                "Directorio de Museos y Colecciones de España (MCU)",
                "Observatorio de Museos de España",
            ],
        },
        "statistics": stats,
        "museums": enriched_museums,
    }

    # Add observatorio data if available
    if observatorio:
        output["observatorio"] = observatorio

    # Save
    print(f"\n[4/4] Guardando...")
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"\n{'=' * 60}")
    print("RESUMEN:")
    print(f"  Total museos procesados: {len(enriched_museums)}")
    print(f"  Con coordenadas GPS: {stats['with_coordinates']}")
    print(f"  Con web: {stats['with_web']}")
    print(f"  Con horario: {stats['with_horario']}")
    print(f"  Gratuitos: {stats['gratuitos']}")
    print(f"\n  Por Comunidad Autónoma:")
    for ccaa, data in sorted(stats["by_comunidad"].items(), key=lambda x: -x[1]["total"]):
        print(f"    {ccaa}: {data['total']} ({data['museos']} museos, {data['colecciones']} colecciones)")
    print(f"\n  Por Temática:")
    for tema, count in sorted(stats["by_tematica"].items(), key=lambda x: -x[1]):
        print(f"    {tema}: {count}")
    print(f"\n  Output: {OUTPUT_FILE}")
    print(f"{'=' * 60}")

    return output


if __name__ == "__main__":
    enrich_all()
