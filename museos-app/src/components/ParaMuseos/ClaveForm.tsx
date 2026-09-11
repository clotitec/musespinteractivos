'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaveForm() {
  const router = useRouter();
  const [clave, setClave] = useState('');
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'error' | 'no-disponible'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado('enviando');
    const res = await fetch('/api/precios-acceso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave }),
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    setEstado(res.status === 503 ? 'no-disponible' : 'error');
  }

  return (
    <form onSubmit={onSubmit} className="pm-card mx-auto max-w-md !bg-white">
      <span className="pm-label">Acceso con clave</span>
      <h2 className="mt-2 text-2xl font-bold">Lista de precios</h2>
      <p className="mt-2 text-sm text-[var(--gris)]">
        La lista completa se comparte en reunión. Si ya tiene su clave, introdúzcala; si no, pídanos una propuesta y se la enviamos.
      </p>
      <input
        type="password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        className="pm-input mt-4"
        placeholder="Clave"
        autoComplete="off"
        required
      />
      <button type="submit" className="pm-btn mt-4" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Comprobando…' : 'Ver precios'}
      </button>
      {estado === 'error' && <p className="mt-3 text-sm text-red-700">Clave incorrecta.</p>}
      {estado === 'no-disponible' && <p className="mt-3 text-sm text-red-700">La lista no está disponible en este momento.</p>}
    </form>
  );
}
