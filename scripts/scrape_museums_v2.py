"""
Scraper v2 para el Directorio de Museos y Colecciones de España
https://directoriomuseos.mcu.es/dirmuseos/

Estrategia: Scrapear por provincia (52 provincias) para cobertura completa.
Extrae datos de 3 pestañas por museo: información, visita, descripción.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import sys
import os

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://directoriomuseos.mcu.es/dirmuseos"
SEARCH_URL = f"{BASE_URL}/realizarBusquedaSencilla.do"
SEARCH_MAPA_URL = f"{BASE_URL}/mostrarBusquedaSencillaClicMapa.do"
DETAIL_URL = f"{BASE_URL}/mostrarDetalleMuseo.do"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

# Province codes used by the directory (1-52)
PROVINCIAS = {
    1: "Álava", 2: "Albacete", 3: "Alicante", 4: "Almería",
    5: "Ávila", 6: "Badajoz", 7: "Baleares", 8: "Barcelona",
    9: "Burgos", 10: "Cáceres", 11: "Cádiz", 12: "Castellón",
    13: "Ciudad Real", 14: "Córdoba", 15: "A Coruña", 16: "Cuenca",
    17: "Girona", 18: "Granada", 19: "Guadalajara", 20: "Guipúzcoa",
    21: "Huelva", 22: "Huesca", 23: "Jaén", 24: "León",
    25: "Lleida", 26: "La Rioja", 27: "Lugo", 28: "Madrid",
    29: "Málaga", 30: "Murcia", 31: "Navarra", 32: "Ourense",
    33: "Asturias", 34: "Palencia", 35: "Las Palmas", 36: "Pontevedra",
    37: "Salamanca", 38: "Santa Cruz de Tenerife", 39: "Cantabria",
    40: "Segovia", 41: "Sevilla", 42: "Soria", 43: "Tarragona",
    44: "Teruel", 45: "Toledo", 46: "Valencia", 47: "Valladolid",
    48: "Vizcaya", 49: "Zamora", 50: "Zaragoza", 51: "Ceuta", 52: "Melilla",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_FILE = os.path.join(PROJECT_DIR, "data", "museums_complete.json")
CHECKPOINT_FILE = os.path.join(PROJECT_DIR, "data", "museums_checkpoint.json")


def get_session():
    """Create a session with cookies from the main page."""
    session = requests.Session()
    session.headers.update(HEADERS)
    session.verify = False  # SSL issues with this site
    try:
        session.get(f"{BASE_URL}/mostrarBusquedaGeneral.do", timeout=30)
    except Exception as e:
        print(f"  Warning: Could not initialize session: {e}")
    return session


def load_checkpoint():
    """Load previously scraped museums from checkpoint."""
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"  Checkpoint loaded: {len(data.get('museums', []))} museums, provinces done: {data.get('provinces_done', [])}")
            return data
    return {"museums": [], "provinces_done": [], "seen_ids": []}


def save_checkpoint(museums, provinces_done, seen_ids):
    """Save progress checkpoint."""
    os.makedirs(os.path.dirname(CHECKPOINT_FILE), exist_ok=True)
    with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "museums": museums,
            "provinces_done": provinces_done,
            "seen_ids": list(seen_ids),
        }, f, ensure_ascii=False, indent=2)


def get_province_results(session, province_id, page=1):
    """Get search results for a specific province."""
    params = {
        "tipoDeBusqueda": "sencilla",
        "idProvinciaMapa": province_id,
        "pag": page,
    }
    resp = session.get(SEARCH_MAPA_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.text


def get_all_results(session, page=1):
    """Get all museums via general search (fallback)."""
    params = {
        "tipoDeBusqueda": "sencilla",
        "tipoCentroMuseo": "on",
        "tipoCentroCol": "on",
        "validado": "on",
        "orderBy": "nom",
        "orderType": "asc",
        "pag": page,
    }
    resp = session.get(SEARCH_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.text


def parse_search_results(html):
    """Extract museum IDs and names from search results page."""
    soup = BeautifulSoup(html, "html.parser")
    museums = []
    links = soup.find_all("a", href=re.compile(r"idMuseo=(\d+)"))
    seen = set()
    for link in links:
        href = link.get("href", "")
        match = re.search(r"idMuseo=(\d+)", href)
        if match:
            museum_id = int(match.group(1))
            if museum_id not in seen:
                seen.add(museum_id)
                name = link.get_text(strip=True)
                if name:
                    museums.append({"id": museum_id, "nombre": name})
    return museums


def get_max_page(html):
    """Get the maximum page number from pagination links."""
    soup = BeautifulSoup(html, "html.parser")
    page_links = soup.find_all("a", href=re.compile(r"pag=\d+"))
    max_page = 1
    for link in page_links:
        match = re.search(r"pag=(\d+)", link.get("href", ""))
        if match:
            max_page = max(max_page, int(match.group(1)))
    return max_page


def get_museum_detail(session, museum_id, tab="informacion"):
    """Get detail page for a specific museum tab."""
    params = {"idMuseo": museum_id, "pestania": tab}
    resp = session.get(DETAIL_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.text


def clean_text(text):
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    return text


def get_row_value(rows, label_pattern):
    """Find a table row by label pattern and return cleaned value."""
    for row in rows:
        cells = row.find_all("td")
        if len(cells) >= 2:
            label = cells[0].get_text(strip=True).lower()
            if re.search(label_pattern, label):
                return cells, clean_text(cells[1].get_text())
    return None, ""


def parse_info_tab(html):
    """Parse the information tab."""
    soup = BeautifulSoup(html, "html.parser")
    data = {}
    rows = soup.find_all("tr")

    _, val = get_row_value(rows, r"museo.*colecci")
    if val:
        data["tipo_centro"] = val

    _, val = get_row_value(rows, r"matriz|filial")
    if val:
        data["clasificacion"] = val

    # Address parsing
    for row in rows:
        cells = row.find_all("td")
        if len(cells) >= 2 and "direcci" in cells[0].get_text(strip=True).lower():
            addr_html = str(cells[1])
            all_text = clean_text(cells[1].get_text())
            data["direccion_completa"] = all_text

            cp_match = re.search(r"\b(\d{5})\b", all_text)
            if cp_match:
                data["cp"] = cp_match.group(1)

            br_split = re.split(r"<br\s*/?>", addr_html)
            if len(br_split) >= 2:
                location_part = BeautifulSoup(br_split[-1], "html.parser").get_text()
                location_clean = clean_text(location_part)

                loc_match = re.match(
                    r"(\d{5})?\s*(.+?)\s*\(([^)]+)\)\s*,?\s*(.+?)$",
                    location_clean,
                )
                if loc_match:
                    if loc_match.group(1):
                        data["cp"] = loc_match.group(1)
                    data["municipio"] = clean_text(loc_match.group(2))
                    data["provincia"] = clean_text(loc_match.group(3))
                    data["comunidad"] = clean_text(loc_match.group(4))
                else:
                    loc_match2 = re.match(
                        r"(\d{5})?\s*(.+?)(?:,\s*(.+))?$", location_clean
                    )
                    if loc_match2:
                        data["municipio"] = clean_text(loc_match2.group(2))

            if data.get("cp"):
                street_part = all_text.split(data["cp"])[0]
                data["direccion"] = clean_text(street_part).rstrip(",. ")
            break

    _, val = get_row_value(rows, r"director")
    if val:
        data["director"] = val

    _, val = get_row_value(rows, r"tel[eé]fono")
    if val:
        data["telefono"] = val

    _, val = get_row_value(rows, r"fax")
    if val:
        data["fax"] = val

    _, val = get_row_value(rows, r"correo|e-?mail")
    if val:
        data["email"] = val

    for row in rows:
        cells = row.find_all("td")
        if len(cells) >= 2 and "internet" in cells[0].get_text(strip=True).lower():
            a_tag = cells[1].find("a")
            if a_tag and a_tag.get("href"):
                data["web"] = a_tag["href"]
            else:
                val = clean_text(cells[1].get_text())
                if val:
                    data["web"] = val
            break

    return data


def parse_visit_tab(html):
    """Parse the visit tab."""
    soup = BeautifulSoup(html, "html.parser")
    data = {}
    rows = soup.find_all("tr")

    _, val = get_row_value(rows, r"horario")
    if val:
        data["horario"] = val

    _, val = get_row_value(rows, r"cierre")
    if val:
        data["dias_cierre"] = val

    _, val = get_row_value(rows, r"tarifa general")
    if val:
        data["precio"] = val

    _, val = get_row_value(rows, r"tarifa reducida")
    if val:
        data["precio_reducido"] = val

    _, val = get_row_value(rows, r"tipo.*acceso")
    if val:
        data["tipo_acceso"] = val

    _, val = get_row_value(rows, r"aforo")
    if val:
        data["aforo"] = val

    return data


def parse_description_tab(html):
    """Parse the description tab."""
    soup = BeautifulSoup(html, "html.parser")
    data = {}
    rows = soup.find_all("tr")

    _, val = get_row_value(rows, r"tem[aá]tica")
    if val:
        data["tematica"] = val

    for row in rows:
        cells = row.find_all("td")
        if len(cells) >= 2:
            label = cells[0].get_text(strip=True)
            if label.startswith("Titularidad:") and "específica" not in label.lower():
                data["titularidad"] = clean_text(cells[1].get_text())
            elif label.startswith("Gestión:") and "específica" not in label.lower():
                data["gestion"] = clean_text(cells[1].get_text())

    _, val = get_row_value(rows, r"fecha.*creaci[oó]n|apertura")
    if val:
        data["fecha_creacion"] = val

    _, val = get_row_value(rows, r"visitantes")
    if val:
        data["visitantes_anuales"] = val

    _, val = get_row_value(rows, r"superficie.*permanente")
    if val:
        data["superficie_permanente"] = val

    _, val = get_row_value(rows, r"superficie.*temporal")
    if val:
        data["superficie_temporal"] = val

    # Try to get description text
    _, val = get_row_value(rows, r"descripci[oó]n|breve rese")
    if val:
        data["descripcion"] = val

    # Try to get collections info
    _, val = get_row_value(rows, r"colecci[oó]n|fondos")
    if val:
        data["colecciones"] = val

    # Building/architecture
    _, val = get_row_value(rows, r"edificio|inmueble|sede")
    if val:
        data["edificio"] = val

    return data


def scrape_museum_details(session, museum_id, nombre, retries=2):
    """Scrape all 3 tabs for a single museum."""
    for attempt in range(retries):
        try:
            info_html = get_museum_detail(session, museum_id, "informacion")
            time.sleep(0.2)
            visit_html = get_museum_detail(session, museum_id, "visita")
            time.sleep(0.2)
            desc_html = get_museum_detail(session, museum_id, "descripcion")
            time.sleep(0.2)

            info = parse_info_tab(info_html)
            visit = parse_visit_tab(visit_html)
            desc = parse_description_tab(desc_html)

            return {
                "id": museum_id,
                "nombre": nombre,
                **info,
                **visit,
                **desc,
            }
        except Exception as e:
            if attempt < retries - 1:
                print(f"    Retry {attempt + 1} for {nombre}: {e}")
                time.sleep(3)
            else:
                print(f"    FAILED {nombre} (ID:{museum_id}): {e}")
                return {
                    "id": museum_id,
                    "nombre": nombre,
                    "error": str(e),
                }


def scrape_all_museums():
    print("=" * 60)
    print("Scraper v2 - Museos y Colecciones de España")
    print("Estrategia: búsqueda por provincia (52 provincias)")
    print("=" * 60)

    # Load checkpoint
    checkpoint = load_checkpoint()
    all_museums = checkpoint["museums"]
    provinces_done = set(checkpoint["provinces_done"])
    seen_ids = set(checkpoint["seen_ids"])

    session = get_session()

    # ─── Phase 1: Collect all museum IDs by province ───
    print("\n[1/3] Recopilando IDs por provincia...")
    all_museum_ids = []

    # Also do a general search to catch any museums not found by province
    strategies = []

    # Strategy 1: Province-by-province search
    for prov_id, prov_name in sorted(PROVINCIAS.items()):
        if prov_id in provinces_done:
            continue
        strategies.append(("province", prov_id, prov_name))

    if not strategies:
        print("  All provinces already scraped from checkpoint.")
    else:
        for strategy_type, prov_id, prov_name in strategies:
            try:
                html = get_province_results(session, prov_id, 1)
                museums = parse_search_results(html)
                max_page = get_max_page(html)

                # Get remaining pages
                for page in range(2, max_page + 1):
                    time.sleep(0.3)
                    html = get_province_results(session, prov_id, page)
                    museums.extend(parse_search_results(html))

                new_count = 0
                for m in museums:
                    if m["id"] not in seen_ids:
                        seen_ids.add(m["id"])
                        all_museum_ids.append(m)
                        new_count += 1

                provinces_done.add(prov_id)
                print(f"  [{prov_id:2d}/52] {prov_name}: {len(museums)} found, {new_count} new (pages: {max_page})")
                time.sleep(0.3)

            except Exception as e:
                print(f"  ERROR [{prov_id}] {prov_name}: {e}")
                time.sleep(2)

    # Strategy 2: General search to catch stragglers
    print("\n  Búsqueda general complementaria...")
    try:
        html = get_all_results(session, 1)
        max_page = get_max_page(html)
        general_new = 0

        for page in range(1, max_page + 1):
            if page > 1:
                html = get_all_results(session, page)
            museums = parse_search_results(html)
            for m in museums:
                if m["id"] not in seen_ids:
                    seen_ids.add(m["id"])
                    all_museum_ids.append(m)
                    general_new += 1
            if page % 20 == 0:
                print(f"    Página {page}/{max_page}...")
            time.sleep(0.3)

        print(f"  General search: {general_new} additional museums found")
    except Exception as e:
        print(f"  General search error: {e}")

    # Filter out already scraped IDs
    already_scraped_ids = {m["id"] for m in all_museums}
    museums_to_scrape = [m for m in all_museum_ids if m["id"] not in already_scraped_ids]

    total_ids = len(seen_ids)
    print(f"\n  Total unique museum IDs: {total_ids}")
    print(f"  Already scraped: {len(already_scraped_ids)}")
    print(f"  To scrape: {len(museums_to_scrape)}")

    # ─── Phase 2: Scrape details ───
    if museums_to_scrape:
        print(f"\n[2/3] Descargando detalles ({len(museums_to_scrape)} museos)...")
        total = len(museums_to_scrape)

        for i, museum_basic in enumerate(museums_to_scrape, 1):
            museum_data = scrape_museum_details(
                session, museum_basic["id"], museum_basic["nombre"]
            )
            all_museums.append(museum_data)

            if i % 25 == 0 or i == total:
                print(f"  [{i}/{total}] {museum_basic['nombre'][:50]}")

            if i % 50 == 0:
                save_checkpoint(all_museums, list(provinces_done), list(seen_ids))
                print(f"  >>> Checkpoint: {len(all_museums)} museums saved")
    else:
        print("\n[2/3] No new museums to scrape.")

    # ─── Phase 3: Save final output ───
    print(f"\n[3/3] Guardando {len(all_museums)} museos...")
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_museums, f, ensure_ascii=False, indent=2)

    # Stats
    errors = sum(1 for m in all_museums if "error" in m)
    with_address = sum(1 for m in all_museums if m.get("municipio"))
    with_horario = sum(1 for m in all_museums if m.get("horario"))
    with_web = sum(1 for m in all_museums if m.get("web"))

    # Group by comunidad
    by_ccaa = {}
    for m in all_museums:
        ccaa = m.get("comunidad", "Sin comunidad")
        by_ccaa[ccaa] = by_ccaa.get(ccaa, 0) + 1

    print(f"\n{'=' * 60}")
    print("RESUMEN:")
    print(f"  Total museos: {len(all_museums)}")
    print(f"  Con dirección: {with_address}")
    print(f"  Con horario: {with_horario}")
    print(f"  Con web: {with_web}")
    print(f"  Errores: {errors}")
    print(f"\nPor Comunidad Autónoma:")
    for ccaa, count in sorted(by_ccaa.items(), key=lambda x: -x[1]):
        print(f"  {ccaa}: {count}")
    print(f"{'=' * 60}")

    # Cleanup checkpoint
    if os.path.exists(CHECKPOINT_FILE):
        os.remove(CHECKPOINT_FILE)
        print("  Checkpoint file removed.")

    print(f"\n  Output: {OUTPUT_FILE}")
    return all_museums


if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    scrape_all_museums()
