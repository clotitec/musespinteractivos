'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { normalizeComunidad, calculateCompleteness, hasServices, hasAccessibility, hasSocialMedia } from '@/lib/utils';
import type { Museum } from '@/lib/types';

const COLORS = ['#1a1a1a', '#404040', '#737373', '#2563eb', '#3b82f6', '#60a5fa', '#525252', '#a3a3a3', '#1d4ed8', '#93c5fd', '#334155', '#292524', '#78716c', '#57534e', '#44403c'];
const COMPLETENESS_COLORS = ['#dc2626', '#f97316', '#ca8a04', '#22c55e', '#16a34a'];

interface StatsViewProps {
  museums: Museum[];
}

export default function StatsView({ museums }: StatsViewProps) {
  // ── By comunidad ──
  const byComunidad: Record<string, number> = {};
  museums.forEach((m) => {
    const raw = m.comunidad_normalized || m.comunidad || 'Sin datos';
    const k = raw !== 'Sin datos' ? normalizeComunidad(raw) : raw;
    byComunidad[k] = (byComunidad[k] || 0) + 1;
  });
  const comunidadData = Object.entries(byComunidad)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, value, fullName: name }));

  // ── By tematica ──
  const byTematica: Record<string, number> = {};
  museums.forEach((m) => {
    const k = m.tematica_normalized || m.tematica || 'Sin datos';
    byTematica[k] = (byTematica[k] || 0) + 1;
  });
  const tematicaData = Object.entries(byTematica)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // ── By titularidad ──
  const byTitularidad: Record<string, number> = {};
  museums.forEach((m) => {
    const k = m.titularidad || 'Sin datos';
    byTitularidad[k] = (byTitularidad[k] || 0) + 1;
  });
  const titularidadData = Object.entries(byTitularidad)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, value, fullName: name }));

  // ── Completeness distribution ──
  const completenessRanges = [
    { name: '0-20%', min: 0, max: 20, count: 0 },
    { name: '21-40%', min: 21, max: 40, count: 0 },
    { name: '41-60%', min: 41, max: 60, count: 0 },
    { name: '61-80%', min: 61, max: 80, count: 0 },
    { name: '81-100%', min: 81, max: 100, count: 0 },
  ];
  museums.forEach((m) => {
    const c = calculateCompleteness(m);
    const range = completenessRanges.find((r) => c >= r.min && c <= r.max);
    if (range) range.count++;
  });
  const completenessData = completenessRanges.map((r) => ({ name: r.name, value: r.count }));

  // ── Summary stats (12 cards) ──
  const totalMuseos = museums.filter((m) => m.tipo_centro?.toLowerCase() === 'museo').length;
  const totalColecciones = museums.length - totalMuseos;
  const gratuitos = museums.filter((m) => m.es_gratuito).length;
  const conWeb = museums.filter((m) => m.web).length;
  const conHorario = museums.filter((m) => m.horario).length;
  const conEmail = museums.filter((m) => m.email).length;
  const conTelefono = museums.filter((m) => m.telefono).length;
  const conImagen = museums.filter((m) => m.imagen_url).length;
  const conRedes = museums.filter((m) => hasSocialMedia(m)).length;
  const accesibles = museums.filter((m) => hasAccessibility(m)).length;
  const conServicios = museums.filter((m) => hasServices(m)).length;

  const stats = [
    { label: 'Total centros', value: museums.length },
    { label: 'Museos', value: totalMuseos },
    { label: 'Colecciones', value: totalColecciones },
    { label: 'Gratuitos', value: gratuitos },
    { label: 'Con web', value: conWeb },
    { label: 'Con horario', value: conHorario },
    { label: 'Con email', value: conEmail },
    { label: 'Con tel\u00e9fono', value: conTelefono },
    { label: 'Con imagen', value: conImagen },
    { label: 'Con redes sociales', value: conRedes },
    { label: 'Accesibles', value: accesibles },
    { label: 'Con servicios', value: conServicios },
  ];

  const tooltipStyle = { background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '0', color: '#1a1a1a' };

  return (
    <div className="space-y-8">
      {/* Summary cards — 12 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-neutral-200 p-4 text-center">
            <p className="text-2xl font-bold text-neutral-900">{value.toLocaleString('es-ES')}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Row 2: CCAA + Temática */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - by comunidad */}
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Museos por Comunidad Aut&oacute;noma</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comunidadData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#a3a3a3', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [String(value), 'Centros']} />
              <Bar dataKey="value" fill="#1a1a1a" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - by tematica */}
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Distribuci&oacute;n por Tem&aacute;tica</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={tematicaData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value">
                {tematicaData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {tematicaData.map((item, i) => (
              <span key={item.name} className="text-[10px] text-neutral-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Titularidad + Completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - by titularidad */}
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Distribuci&oacute;n por Titularidad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={titularidadData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#a3a3a3', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [String(value), 'Centros']} />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - completeness distribution */}
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Calidad de datos (completitud)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completenessData} margin={{ left: 0, right: 20, bottom: 10 }}>
              <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [String(value), 'Museos']} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {completenessData.map((_, i) => (
                  <Cell key={i} fill={COMPLETENESS_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-neutral-400 mt-2 text-center">
            Porcentaje de campos de informaci&oacute;n rellenos por museo
          </p>
        </div>
      </div>
    </div>
  );
}
