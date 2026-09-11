export const COOKIE_PRECIOS = 'pm_precios';

const enc = new TextEncoder();

async function hmacHex(mensaje: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign('HMAC', key, enc.encode(mensaje));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function compararClave(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function firmar(exp: number, secret: string): Promise<string> {
  return hmacHex(String(exp), secret);
}

export async function crearCookie(secret: string, dias = 30, ahora = Date.now()): Promise<string> {
  const exp = ahora + dias * 24 * 60 * 60 * 1000;
  return `${exp}.${await firmar(exp, secret)}`;
}

export async function verificar(valor: string | undefined, secret: string | undefined, ahora = Date.now()): Promise<boolean> {
  if (!valor || !secret) return false;
  const [expTexto, firma] = valor.split('.');
  const exp = Number(expTexto);
  if (!Number.isFinite(exp) || !firma || exp <= ahora) return false;
  return compararClave(firma, await firmar(exp, secret));
}
