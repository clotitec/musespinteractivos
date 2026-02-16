'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Museum } from '@/lib/types';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#f59e0b', '#fbbf24', '#fcd34d', '#ef4444', '#f87171', '#6366f1', '#818cf8', '#34d399', '#6ee7b7', '#f472b6', '#fb923c', '#38bdf8'];

interface StatsViewProps {
  museums: Museum[];
}

export default function StatsView({ museums }: StatsViewProps) {
  // By comunidad
  const byComunidad: Record<string, number> = {};
  museums.forEach((m) => {
    const k = m.comunidad_normalized || m.comunidad || 'Sin datos';
    byComunidad[k] = (byComunidad[k] || 0) + 1;
  });
  const comunidadData = Object.entries(byComunidad)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, value, fullName: name }));

  // By tematica
  const byTematica: Record<string, number> = {};
  museums.forEach((m) => {
    const k = m.tematica_normalized || m.tematica || 'Sin datos';
    byTematica[k] = (byTematica[k] || 0) + 1;
  });
  const tematicaData = Object.entries(byTematica)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Summary stats
  const totalMuseos = museums.filter((m) => m.tipo_centro?.toLowerCase() === 'museo').length;
  const totalColecciones = museums.length - totalMuseos;
  const gratuitos = museums.filter((m) => m.es_gratuito).length;
  const conWeb = museums.filter((m) => m.web).length;
  const conHorario = museums.filter((m) => m.horario).length;

  const stats = [
    { label: 'Total centros', value: museums.length, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Museos', value: totalMuseos, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Colecciones', value: totalColecciones, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Gratuitos', value: gratuitos, color: 'text-green-600 dark:text-green-400' },
    { label: 'Con web', value: conWeb, color: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Con horario', value: conHorario, color: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString('es-ES')}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - by comunidad */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Museos por Comunidad Aut&oacute;noma</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comunidadData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#f3f4f6' }}
                formatter={(value) => [String(value), 'Centros']}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - by tematica */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Distribuci&oacute;n por Tem&aacute;tica</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={tematicaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {tematicaData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#f3f4f6' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {tematicaData.map((item, i) => (
              <span key={item.name} className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
