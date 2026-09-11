import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Solicitud recibida · Para museos', robots: { index: false } };

export default function GraciasPage() {
  return (
    <section className="pm-wrap py-20 text-center">
      <span className="pm-label">Solicitud recibida</span>
      <h1 className="mt-3 text-3xl font-bold md:text-5xl">Gracias. Le respondemos en 48 h laborables.</h1>
      <div className="pm-acento mx-auto mt-5" />
      <p className="mx-auto mt-5 max-w-xl text-[var(--gris)]">
        Revisaremos la ficha de su museo en el portal y le enviaremos un diagnóstico con la propuesta. Si prefiere hablar antes, escriba a info@clotitec.com.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/para-museos" className="pm-btn-sec">Volver al catálogo</Link>
        <Link href="/" className="pm-btn">Ir al mapa de museos</Link>
      </div>
    </section>
  );
}
