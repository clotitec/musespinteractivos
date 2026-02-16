'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Search, List, Stamp, BarChart3 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Mapa', icon: Map },
  { href: '/buscar', label: 'Buscar', icon: Search },
  { href: '/lista', label: 'Lista', icon: List },
  { href: '/pasaporte', label: 'Pasaporte', icon: Stamp },
  { href: '/estadisticas', label: 'Datos', icon: BarChart3 },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="text-lg font-display font-bold text-neutral-900 leading-tight tracking-tight">
              Museos de Espa&ntilde;a
            </h1>
            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] leading-tight">Plataforma Interactiva</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-red-900 border-b-2 border-red-900'
                    : 'text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
