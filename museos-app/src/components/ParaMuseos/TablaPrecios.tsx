import { PRODUCTOS, formatoEuros, resumenPrecio } from '@/content/productos';

function rango(r?: [number, number], sufijo = ''): string {
  if (!r) return '—';
  const [a, b] = r;
  return `${a === b ? formatoEuros(a) : `${formatoEuros(a)}–${formatoEuros(b)}`}${sufijo}`;
}

export default function TablaPrecios() {
  return (
    <div className="overflow-x-auto">
      <table className="pm-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Producción (contrato A)</th>
            <th>Recurrente (contrato B)</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          {PRODUCTOS.map((p) => (
            <tr key={p.slug}>
              <td className="font-bold">{p.nombre}</td>
              <td>
                {p.precio.produccion ? rango(p.precio.produccion, p.precio.unidad ? ` ${p.precio.unidad}` : '') : p.precio.alta ? `alta ${formatoEuros(p.precio.alta)}` : '—'}
              </td>
              <td>
                {p.precio.licenciaMes && `licencia ${rango(p.precio.licenciaMes, '/mes')}`}
                {p.precio.suscripcionMes && `${rango(p.precio.suscripcionMes, '/mes')}${p.precio.unidad ? ` ${p.precio.unidad}` : ''}`}
                {!p.precio.licenciaMes && !p.precio.suscripcionMes && '—'}
              </td>
              <td className="text-[var(--gris)]">{p.precio.nota ?? resumenPrecio(p.precio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 grid gap-4 text-sm text-[var(--gris)] md:grid-cols-2">
        <div className="pm-card !bg-white">
          <p className="pm-label">Reglas</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Importes sin IVA (21 %), orientativos, septiembre de 2026. Cada propuesta se cierra a medida.</li>
            <li>Dos contratos: producción con importe cerrado + licencia mensual de plataforma (hosting, visor, panel, soporte, actualizaciones).</li>
            <li>Setup y primer año por debajo de 15.000 € para entrar por contrato menor. Licencias anuales anticipadas para clientes públicos.</li>
          </ul>
        </div>
        <div className="pm-card !bg-white">
          <p className="pm-label">Descuentos</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Segunda salida de una misma captura 360 (juegos, Museos en casa): −30 % en producción.</li>
            <li>Packs por diputación o red de museos (5 o más centros): −15 %.</li>
            <li>Nunca se descuenta la licencia.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
