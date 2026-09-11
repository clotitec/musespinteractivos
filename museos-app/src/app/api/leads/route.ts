import { NextResponse } from 'next/server';
import museosRef from '@/content/museos-ref.json';
import { insertarLead } from '@/lib/crm';
import { mapearLead, validarLead, type MuseoRef } from '@/lib/leads';

const REF = museosRef as unknown as Record<string, MuseoRef>;

async function avisarPorEmail(asunto: string, texto: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 5000);
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.LEADS_FROM ?? 'Portal de museos <onboarding@resend.dev>',
        to: [process.env.LEADS_TO ?? 'info@clotitec.com'],
        subject: asunto,
        text: texto,
      }),
      signal: controlador.signal,
    });
  } catch {
    // el lead ya está en el CRM; el aviso es opcional
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errores: { form: 'Datos no válidos' } }, { status: 400 });
  }
  const resultado = validarLead(body as Record<string, unknown>);
  if (!resultado.ok) {
    if (resultado.errores.web_url) return NextResponse.json({ ok: true }, { status: 201 });
    return NextResponse.json({ ok: false, errores: resultado.errores }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, errores: { form: 'Formulario no disponible; escriba a info@clotitec.com' } }, { status: 503 });
  }
  const lead = resultado.lead;
  const museo = lead.museo_slug ? REF[lead.museo_slug] : undefined;
  const filas = mapearLead(lead, museo);
  try {
    await insertarLead(filas);
  } catch (e) {
    console.error('leads: error al insertar', e);
    return NextResponse.json({ ok: false, errores: { form: 'No se pudo registrar; escriba a info@clotitec.com' } }, { status: 500 });
  }
  await avisarPorEmail(
    `Nuevo lead museo: ${lead.organizacion} · ${filas.opportunity.title.split(' · ')[1]}`,
    [
      `Organización: ${lead.organizacion} (${filas.organization.org_type})`,
      `Contacto: ${lead.nombre}${lead.cargo ? `, ${lead.cargo}` : ''}`,
      `Email: ${lead.email}`,
      `Teléfono: ${lead.telefono ?? '—'}`,
      `Municipio: ${lead.municipio ?? '—'}`,
      `Producto: ${filas.opportunity.title.split(' · ')[1]}`,
      `Ficha: ${lead.museo_slug ?? '—'}`,
      '',
      lead.mensaje ?? '',
    ].join('\n'),
  );
  return NextResponse.json({ ok: true }, { status: 201 });
}
