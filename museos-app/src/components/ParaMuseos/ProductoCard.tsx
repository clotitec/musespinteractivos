import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SALIDAS, SEGMENTOS, type Producto } from '@/content/productos';

export default function ProductoCard({ producto }: { producto: Producto }) {
  return (
    <Link href={`/para-museos/${producto.slug}`} className="pm-card flex h-full flex-col gap-3">
      <span className="pm-label">{SALIDAS[producto.salida].nombre}</span>
      <h3 className="text-xl font-bold">{producto.nombre}</h3>
      <p className="text-sm leading-relaxed text-[var(--gris)]">{producto.claim}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {producto.para.map((s) => (
          <span key={s} className="pm-chip">{SEGMENTOS[s].split(' ')[0]}</span>
        ))}
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--verde-600)]">
        Ver ficha <ArrowRight size={14} />
      </span>
    </Link>
  );
}
