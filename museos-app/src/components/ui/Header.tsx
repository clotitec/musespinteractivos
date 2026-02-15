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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent leading-tight">
              Museos de Espa&ntilde;a
            </h1>
            <p className="text-[10px] text-gray-500 leading-tight">Plataforma Interactiva</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
