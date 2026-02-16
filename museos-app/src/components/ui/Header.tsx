'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Search, List, Stamp, BarChart3 } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

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
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300
      bg-white/90 border-b border-gray-200 backdrop-blur-md
      dark:bg-gray-950/90 dark:border-gray-800 dark:backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-amber-500 dark:from-purple-400 dark:to-amber-400 bg-clip-text text-transparent leading-tight">
              Museos de Espa&ntilde;a
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Plataforma Interactiva</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
