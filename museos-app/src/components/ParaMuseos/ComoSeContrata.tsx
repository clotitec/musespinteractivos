import Link from 'next/link';

const PASOS = [
  {
    n: '1',
    titulo: 'Diagnóstico gratuito',
    texto: 'Revisamos su ficha en el portal, su visita virtual (si la tiene) y qué le falta para atraer visitantes y grupos.',
  },
  {
    n: '2',
    titulo: 'Dos contratos claros',
    texto: 'Producción con importe cerrado y licencia mensual de la plataforma (hosting, visor, panel, actualizaciones). Sin sorpresas.',
  },
  {
    n: '3',
    titulo: 'Contrato menor y fondos',
    texto: 'Setup y primer año por debajo de 15.000 € para ayuntamientos y consejerías. Le indicamos las subvenciones de turismo y cultura aplicables.',
  },
];

export default function ComoSeContrata() {
  return (
    <section id="contratar" className="pm-arena scroll-mt-32">
      <div className="pm-wrap py-16">
        <span className="pm-label">Cómo se contrata</span>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Sencillo para un museo, sencillo para un ayuntamiento</h2>
        <div className="pm-acento mt-4" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PASOS.map((p) => (
            <div key={p.n} className="pm-card !bg-white">
              <span className="text-4xl font-bold text-[var(--verde)]" style={{ fontFamily: 'var(--f-tit)' }}>{p.n}</span>
              <h3 className="mt-2 text-lg font-bold">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gris)]">{p.texto}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--gris)]">
          ¿Ya tiene una reunión con nosotros?{' '}
          <Link href="/para-museos/precios" className="font-bold text-[var(--verde-600)] underline underline-offset-2">
            Consulte la lista de precios con su clave
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
