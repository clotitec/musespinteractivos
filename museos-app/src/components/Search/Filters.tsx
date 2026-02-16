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

  const selectClass = "bg-white border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors";

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

      <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.gratuito}
          onChange={(e) => update('gratuito', e.target.checked)}
          className="rounded-sm border-neutral-300 text-neutral-900 focus:ring-neutral-900/30"
        />
        Solo gratuitos
      </label>

      {(filters.comunidad || filters.provincia || filters.tematica || filters.gratuito) && (
        <button
          onClick={() => onChange({ ...filters, comunidad: '', provincia: '', tematica: '', gratuito: false })}
          className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
