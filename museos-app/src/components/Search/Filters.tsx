'use client';

import type { MuseumFilters } from '@/lib/types';

interface FiltersProps {
  filters: MuseumFilters;
  onChange: (filters: MuseumFilters) => void;
  comunidades: string[];
  provincias: string[];
  tematicas: string[];
}

export default function Filters({ filters, onChange, comunidades, provincias, tematicas }: FiltersProps) {
  const update = (key: keyof MuseumFilters, value: string | boolean) => {
    onChange({ ...filters, [key]: value });
  };

  const selectClass = "bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-all";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={filters.comunidad}
        onChange={(e) => update('comunidad', e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las comunidades</option>
        {comunidades.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.provincia}
        onChange={(e) => update('provincia', e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las provincias</option>
        {provincias.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filters.tematica}
        onChange={(e) => update('tematica', e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las tem&aacute;ticas</option>
        {tematicas.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.gratuito}
          onChange={(e) => update('gratuito', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/30"
        />
        Solo gratuitos
      </label>

      {(filters.comunidad || filters.provincia || filters.tematica || filters.gratuito) && (
        <button
          onClick={() => onChange({ ...filters, comunidad: '', provincia: '', tematica: '', gratuito: false })}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
