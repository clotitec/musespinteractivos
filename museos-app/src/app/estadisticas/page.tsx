'use client';

import { useMuseums } from '@/hooks/useMuseums';
import StatsView from '@/components/Stats/StatsView';
import Loading from '@/components/ui/Loading';

export default function EstadisticasPage() {
  const { museums, loading } = useMuseums();

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Datos y Estad&iacute;sticas</h2>
        <p className="text-sm text-gray-500">Panorama de los museos y colecciones de Espa&ntilde;a</p>
      </div>
      <StatsView museums={museums} />
    </div>
  );
}
