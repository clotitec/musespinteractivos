import { getProducto } from '@/content/productos';

export type LeadInput = {
  nombre: string;
  cargo?: string;
  organizacion: string;
  municipio?: string;
  email: string;
  telefono?: string;
  producto?: string;
  mensaje?: string;
  museo_slug?: string;
  web_url?: string;
};

export type MuseoRef = { nombre?: string; canal?: string | null; web?: string | null };

export type FilasCRM = {
  organization: { name: string; org_type: 'publica' | 'privada'; sector: string; website: string | null; notes: string };
  contact: { name: string; position: string | null; emails: string[]; phones: string[]; notes: string | null };
  opportunity: {
    title: string;
    opp_type: 'privada';
    stage: 'contacto';
    next_step: string;
    next_step_date: string;
    amount_eur: number | null;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CANALES_PUBLICOS = new Set(['municipal', 'autonomico', 'estatal', 'universitario']);

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function validarLead(
  input: Partial<LeadInput> | null | undefined,
): { ok: true; lead: LeadInput } | { ok: false; errores: Record<string, string> } {
  const v = input ?? {};
  const errores: Record<string, string> = {};
  const nombre = texto(v.nombre);
  if (nombre.length < 2) errores.nombre = 'Indique su nombre';
  const organizacion = texto(v.organizacion);
  if (organizacion.length < 2) errores.organizacion = 'Indique el museo o la entidad';
  const email = texto(v.email).toLowerCase();
  if (!EMAIL_RE.test(email)) errores.email = 'Indique un email válido';
  let telefono = texto(v.telefono).replace(/\D/g, '');
  if (telefono.length === 11 && telefono.startsWith('34')) telefono = telefono.slice(2);
  if (telefono && telefono.length !== 9) errores.telefono = 'El teléfono debe tener 9 dígitos';
  const mensaje = texto(v.mensaje);
  if (mensaje.length > 2000) errores.mensaje = 'Máximo 2.000 caracteres';
  if (texto(v.web_url)) errores.web_url = 'spam';
  if (Object.keys(errores).length > 0) return { ok: false, errores };
  return {
    ok: true,
    lead: {
      nombre,
      cargo: texto(v.cargo) || undefined,
      organizacion,
      municipio: texto(v.municipio) || undefined,
      email,
      telefono: telefono || undefined,
      producto: texto(v.producto) || undefined,
      mensaje: mensaje || undefined,
      museo_slug: texto(v.museo_slug) || undefined,
    },
  };
}

function fechaISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function mapearLead(lead: LeadInput, museo?: MuseoRef, hoy: Date = new Date()): FilasCRM {
  const producto = lead.producto ? getProducto(lead.producto) : undefined;
  const nombreProducto = producto?.nombre ?? 'Sin producto definido';
  const org_type = museo?.canal && CANALES_PUBLICOS.has(museo.canal) ? 'publica' : 'privada';
  const siguiente = new Date(hoy);
  siguiente.setDate(siguiente.getDate() + 2);
  return {
    organization: {
      name: lead.organizacion,
      org_type,
      sector: 'museos',
      website: museo?.web ?? null,
      notes: [`Lead web para-museos`, nombreProducto, lead.municipio ?? 'municipio s/d', fechaISO(hoy), lead.museo_slug ? `ficha ${lead.museo_slug}` : null]
        .filter(Boolean)
        .join(' · '),
    },
    contact: {
      name: lead.nombre,
      position: lead.cargo ?? null,
      emails: [lead.email],
      phones: lead.telefono ? [lead.telefono] : [],
      notes: lead.mensaje ?? null,
    },
    opportunity: {
      title: `Museo · ${nombreProducto} · ${lead.organizacion}`,
      opp_type: 'privada',
      stage: 'contacto',
      next_step: 'Llamar (lead web)',
      next_step_date: fechaISO(siguiente),
      amount_eur: producto?.precio.produccion?.[0] ?? null,
    },
  };
}
