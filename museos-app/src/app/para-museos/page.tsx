import Link from 'next/link';
import museosRef from '@/content/museos-ref.json';
import { PRODUCTOS, SALIDAS, SEGMENTOS } from '@/content/productos';
import ProductoCard from '@/components/ParaMuseos/ProductoCard';
import ComoSeContrata from '@/components/ParaMuseos/ComoSeContrata';
import FormularioLead from '@/components/ParaMuseos/FormularioLead';

type Ref = Record<string, { nombre: string; municipio?: string | null }>;
const REF = museosRef as unknown as Ref;

const PILOTOS = [
  { titulo: 'Museo de Hornillos', texto: 'Captura 360 con perfil de edición suave: la base del producto Museo 360.' },
  { titulo: 'Vías Verdes de Murcia', texto: '250 km y 8 rutas digitalizadas con mapa, 360 y audioguías (PRTR).' },
  { titulo: 'Descubre Llanes', texto: 'Más de un millón de impresiones en redes con contenidos del territorio.' },
  { titulo: 'Bareyo', texto: 'Primera plataforma municipal por suscripción de CLOTITEC.' },
];

const FAQ = [
  { q: '¿Hay que instalar alguna app?', a: 'No. Visitas virtuales, audioguías, juegos y realidad aumentada funcionan en el navegador del móvil, sin descargas ni registro.' },
  { q: '¿Qué pasa con las obras protegidas por derechos?', a: 'Se difuminan o se excluyen de los puntos de interés, salvo que el museo aporte la licencia. Nunca aparecen personas reconocibles.' },
  { q: '¿Puede contratarlo un ayuntamiento sin licitación?', a: 'Sí: setup y primer año quedan por debajo de 15.000 € (contrato menor). Le indicamos las líneas de subvención de turismo y cultura.' },
  { q: '¿Qué incluye la licencia mensual?', a: 'Hosting, visor, panel, estadísticas, soporte y actualizaciones. Sin permanencia tras el primer año.' },
];

export default async function ParaMuseosPage({ searchParams }: { searchParams: Promise<{ museo?: string; producto?: string }> }) {
  const sp = await searchParams;
  const ref = sp.museo ? REF[sp.museo] : undefined;
  const defaults = {
    organizacion: ref?.nombre,
    municipio: ref?.municipio ?? undefined,
    producto: sp.producto,
    museo_slug: ref ? sp.museo : undefined,
  };

  return (
    <>
      {/* Hero */}
      <section className="pm-wrap py-16 md:py-24">
        <span className="pm-label">Para museos, ayuntamientos y residencias</span>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold md:text-6xl">
          Su museo, abierto a todo el mundo: visita virtual, juegos y presencia donde ya le buscan.
        </h1>
        <div className="pm-acento mt-6" />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--gris)]">
          Una captura 360 alimenta la ficha en el portal, la visita virtual, los juegos en sala y las sesiones en residencias.
          Contratación sencilla, precios cerrados y una licencia mensual sin sorpresas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#catalogo" className="pm-btn">Ver el catálogo</Link>
          <Link href="#contacto" className="pm-btn-sec">Pedir propuesta</Link>
        </div>
        <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ['6.590', 'centros en el mapa de museos'],
            ['2.220', 'fichas del directorio oficial'],
            ['95 %', 'de los museos sin visita virtual'],
          ].map(([n, t]) => (
            <div key={t} className="pm-card !py-4">
              <dt className="text-3xl font-bold" style={{ fontFamily: 'var(--f-tit)' }}>{n}</dt>
              <dd className="text-sm text-[var(--gris)]">{t}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Para quién */}
      <section className="pm-arena">
        <div className="pm-wrap py-14">
          <span className="pm-label">Para quién</span>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Cuatro compradores, una misma plataforma</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {(Object.keys(SEGMENTOS) as Array<keyof typeof SEGMENTOS>).map((s) => (
              <div key={s} className="pm-card !bg-white">
                <h3 className="text-lg font-bold">{SEGMENTOS[s]}</h3>
                <p className="mt-2 text-sm text-[var(--gris)]">
                  {PRODUCTOS.filter((p) => p.para.includes(s)).length} productos
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuatro salidas */}
      <section className="pm-wrap py-14">
        <span className="pm-label">Un catálogo, cuatro salidas</span>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">La misma captura, cuatro maneras de rentabilizarla</h2>
        <div className="pm-acento mt-4" />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {(Object.keys(SALIDAS) as Array<keyof typeof SALIDAS>).map((k) => (
            <div key={k} className="pm-card">
              <h3 className="text-lg font-bold">{SALIDAS[k].nombre}</h3>
              <p className="mt-2 text-sm text-[var(--gris)]">{SALIDAS[k].texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="pm-arena scroll-mt-32">
        <div className="pm-wrap py-16">
          <span className="pm-label">Catálogo</span>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Diez productos para museos</h2>
          <p className="mt-3 max-w-2xl text-[var(--gris)]">
            Cada producto se contrata solo o en pack. Los precios se comparten en reunión o con clave.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTOS.map((p) => (
              <ProductoCard key={p.slug} producto={p} />
            ))}
          </div>
        </div>
      </section>

      <ComoSeContrata />

      {/* Pilotos */}
      <section className="pm-wrap py-14">
        <span className="pm-label">Pilotos y referencias</span>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Lo que ya funciona</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {PILOTOS.map((p) => (
            <div key={p.titulo} className="pm-card">
              <h3 className="text-lg font-bold">{p.titulo}</h3>
              <p className="mt-2 text-sm text-[var(--gris)]">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="pm-arena scroll-mt-32">
        <div className="pm-wrap py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              <span className="pm-label">Pedir propuesta</span>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Cuéntenos qué museo es y qué quiere conseguir</h2>
              <div className="pm-acento mt-4" />
              <p className="mt-4 text-[var(--gris)]">
                Le devolvemos un diagnóstico de su presencia digital y una propuesta con dos contratos: producción cerrada y licencia mensual.
              </p>
              <p className="mt-4 text-sm text-[var(--gris)]">También por email: <a className="font-bold text-[var(--verde-600)]" href="mailto:info@clotitec.com">info@clotitec.com</a></p>
            </div>
            <div className="pm-card !bg-white">
              <FormularioLead defaults={defaults} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="pm-wrap py-14 scroll-mt-32">
        <span className="pm-label">Preguntas frecuentes</span>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="pm-card">
              <h3 className="text-base font-bold">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gris)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
