import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import ClaveForm from '@/components/ParaMuseos/ClaveForm';
import TablaPrecios from '@/components/ParaMuseos/TablaPrecios';
import { COOKIE_PRECIOS, verificar } from '@/lib/precios-gate';

export const metadata: Metadata = {
  title: 'Lista de precios · Para museos',
  robots: { index: false, follow: false, nocache: true },
};

export default async function PreciosPage() {
  const jar = await cookies();
  const ok = await verificar(jar.get(COOKIE_PRECIOS)?.value, process.env.PRECIOS_SECRET);

  return (
    <section className="pm-wrap py-14 md:py-20">
      {ok ? (
        <>
          <span className="pm-label">Lista de precios · canal museos</span>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Precios orientativos, septiembre de 2026</h1>
          <div className="pm-acento mt-4" />
          <p className="mt-4 max-w-2xl text-[var(--gris)]">
            Documento de trabajo compartido en reunión. Importes sin IVA. Cada propuesta se cierra a medida del museo.
          </p>
          <div className="mt-8">
            <TablaPrecios />
          </div>
        </>
      ) : (
        <ClaveForm />
      )}
    </section>
  );
}
