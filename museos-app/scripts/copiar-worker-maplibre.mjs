// Copia el worker de MapLibre GL (módulo ESM + chunk compartido) a public/maplibre/.
// Motivo: en el bundle de Next/Turbopack `import.meta.url` no es una URL http, así que
// MapLibre no sabe dónde está su worker y el mapa se queda sin teselas en silencio.
// Se ejecuta en `prebuild` y `predev` (ver package.json). La carpeta destino está en .gitignore.
import { createRequire } from 'node:module';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const raiz = path.dirname(require.resolve('maplibre-gl/package.json'));
const version = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8')).version;
const origen = path.join(raiz, 'dist');
const destino = path.resolve('public', 'maplibre');
const ficheros = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

mkdirSync(destino, { recursive: true });
for (const f of ficheros) copyFileSync(path.join(origen, f), path.join(destino, f));
console.log(`maplibre-gl ${version}: worker copiado a public/maplibre/ (${ficheros.join(', ')})`);
