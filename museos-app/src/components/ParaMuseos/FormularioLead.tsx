'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTOS } from '@/content/productos';

export type LeadDefaults = { organizacion?: string; municipio?: string; producto?: string; museo_slug?: string };

export default function FormularioLead({ defaults }: { defaults?: LeadDefaults }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErrores({});
    const datos = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const json = (await res.json()) as { ok: boolean; errores?: Record<string, string> };
      if (res.ok && json.ok) {
        router.push('/para-museos/gracias');
        return;
      }
      setErrores(json.errores ?? { form: 'No se pudo enviar; escriba a info@clotitec.com' });
    } catch {
      setErrores({ form: 'No se pudo enviar; escriba a info@clotitec.com' });
    } finally {
      setEnviando(false);
    }
  }

  const campo = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm">
      <span className="pm-label">{label}</span>
      <input name={name} className="pm-input mt-1" {...props} />
      {errores[name] && <span className="mt-1 block text-xs text-red-700">{errores[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2" noValidate>
      {campo('nombre', 'Nombre', { required: true, defaultValue: '' })}
      {campo('cargo', 'Cargo', { placeholder: 'Dirección, técnico de cultura, concejalía…' })}
      {campo('organizacion', 'Museo o entidad', { required: true, defaultValue: defaults?.organizacion ?? '' })}
      {campo('municipio', 'Municipio', { defaultValue: defaults?.municipio ?? '' })}
      {campo('email', 'Email', { type: 'email', required: true })}
      {campo('telefono', 'Teléfono', { type: 'tel', placeholder: '9 dígitos' })}
      <label className="block text-sm md:col-span-2">
        <span className="pm-label">¿Qué le interesa?</span>
        <select name="producto" className="pm-input mt-1" defaultValue={defaults?.producto ?? 'no-lo-se'}>
          <option value="no-lo-se">Todavía no lo sé, quiero que me orienten</option>
          {PRODUCTOS.map((p) => (
            <option key={p.slug} value={p.slug}>{p.nombre}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm md:col-span-2">
        <span className="pm-label">Mensaje</span>
        <textarea name="mensaje" rows={4} className="pm-input mt-1" placeholder="Cuéntenos qué necesita, cuántas salas tiene el museo o qué exposición prepara." />
        {errores.mensaje && <span className="mt-1 block text-xs text-red-700">{errores.mensaje}</span>}
      </label>
      <input type="hidden" name="museo_slug" value={defaults?.museo_slug ?? ''} />
      <div className="pm-honeypot" aria-hidden="true">
        <label>
          No rellene este campo
          <input name="web_url" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" className="pm-btn" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Pedir propuesta'}
        </button>
        <span className="text-xs text-[var(--gris)]">Respondemos en 48 h laborables. Sus datos solo se usan para atender esta solicitud.</span>
      </div>
      {errores.form && <p className="md:col-span-2 text-sm text-red-700">{errores.form}</p>}
    </form>
  );
}
