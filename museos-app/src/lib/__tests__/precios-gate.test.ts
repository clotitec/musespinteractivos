import { describe, expect, it } from 'vitest';
import { compararClave, crearCookie, verificar } from '../precios-gate';

describe('puerta de precios', () => {
  it('acepta una cookie válida y rechaza manipulaciones', async () => {
    const c = await crearCookie('s3cret', 30, 1_000_000);
    expect(await verificar(c, 's3cret', 1_000_000 + 1000)).toBe(true);
    const manipulada = c.slice(0, -1) + (c.endsWith('0') ? '1' : '0');
    expect(await verificar(manipulada, 's3cret', 1_000_000 + 1000)).toBe(false);
    expect(await verificar(c, 'otro', 1_000_000 + 1000)).toBe(false);
    expect(await verificar(`999999999999.${c.split('.')[1]}`, 's3cret', 1_000_000)).toBe(false);
  });

  it('rechaza expiradas, vacías y sin secreto', async () => {
    const c = await crearCookie('s3cret', 1, 0);
    expect(await verificar(c, 's3cret', 3 * 24 * 3600 * 1000)).toBe(false);
    expect(await verificar(undefined, 's3cret')).toBe(false);
    expect(await verificar(c, undefined)).toBe(false);
    expect(await verificar('basura', 's3cret')).toBe(false);
  });

  it('compara claves en tiempo constante', () => {
    expect(compararClave('abc', 'abc')).toBe(true);
    expect(compararClave('abc', 'abd')).toBe(false);
    expect(compararClave('abc', 'ab')).toBe(false);
  });
});
