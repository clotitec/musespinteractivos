import Link from 'next/link';
import { SITE_CLAIM, SITE_NAME } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500 text-sm font-extrabold text-neutral-900 font-display">M</span>
          <p>
            <span className="font-display font-bold text-neutral-900">{SITE_NAME}</span> · {SITE_CLAIM}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/buscar" className="hover:text-neutral-900">Buscar</Link>
          <Link href="/lista" className="hover:text-neutral-900">Lista</Link>
          <Link href="/estadisticas" className="hover:text-neutral-900">Datos</Link>
          <Link href="/para-museos" className="font-semibold text-neutral-900 hover:text-pink-600">Para museos</Link>
        </nav>
        <p className="text-neutral-500">
          Datos: Directorio de Museos (Ministerio de Cultura), OpenStreetMap, Wikidata · Una solución de CLOTITEC
        </p>
      </div>
    </footer>
  );
}
