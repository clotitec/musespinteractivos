import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { PRODUCTOS, SALIDAS, SEGMENTOS, getProducto } from '@/content/productos';
import ProductoCard from '@/components/ParaMuseos/ProductoCard';

const CONTRATACION: Record<string, string> = {
  'dos contratos': 'Producción con importe cerrado (contrato A) y licencia mensual de la plataforma (contrato B): hosting, visor, panel, soporte y actualizaciones. Para ayuntamientos, setup y primer año por debajo de 15.000 €.',
  suscripción: 'Alta única y cuota mensual. Sin permanencia tras el primer año.',
  ficha: 'La ficha básica es gratuita. La verificada se paga por año y la premium por mes; se activan en cuanto se verifica el correo del museo.',
  pack: 'Un solo contrato menor para el ayuntamiento (producción) y una licencia mensual de plataforma. Financiable con fondos de turismo y cultura.',
};

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ producto: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }): Promise<Metadata> {
  const { producto } = await params;
  const p = getProducto(producto);
  if (!p) return {};
  return { title: `${p.nombre} · Para museos`, description: p.claim };
}

export default async function ProductoPage({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params;
  const p = getProducto(producto);
  if (!p) notFound();
  const relacionados = p.relacionados.map(getProducto).filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <>
      <section className="pm-wrap py-12 md:py-16">
        <Link href="/para-museos#catalogo" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--gris)] hover:text-[var(--tinta)]">
          <ArrowLeft size={14} /> Catálogo
        </Link>
        <span className="pm-label mt-6 block">{SALIDAS[p.salida].nombre}</span>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold md:text-5xl">{p.nombre}</h1>
        <div className="pm-acento mt-5" />
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-[var(--gris)]">{p.claim}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {p.para.map((s) => (
            <span key={s} className="pm-chip">{SEGMENTOS[s]}</span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/para-museos?producto=${p.slug}#contacto`} className="pm-btn">Pedir propuesta</Link>
          <Link href="/para-museos/precios" className="pm-btn-sec">Precio con clave</Link>
        </div>
      </section>

      <section className="pm-arena">
        <div className="pm-wrap grid gap-8 py-14 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Qué es</h2>
              <p className="mt-3 leading-relaxed text-[var(--gris)]">{p.queEs}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Qué incluye</h2>
              <ul className="mt-3 space-y-2">
                {p.incluye.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-[var(--gris)]">
                    <Check size={18} className="mt-0.5 shrink-0 text-[var(--verde)]" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="pm-card !bg-white">
              <span className="pm-label">Entregables</span>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--gris)]">
                {p.entregables.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="pm-card !bg-white">
              <span className="pm-label">Plazo</span>
              <p className="mt-2 text-sm text-[var(--gris)]">{p.plazo}</p>
            </div>
            <div className="pm-card !bg-white">
              <span className="pm-label">Cómo se contrata</span>
              <p className="mt-2 text-sm text-[var(--gris)]">{CONTRATACION[p.comoSeContrata]}</p>
              {p.precio.nota && <p className="mt-2 text-xs text-[var(--gris)]">{p.precio.nota}</p>}
            </div>
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="pm-wrap py-14">
          <span className="pm-label">Combina bien con</span>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((r) => (
              <ProductoCard key={r.slug} producto={r} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
