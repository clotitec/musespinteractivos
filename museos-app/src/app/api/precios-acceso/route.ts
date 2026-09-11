import { NextResponse } from 'next/server';
import { COOKIE_PRECIOS, compararClave, crearCookie } from '@/lib/precios-gate';

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const clave = process.env.PRECIOS_CLAVE;
  const secret = process.env.PRECIOS_SECRET;
  if (!clave || !secret) {
    return NextResponse.json({ ok: false, error: 'Lista de precios no disponible' }, { status: 503 });
  }
  let intento = '';
  try {
    const body = (await req.json()) as { clave?: unknown };
    intento = typeof body.clave === 'string' ? body.clave.trim() : '';
  } catch {
    intento = '';
  }
  if (!intento || !compararClave(intento, clave)) {
    await espera(800);
    return NextResponse.json({ ok: false, error: 'Clave incorrecta' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_PRECIOS, await crearCookie(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/para-museos',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
