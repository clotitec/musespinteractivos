"""
Geocodificador para museos españoles.
Usa Nominatim (OpenStreetMap) para convertir direcciones en coordenadas GPS.
Respeta el rate limit de 1 request/segundo.
"""

import json
import time
import re
import sys
import os
import requests

sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
INPUT_FILE = os.path.join(PROJECT_DIR, "data", "museums_raw.json")
OUTPUT_FILE = os.path.join(PROJECT_DIR, "data", "museums_geocoded.json")

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    "User-Agent": "MuseosEspanaApp/1.0 (info@clotitec.com)",
}


def geocode_address(session, address, municipio="", provincia="", cp=""):
    """Try to geocode an address using multiple strategies."""

    strategies = []

    # Strategy 1: Full address with municipio and provincia
    if address and municipio:
        strategies.append(f"{address}, {cp} {municipio}, {provincia}, España")

    # Strategy 2: Street + municipio + province
    if address and municipio and provincia:
        strategies.append(f"{address}, {municipio}, {provincia}, España")

    # Strategy 3: Just municipio + province (for when address is weird)
    if municipio and provincia:
        strategies.append(f"{municipio}, {provincia}, España")

    # Strategy 4: Just municipio
    if municipio:
        strategies.append(f"{municipio}, España")

    for query in strategies:
        try:
            params = {
                "q": query,
                "format": "json",
                "limit": 1,
                "countrycodes": "es",
                "addressdetails": 0,
            }
            resp = session.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
            resp.raise_for_status()
            results = resp.json()

            if results:
                lat = float(results[0]["lat"])
                lon = float(results[0]["lon"])
                return lat, lon, query

            time.sleep(1)  # Respect rate limit

        except Exception:
            time.sleep(1)

    return None, None, None


def geocode_all_museums():
    print("=" * 60)
    print("Geocodificador de Museos de España")
    print("=" * 60)

    # Load raw data
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: No se encontró {INPUT_FILE}")
        print("Ejecuta primero scrape_museums.py")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        museums = json.load(f)

    print(f"Museos cargados: {len(museums)}")

    # Load existing geocoded data to resume
    geocoded = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            for m in existing:
                if m.get("lat") and m.get("lng"):
                    geocoded[m["id"]] = (m["lat"], m["lng"])
        print(f"Geocodificaciones previas: {len(geocoded)}")

    session = requests.Session()
    total = len(museums)
    success = 0
    skipped = 0
    failed = 0

    for i, museum in enumerate(museums, 1):
        mid = museum["id"]

        # Skip if already geocoded
        if mid in geocoded:
            museum["lat"] = geocoded[mid][0]
            museum["lng"] = geocoded[mid][1]
            skipped += 1
            continue

        # Skip if has error from scraping
        if museum.get("error"):
            failed += 1
            continue

        address = museum.get("direccion", "")
        municipio = museum.get("municipio", "")
        provincia = museum.get("provincia", "")
        cp = museum.get("cp", "")

        lat, lng, query_used = geocode_address(session, address, municipio, provincia, cp)

        if lat and lng:
            museum["lat"] = lat
            museum["lng"] = lng
            success += 1
        else:
            failed += 1

        time.sleep(1)  # Nominatim requires 1 req/sec

        if i % 25 == 0 or i == total:
            print(f"  [{i}/{total}] OK:{success} Skip:{skipped} Fail:{failed} | {museum.get('nombre', '?')[:50]}")

        if i % 100 == 0:
            save_data(museums, OUTPUT_FILE)
            print(f"  >>> Progreso guardado")

    # Save final
    save_data(museums, OUTPUT_FILE)

    total_with_coords = sum(1 for m in museums if m.get("lat"))
    print(f"\n{'=' * 60}")
    print(f"RESUMEN:")
    print(f"  Total museos: {len(museums)}")
    print(f"  Con coordenadas: {total_with_coords}")
    print(f"  Nuevos geocodificados: {success}")
    print(f"  Ya existentes (skip): {skipped}")
    print(f"  Sin coordenadas: {failed}")
    print(f"{'=' * 60}")


def save_data(museums, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(museums, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    geocode_all_museums()
