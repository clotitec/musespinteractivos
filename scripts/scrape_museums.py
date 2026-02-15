"""
Scraper para el Directorio de Museos y Colecciones de España
https://directoriomuseos.mcu.es/dirmuseos/

Extrae datos de los ~1,540 museos del directorio nacional.
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
DETAIL_URL = f"{BASE_URL}/mostrarDetalleMuseo.do"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
PROJECT_DIR = os.path.dirname(SCRIPT_DIR) if "__file__" in dir() else os.getcwd()
OUTPUT_FILE = os.path.join(PROJECT_DIR, "data", "museums_raw.json")


def get_session():
    session = requests.Session()
    session.headers.update(HEADERS)
    session.get(f"{BASE_URL}/mostrarBusquedaGeneral.do", timeout=30)
    return session


def get_search_results_page(session, page=1):
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
    soup = BeautifulSoup(html, "html.parser")
    museums = []
    links = soup.find_all("a", href=re.compile(r"idMuseo=(\d+)"))
    seen_ids = set()
    for link in links:
        href = link.get("href", "")
        match = re.search(r"idMuseo=(\d+)", href)
        if match:
            museum_id = int(match.group(1))
            if museum_id not in seen_ids:
                seen_ids.add(museum_id)
                name = link.get_text(strip=True)
                if name:
                    museums.append({"id": museum_id, "nombre": name})
    return museums


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
    """Parse the information tab - address includes municipio(provincia), CCAA."""
    soup = BeautifulSoup(html, "html.parser")
    data = {}
    rows = soup.find_all("tr")

    # Museo/Coleccion
    _, val = get_row_value(rows, r"museo.*colecci")
    if val:
        data["tipo_centro"] = val

    # Matriz/Filial
    _, val = get_row_value(rows, r"matriz|filial")
    if val:
        data["clasificacion"] = val

    # Direccion - parse structured address from HTML
    for row in rows:
        cells = row.find_all("td")
        if len(cells) >= 2 and "direcci" in cells[0].get_text(strip=True).lower():
            addr_html = str(cells[1])
            addr_text = cells[1].get_text(separator="|", strip=True)

            # The HTML structure is:
            # Street info, number. <br/> CP Municipio (Provincia), CCAA
            parts = addr_text.split("|")
            # Clean and join street parts before the CP/city part
            all_text = clean_text(cells[1].get_text())
            data["direccion_completa"] = all_text

            # Extract CP (5-digit postal code)
            cp_match = re.search(r"\b(\d{5})\b", all_text)
            if cp_match:
                data["cp"] = cp_match.group(1)

            # Extract from HTML: after <br/> tag is CP + Municipio (Provincia), CCAA
            br_split = re.split(r"<br\s*/?>", addr_html)
            if len(br_split) >= 2:
                location_part = BeautifulSoup(br_split[-1], "html.parser").get_text()
                location_clean = clean_text(location_part)

                # Pattern: CP Municipio (Provincia), CCAA
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
                    # Try without parentheses: CP Municipio, Provincia, CCAA
                    loc_match2 = re.match(
                        r"(\d{5})?\s*(.+?)(?:,\s*(.+))?$", location_clean
                    )
                    if loc_match2:
                        data["municipio"] = clean_text(loc_match2.group(2))

            # Extract street part (before CP)
            if data.get("cp"):
                street_part = all_text.split(data["cp"])[0]
                data["direccion"] = clean_text(street_part).rstrip(",. ")
            break

    # Director
    _, val = get_row_value(rows, r"director")
    if val:
        data["director"] = val

    # Telefono
    _, val = get_row_value(rows, r"tel[eé]fono")
    if val:
        data["telefono"] = val

    # Fax
    _, val = get_row_value(rows, r"fax")
    if val:
        data["fax"] = val

    # Email
    _, val = get_row_value(rows, r"correo|e-?mail")
    if val:
        data["email"] = val

    # Web
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
    soup = BeautifulSoup(html, "html.parser")
    data = {}
    rows = soup.find_all("tr")

    _, val = get_row_value(rows, r"tem[aá]tica")
    if val:
        data["tematica"] = val

    _, val = get_row_value(rows, r"^titularidad")
    if val and "específica" not in val.lower()[:20]:
        data["titularidad"] = val

    # Get titularidad row specifically (not especifica)
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

    return data


def scrape_all_museums():
    print("=" * 60)
    print("Scraper de Museos y Colecciones de España")
    print("=" * 60)

    session = get_session()
    all_museum_ids = []

    # Step 1: Get all museum IDs from search results
    print("\n[1/3] Recopilando IDs de museos...")

    html = get_search_results_page(session, 1)
    museums = parse_search_results(html)
    all_museum_ids.extend(museums)
    print(f"  Página 1: {len(museums)} museos")

    soup = BeautifulSoup(html, "html.parser")
    page_links = soup.find_all("a", href=re.compile(r"pag=\d+"))
    max_page = 1
    for link in page_links:
        match = re.search(r"pag=(\d+)", link.get("href", ""))
        if match:
            max_page = max(max_page, int(match.group(1)))

    print(f"  Total páginas: {max_page}")

    for page in range(2, max_page + 1):
        try:
            html = get_search_results_page(session, page)
            museums = parse_search_results(html)
            all_museum_ids.extend(museums)
            if page % 10 == 0:
                print(f"  Página {page}/{max_page}: {len(all_museum_ids)} total")
            time.sleep(0.3)
        except Exception as e:
            print(f"  ERROR en página {page}: {e}")
            time.sleep(2)

    print(f"  Total IDs: {len(all_museum_ids)}")

    # Step 2: Get details for each museum
    print("\n[2/3] Descargando detalles de cada museo...")
    all_museums = []
    total = len(all_museum_ids)

    for i, museum_basic in enumerate(all_museum_ids, 1):
        museum_id = museum_basic["id"]
        nombre = museum_basic["nombre"]

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

            museum_data = {
                "id": museum_id,
                "nombre": nombre,
                **info,
                **visit,
                **desc,
            }

            all_museums.append(museum_data)

            if i % 25 == 0 or i == total:
                print(f"  [{i}/{total}] {nombre}")

            if i % 100 == 0:
                save_data(all_museums, OUTPUT_FILE)
                print(f"  >>> Progreso guardado: {len(all_museums)} museos")

        except Exception as e:
            print(f"  ERROR [{i}/{total}] {nombre} (ID:{museum_id}): {e}")
            all_museums.append({
                "id": museum_id,
                "nombre": nombre,
                "error": str(e),
            })
            time.sleep(2)

    # Step 3: Save
    print(f"\n[3/3] Guardando {len(all_museums)} museos...")
    save_data(all_museums, OUTPUT_FILE)
    print(f"  Datos guardados en: {OUTPUT_FILE}")

    errors = sum(1 for m in all_museums if "error" in m)
    with_address = sum(1 for m in all_museums if m.get("municipio"))
    print(f"\n{'=' * 60}")
    print(f"RESUMEN:")
    print(f"  Total museos: {len(all_museums)}")
    print(f"  Con dirección parseada: {with_address}")
    print(f"  Errores: {errors}")
    print(f"{'=' * 60}")

    return all_museums


def save_data(museums, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(museums, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    scrape_all_museums()
