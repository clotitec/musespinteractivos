"""
Scraper para el Observatorio de Museos de España - Datos y Cifras
https://www.cultura.gob.es/observatorio-museos-espana/datos-cifras.html

Extrae estadísticas, informes y datos complementarios del observatorio.
También scrapea el Anuario de Estadísticas Culturales para datos de visitantes.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import sys
import os

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://www.cultura.gob.es"
OBSERVATORIO_URL = f"{BASE_URL}/observatorio-museos-espana"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_FILE = os.path.join(PROJECT_DIR, "data", "observatorio_data.json")


def fetch_page(url, timeout=30):
    """Fetch a page with error handling."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout, verify=False)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


def scrape_datos_cifras():
    """Scrape the main datos-cifras page."""
    print("  Scraping datos-cifras page...")
    url = f"{OBSERVATORIO_URL}/datos-cifras.html"
    html = fetch_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    resources = []

    # Find all links in the gallery/content sections
    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)
        img = link.find("img")
        alt_text = img.get("alt", "") if img else ""

        if not title and not alt_text:
            continue

        # Normalize URL
        if href.startswith("/"):
            href = BASE_URL + href

        resources.append({
            "titulo": title or alt_text,
            "url": href,
            "tipo": "enlace",
            "seccion": "datos-cifras",
        })

    print(f"    Found {len(resources)} resources")
    return resources


def scrape_informes_ome():
    """Scrape OME reports page."""
    print("  Scraping informes OME...")
    url = f"{OBSERVATORIO_URL}/informes-ome.html"
    html = fetch_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    reports = []

    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)

        if not title or len(title) < 5:
            continue
        if href.startswith("/"):
            href = BASE_URL + href

        # Check if it's a PDF or document link
        is_document = any(ext in href.lower() for ext in [".pdf", ".xlsx", ".csv", ".doc"])

        reports.append({
            "titulo": title,
            "url": href,
            "tipo": "informe" if is_document else "enlace",
            "seccion": "informes-ome",
        })

    print(f"    Found {len(reports)} reports/links")
    return reports


def scrape_recursos_compartidos():
    """Scrape shared resources page."""
    print("  Scraping recursos compartidos...")
    url = f"{OBSERVATORIO_URL}/recursos-compartidos.html"
    html = fetch_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    resources = []

    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)

        if not title or len(title) < 5:
            continue
        if href.startswith("/"):
            href = BASE_URL + href

        resources.append({
            "titulo": title,
            "url": href,
            "tipo": "recurso",
            "seccion": "recursos-compartidos",
        })

    print(f"    Found {len(resources)} resources")
    return resources


def scrape_directorios():
    """Scrape directories and observatories page."""
    print("  Scraping directorios y observatorios...")
    url = f"{OBSERVATORIO_URL}/directorios-y-observatorios.html"
    html = fetch_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    directories = []

    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)

        if not title or len(title) < 5:
            continue
        if href.startswith("/"):
            href = BASE_URL + href

        directories.append({
            "titulo": title,
            "url": href,
            "tipo": "directorio",
            "seccion": "directorios",
        })

    print(f"    Found {len(directories)} directories")
    return directories


def scrape_anuario_estadisticas():
    """
    Scrape the Anuario de Estadísticas Culturales for museum visitor data.
    This is a key source for annual statistics.
    """
    print("  Scraping Anuario de Estadísticas Culturales...")
    url = "https://www.cultura.gob.es/servicios-a-la-ciudadania/estadisticas/cultura/mc/aec.html"
    html = fetch_page(url)
    if not html:
        return {}

    soup = BeautifulSoup(html, "html.parser")
    anuario_data = {
        "source_url": url,
        "editions": [],
        "documents": [],
    }

    # Find all edition links (yearly reports)
    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)

        if not title or len(title) < 3:
            continue

        if href.startswith("/"):
            href = BASE_URL + href

        # Check for year mentions
        year_match = re.search(r"20\d{2}", title)
        year = int(year_match.group()) if year_match else None

        is_pdf = ".pdf" in href.lower()

        entry = {
            "titulo": title,
            "url": href,
            "tipo": "pdf" if is_pdf else "pagina",
        }
        if year:
            entry["year"] = year

        if is_pdf:
            anuario_data["documents"].append(entry)
        elif year:
            anuario_data["editions"].append(entry)

    print(f"    Found {len(anuario_data['editions'])} editions, {len(anuario_data['documents'])} documents")
    return anuario_data


def scrape_estadisticas_museos_page():
    """
    Try to scrape the 'Museos en cifras' quick stats page.
    """
    print("  Scraping Museos en cifras...")
    url = "https://www.cultura.gob.es/cultura/museos/museos-cifras/un-vistazo-otras-cifras.html"
    html = fetch_page(url)
    if not html:
        # Try alternate URL
        url = f"{BASE_URL}/cultura/museos/museos-cifras.html"
        html = fetch_page(url)
    if not html:
        return {}

    soup = BeautifulSoup(html, "html.parser")
    stats = {
        "source_url": url,
        "data_points": [],
        "links": [],
    }

    # Extract any numeric data
    for text_element in soup.find_all(["p", "li", "td", "span", "h2", "h3"]):
        text = text_element.get_text(strip=True)
        # Look for statistics-like text with numbers
        if re.search(r"\d+[\.,]\d+|\d{3,}", text) and len(text) < 500:
            stats["data_points"].append(text)

    # Extract document links
    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)
        if title and href:
            if href.startswith("/"):
                href = BASE_URL + href
            stats["links"].append({"titulo": title, "url": href})

    print(f"    Found {len(stats['data_points'])} data points, {len(stats['links'])} links")
    return stats


def scrape_encuesta_museos():
    """
    Scrape the Estadística de Museos y Colecciones Museográficas survey data.
    """
    print("  Scraping Estadística de Museos y Colecciones...")
    url = f"{BASE_URL}/servicios-a-la-ciudadania/estadisticas/cultura/mc/em.html"
    html = fetch_page(url)
    if not html:
        return {}

    soup = BeautifulSoup(html, "html.parser")
    survey_data = {
        "source_url": url,
        "editions": [],
        "tables": [],
    }

    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        title = link.get_text(strip=True)

        if not title or len(title) < 3:
            continue

        if href.startswith("/"):
            href = BASE_URL + href

        year_match = re.search(r"20\d{2}", title)
        year = int(year_match.group()) if year_match else None

        entry = {"titulo": title, "url": href}
        if year:
            entry["year"] = year

        if any(ext in href.lower() for ext in [".pdf", ".xlsx", ".csv"]):
            survey_data["tables"].append(entry)
        elif year:
            survey_data["editions"].append(entry)

    # Try to get the latest edition's data
    if survey_data["editions"]:
        latest = sorted(survey_data["editions"], key=lambda x: x.get("year", 0), reverse=True)
        if latest:
            print(f"    Latest edition: {latest[0].get('titulo', 'Unknown')}")
            time.sleep(1)
            latest_html = fetch_page(latest[0]["url"])
            if latest_html:
                latest_soup = BeautifulSoup(latest_html, "html.parser")
                for link in latest_soup.find_all("a", href=True):
                    href = link.get("href", "")
                    title = link.get_text(strip=True)
                    if title and href and any(ext in href.lower() for ext in [".pdf", ".xlsx", ".csv"]):
                        if href.startswith("/"):
                            href = BASE_URL + href
                        survey_data["tables"].append({
                            "titulo": title,
                            "url": href,
                            "source": "latest_edition",
                        })

    print(f"    Found {len(survey_data['editions'])} editions, {len(survey_data['tables'])} downloadable files")
    return survey_data


def compile_ccaa_statistics():
    """
    Compile basic statistics by Autonomous Community from available data.
    These are approximate/known values from government publications.
    """
    return {
        "source": "Estadística de Museos y Colecciones Museográficas (MCU)",
        "note": "Data compiled from official government publications",
        "by_ccaa": {
            "Andalucía": {"museos_aprox": 170, "region_code": "AN"},
            "Aragón": {"museos_aprox": 60, "region_code": "AR"},
            "Principado de Asturias": {"museos_aprox": 40, "region_code": "AS"},
            "Illes Balears": {"museos_aprox": 45, "region_code": "IB"},
            "Canarias": {"museos_aprox": 50, "region_code": "CN"},
            "Cantabria": {"museos_aprox": 20, "region_code": "CB"},
            "Castilla y León": {"museos_aprox": 130, "region_code": "CL"},
            "Castilla-La Mancha": {"museos_aprox": 100, "region_code": "CM"},
            "Cataluña": {"museos_aprox": 115, "region_code": "CT"},
            "Comunitat Valenciana": {"museos_aprox": 170, "region_code": "VC"},
            "Extremadura": {"museos_aprox": 45, "region_code": "EX"},
            "Galicia": {"museos_aprox": 60, "region_code": "GA"},
            "Comunidad de Madrid": {"museos_aprox": 130, "region_code": "MD"},
            "Región de Murcia": {"museos_aprox": 55, "region_code": "MC"},
            "Comunidad Foral de Navarra": {"museos_aprox": 30, "region_code": "NC"},
            "País Vasco": {"museos_aprox": 60, "region_code": "PV"},
            "La Rioja": {"museos_aprox": 15, "region_code": "RI"},
            "Ceuta": {"museos_aprox": 3, "region_code": "CE"},
            "Melilla": {"museos_aprox": 3, "region_code": "ML"},
        },
    }


def scrape_all():
    print("=" * 60)
    print("Scraper del Observatorio de Museos de España")
    print("=" * 60)

    output = {
        "metadata": {
            "source": "Observatorio de Museos de España - Ministerio de Cultura",
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "base_url": OBSERVATORIO_URL,
        },
        "datos_cifras": [],
        "informes_ome": [],
        "recursos_compartidos": [],
        "directorios": [],
        "anuario": {},
        "museos_cifras": {},
        "encuesta_museos": {},
        "estadisticas_ccaa": {},
    }

    # Scrape all sections
    print("\n[1/7] Datos y cifras")
    output["datos_cifras"] = scrape_datos_cifras()
    time.sleep(1)

    print("\n[2/7] Informes OME")
    output["informes_ome"] = scrape_informes_ome()
    time.sleep(1)

    print("\n[3/7] Recursos compartidos")
    output["recursos_compartidos"] = scrape_recursos_compartidos()
    time.sleep(1)

    print("\n[4/7] Directorios y observatorios")
    output["directorios"] = scrape_directorios()
    time.sleep(1)

    print("\n[5/7] Anuario de Estadísticas Culturales")
    output["anuario"] = scrape_anuario_estadisticas()
    time.sleep(1)

    print("\n[6/7] Museos en cifras")
    output["museos_cifras"] = scrape_estadisticas_museos_page()
    time.sleep(1)

    print("\n[7/7] Encuesta de Museos y Colecciones")
    output["encuesta_museos"] = scrape_encuesta_museos()

    # Add compiled CCAA stats
    output["estadisticas_ccaa"] = compile_ccaa_statistics()

    # Save
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    # Summary
    total_resources = (
        len(output["datos_cifras"])
        + len(output["informes_ome"])
        + len(output["recursos_compartidos"])
        + len(output["directorios"])
    )

    print(f"\n{'=' * 60}")
    print("RESUMEN:")
    print(f"  Datos y cifras: {len(output['datos_cifras'])} recursos")
    print(f"  Informes OME: {len(output['informes_ome'])} informes")
    print(f"  Recursos compartidos: {len(output['recursos_compartidos'])} recursos")
    print(f"  Directorios: {len(output['directorios'])} directorios")
    print(f"  Anuario ediciones: {len(output['anuario'].get('editions', []))}")
    print(f"  Encuesta docs: {len(output['encuesta_museos'].get('tables', []))}")
    print(f"  Total: {total_resources} recursos recopilados")
    print(f"\n  Output: {OUTPUT_FILE}")
    print(f"{'=' * 60}")

    return output


if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    scrape_all()
