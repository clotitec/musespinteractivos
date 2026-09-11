import type { Metadata } from 'next';
import Link from 'next/link';
import './para-museos.css';

export const metadata: Metadata = {
  title: 'Para museos · visita virtual, juegos y presencia digital | Museos de España',
  description:
    'Soluciones para museos, ayuntamientos y residencias: visita virtual 360, audioguías por QR, realidad aumentada, juegos, vídeos y presencia en el portal de museos de España. Una solución de CLOTITEC.',
};

const NAV = [
  { href: '/para-museos#catalogo', label: 'Catálogo' },
  { href: '/para-museos#contratar', label: 'Cómo se contrata' },
  { href: '/para-museos/museos-en-casa', label: 'Museos en casa' },
  { href: '/para-museos#faq', label: 'Preguntas' },
];

export default function ParaMuseosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pm">
      <nav className="pm-nav">
        <div className="pm-wrap flex h-12 items-center justify-between gap-4">
          <Link href="/para-museos" className="pm-label whitespace-nowrap">
            Para museos
          </Link>
          <div className="hidden items-center gap-5 text-sm md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-[var(--gris)] hover:text-[var(--tinta)]">
                {n.label}
              </Link>
            ))}
          </div>
          <Link href="/para-museos#contacto" className="pm-btn !py-2 !px-4 text-sm">
            Hablemos
          </Link>
        </div>
      </nav>

      {children}

      <footer className="pm-band mt-16">
        <div className="pm-wrap grid gap-8 py-12 md:grid-cols-3">
          <div>
            <img src="/clotitec-white.png" alt="CLOTITEC" width={136} height={39} className="mb-4 h-10 w-auto" />
            <p className="text-sm text-white/80">Una solución de CLOTITEC. Potenciamos tu patrimonio con innovación y tecnología.</p>
          </div>
          <div className="text-sm text-white/80">
            <p className="pm-label !text-[var(--pink)]">Contacto</p>
            <p className="mt-2">info@clotitec.com</p>
            <p>clotitec.com · Santander, Cantabria</p>
          </div>
          <div className="text-sm text-white/80">
            <p className="pm-label !text-[var(--pink)]">Enlaces</p>
            <ul className="mt-2 space-y-1">
              <li><Link href="/" className="hover:text-white">Mapa de museos</Link></li>
              <li><Link href="/para-museos#catalogo" className="hover:text-white">Catálogo</Link></li>
              <li><Link href="/para-museos/precios" className="hover:text-white">Lista de precios (con clave)</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
