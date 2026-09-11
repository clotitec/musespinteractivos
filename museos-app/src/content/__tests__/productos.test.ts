import { describe, expect, it } from 'vitest';
import { PRODUCTOS, getProducto, productosPara } from '../productos';

describe('catálogo de productos', () => {
  it('tiene 10 productos con slugs únicos', () => {
    expect(PRODUCTOS).toHaveLength(10);
    expect(new Set(PRODUCTOS.map((p) => p.slug)).size).toBe(10);
  });

  it('cada producto tiene textos cortos y precio', () => {
    for (const p of PRODUCTOS) {
      expect(p.claim.length, `${p.slug} claim`).toBeLessThanOrEqual(90);
      expect(p.queEs.length, `${p.slug} queEs`).toBeLessThanOrEqual(320);
      expect(p.incluye.length, `${p.slug} incluye`).toBeGreaterThanOrEqual(3);
      expect(p.entregables.length, `${p.slug} entregables`).toBeGreaterThanOrEqual(2);
      expect(Object.keys(p.precio).length, `${p.slug} precio`).toBeGreaterThan(0);
    }
  });

  it('los productos relacionados existen', () => {
    for (const p of PRODUCTOS) {
      for (const r of p.relacionados) expect(getProducto(r), `${p.slug} → ${r}`).toBeDefined();
      expect(p.relacionados).not.toContain(p.slug);
    }
  });

  it('filtra por segmento', () => {
    expect(productosPara('residencia').map((p) => p.slug)).toContain('museos-en-casa');
    expect(productosPara('ayuntamiento').map((p) => p.slug)).toContain('pack-museo-vivo');
  });
});
