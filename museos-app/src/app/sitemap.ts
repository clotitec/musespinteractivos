import type { MetadataRoute } from 'next';
import museosRef from '@/content/museos-ref.json';
import { PRODUCTOS } from '@/content/productos';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  const fijas: MetadataRoute.Sitemap = ['/', '/buscar', '/lista', '/estadisticas', '/para-museos'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: ahora,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : 0.8,
  }));
  const productos: MetadataRoute.Sitemap = PRODUCTOS.map((p) => ({
    url: `${SITE_URL}/para-museos/${p.slug}`,
    lastModified: ahora,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const museos: MetadataRoute.Sitemap = Object.keys(museosRef).map((slug) => ({
    url: `${SITE_URL}/museo/${slug}`,
    lastModified: ahora,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));
  return [...fijas, ...productos, ...museos];
}
