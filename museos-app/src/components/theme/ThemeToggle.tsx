'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg border transition-all duration-300
        dark:border-gray-700 dark:text-gray-400 dark:hover:text-yellow-300 dark:hover:border-yellow-500/40 dark:bg-gray-800/50
        border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400/40 bg-white/50 hover:bg-indigo-50/50"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-[18px] h-[18px]">
        <Sun
          size={18}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          size={18}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
}
