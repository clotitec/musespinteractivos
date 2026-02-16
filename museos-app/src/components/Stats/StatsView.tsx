'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Museum } from '@/lib/types';

const COLORS = ['#1a1a1a', '#404040', '#737373', '#991b1b', '#b91c1c', '#dc2626', '#525252', '#a3a3a3', '#d4d4d4', '#7f1d1d', '#450a0a', '#292524', '#78716c', '#57534e', '#44403c'];

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
    { label: 'Total centros', value: museums.length },
    { label: 'Museos', value: totalMuseos },
    { label: 'Colecciones', value: totalColecciones },
    { label: 'Gratuitos', value: gratuitos },
    { label: 'Con web', value: conWeb },
    { label: 'Con horario', value: conHorario },
  ];

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-neutral-200 p-4 text-center">
            <p className="text-2xl font-bold text-neutral-900">{value.toLocaleString('es-ES')}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - by comunidad */}
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Museos por Comunidad Aut&oacute;noma</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comunidadData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#a3a3a3', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '0', color: '#1a1a1a' }}
                formatter={(value) => [String(value), 'Centros']}
              />
              <Bar dataKey="value" fill="#1a1a1a" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - by tematica */}
        <div className="border border-neutral-200 p-6">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Distribuci&oacute;n por Tem&aacute;tica</h3>
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
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '0', color: '#1a1a1a' }}
              />
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
    </div>
  );
}
