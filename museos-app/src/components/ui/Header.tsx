'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Search, List, Stamp, BarChart3 } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

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
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${SITE_NAME}, inicio`}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-neutral-900 font-display font-extrabold text-base">M</span>
          <p className="font-display font-bold text-neutral-900 text-lg leading-none tracking-tight">
            {SITE_NAME}
          </p>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-neutral-50 text-neutral-900 shadow-[inset_0_-3px_0_0_#ff7aac]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <Link
            href="/para-museos"
            className={`ml-2 inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              pathname.startsWith('/para-museos')
                ? 'bg-pink-500 text-neutral-900'
                : 'bg-neutral-900 text-white hover:bg-neutral-700'
            }`}
          >
            Para museos
          </Link>
        </nav>
      </div>
    </header>
  );
}
