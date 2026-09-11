export type Segmento = 'museo' | 'ayuntamiento' | 'residencia' | 'productor';
export type Salida = 'portal' | '360' | 'casa' | 'juegos';
export type Contratacion = 'dos contratos' | 'suscripción' | 'ficha' | 'pack';

export type Precio = {
  produccion?: [number, number];
  licenciaMes?: [number, number];
  suscripcionMes?: [number, number];
  alta?: number;
  unidad?: string;
  nota?: string;
};

export type Producto = {
  slug: string;
  nombre: string;
  claim: string;
  para: Segmento[];
  queEs: string;
  incluye: string[];
  entregables: string[];
  plazo: string;
  comoSeContrata: Contratacion;
  precio: Precio;
  relacionados: string[];
  salida: Salida;
};

export const SEGMENTOS: Record<Segmento, string> = {
  museo: 'Museos y colecciones',
  ayuntamiento: 'Ayuntamientos y diputaciones',
  residencia: 'Residencias, hospitales y teleasistencia',
  productor: 'Productores de exposiciones',
};

export const SALIDAS: Record<Salida, { nombre: string; texto: string }> = {
  portal: { nombre: 'Portal y ficha', texto: 'El mapa de museos que consultan visitantes, prensa y ayuntamientos.' },
  '360': { nombre: 'Museo 360', texto: 'Una captura sirve para la visita virtual, la audioguía y Street View.' },
  casa: { nombre: 'Museos en casa', texto: 'El museo llega a quien no puede desplazarse.' },
  juegos: { nombre: 'Juegos y tramas', texto: 'La visita se convierte en juego y se repite.' },
};

export const PRODUCTOS: Producto[] = [
  {
    slug: 'ficha-portal',
    nombre: 'Ficha en el portal de museos',
    claim: 'Tu museo, completo y actualizado, en el mapa que consultan visitantes y ayuntamientos.',
    para: ['museo', 'ayuntamiento'],
    queEs:
      'Cada museo tiene una ficha gratuita con los datos oficiales. Al reclamarla, el equipo del museo corrige horarios y precios, añade fotos, exposiciones, registro expositivo y visita virtual, y ve quién la consulta.',
    incluye: [
      'Ficha básica gratuita con los datos del Directorio de Museos',
      'Ficha verificada: horarios, precios y contacto editables, sello de verificación',
      'Ficha premium: fotos, agenda de exposiciones y registro expositivo, visita virtual embebida, analítica mensual',
      'Posición destacada en el mapa y en las páginas de su territorio',
      'Enlace a entradas y a la web oficial',
    ],
    entregables: ['Acceso al panel de la ficha', 'Sello «verificado» visible', 'Informe mensual de visitas (premium)'],
    plazo: 'Activación en 48 h tras verificar el correo del dominio del museo',
    comoSeContrata: 'ficha',
    precio: { suscripcionMes: [0, 49], nota: 'Básica gratuita · verificada 59 €/año · premium 49 €/mes' },
    relacionados: ['museo-360', 'pack-museo-vivo'],
    salida: 'portal',
  },
  {
    slug: 'museo-360',
    nombre: 'Museo 360 · visita virtual',
    claim: 'Recorra el museo sala por sala desde cualquier lugar, con audioguía y puntos de interés.',
    para: ['museo', 'ayuntamiento'],
    queEs:
      'Captura profesional en 360º de las salas, visor accesible con puntos calientes sobre las obras y audioguía con voz en varios idiomas. Se integra en la ficha del portal y en la web del museo, y se publica en Google Street View.',
    incluye: [
      'Captura 360 de las salas (hasta 5 o hasta 15 según alcance)',
      'Visor propio con puntos calientes sobre obras y textos',
      'Audioguía con voz sintética en castellano e inglés, con variantes accesibles',
      'Publicación en Google Street View y ficha premium del portal durante un año',
      'Visor embebible en la web del museo',
      'Autorización, difuminado de obras protegidas y de personas',
    ],
    entregables: ['Visor 360 en línea (enlace y código de inserción)', 'Panorámicas en alta resolución', 'Audioguía en MP3 por sala', 'Publicación en Street View'],
    plazo: '4–6 semanas desde la captura',
    comoSeContrata: 'dos contratos',
    precio: { produccion: [2900, 8900], licenciaMes: [100, 250], nota: 'Hasta 5 salas 2.900–4.900 € · 6 a 15 salas 4.900–8.900 € · más de 15 salas, a medida' },
    relacionados: ['ficha-portal', 'museos-en-casa', 'qr-audioguia'],
    salida: '360',
  },
  {
    slug: 'qr-audioguia',
    nombre: 'QR interactivos y audioguía por sala',
    claim: 'Un código por sala: audio, texto e imágenes en el móvil del visitante, sin descargas.',
    para: ['museo', 'ayuntamiento'],
    queEs:
      'Placas con QR por sala u obra que abren una audioguía web accesible (WCAG AA) en varios idiomas, con textos, imágenes y modo relato. Funciona sin app ni GPS y sirve también como guía para colegios y grupos.',
    incluye: [
      'Guion y locución por parada, con voz sintética validada, en castellano e inglés',
      'Web de audioguía accesible, sin descarga',
      'Placas QR listas para imprimir',
      'Modo relato para colegios y familias',
      'Estadísticas de escuchas por sala',
    ],
    entregables: ['Audioguía web publicada', 'Archivos de audio y textos', 'Diseño de placas QR (PDF)'],
    plazo: '3–5 semanas',
    comoSeContrata: 'dos contratos',
    precio: { produccion: [1500, 3900], licenciaMes: [90, 90] },
    relacionados: ['gincana-pasaporte', 'museo-360'],
    salida: '360',
  },
  {
    slug: 'webar-guardianes',
    nombre: 'WebAR «Guardianes de las salas»',
    claim: 'Personajes en realidad aumentada que guían a los niños por el museo desde el navegador.',
    para: ['museo', 'ayuntamiento', 'residencia'],
    queEs:
      'Aventura familiar en realidad aumentada sin instalar apps: los guardianes de cada sala aparecen en el móvil, proponen retos y desbloquean medallas. Pensada para familias, colegios y aulas hospitalarias.',
    incluye: [
      'Hasta 8 guardianes con voz y personalidad propia',
      'Retos por sala con desbloqueo por QR',
      'Medallas y álbum imprimible',
      'Editor de puntos para el personal del museo',
      'Versión para aulas hospitalarias (juego a distancia)',
    ],
    entregables: ['Experiencia WebAR publicada', 'Placas QR por sala', 'Álbum de medallas (PDF)'],
    plazo: '6–8 semanas',
    comoSeContrata: 'dos contratos',
    precio: { produccion: [2900, 5900], licenciaMes: [90, 150] },
    relacionados: ['gincana-pasaporte', 'caso-del-museo'],
    salida: 'juegos',
  },
  {
    slug: 'caso-del-museo',
    nombre: 'El caso del museo',
    claim: 'Un misterio para resolver entre las salas: cuadernillo en la tienda y juego en el móvil.',
    para: ['museo', 'ayuntamiento'],
    queEs:
      'Caso deductivo ambientado en el museo: salas, obras y personal ficticio como pistas, sospechosos y escenarios. Se vende en papel en la tienda y se juega en el móvil con QR por sala; incluye sopa de letras y sudoku de iconos. Solución única verificada.',
    incluye: [
      'Guion del caso con 3–4 sospechosos y 10–12 pistas',
      'Cuadernillo A5 listo para imprenta',
      'Versión web jugable con QR por sala y ranking',
      'Sopa de letras y sudoku de iconos del museo',
      'Revisión legal: ficción, sin personas reales',
    ],
    entregables: ['Cuadernillo A5 (PDF imprenta)', 'Juego web publicado', 'Placas QR'],
    plazo: '4–6 semanas',
    comoSeContrata: 'dos contratos',
    precio: { produccion: [1900, 3900], licenciaMes: [90, 90], unidad: 'por caso' },
    relacionados: ['trama-exposicion', 'gincana-pasaporte', 'museos-en-casa'],
    salida: 'juegos',
  },
  {
    slug: 'trama-exposicion',
    nombre: 'Trama por exposición temporal',
    claim: 'Un caso que dura lo que dura la exposición: campaña, ranking y edición limitada.',
    para: ['museo', 'productor'],
    queEs:
      'El motor del caso del museo aplicado a una exposición temporal o itinerante: se estrena el día de la inauguración, dura lo que dura la muestra y viaja con ella a la siguiente ciudad. Ranking, cuadernillo de edición limitada y kit de comunicación.',
    incluye: [
      'Trama a medida de la exposición: personajes ficticios, obras como pistas',
      'Campaña de 6 a 10 semanas con ranking',
      'Cuadernillo de edición limitada',
      'Kit de comunicación: cartel, redes y nota de prensa',
      'Reutilizable en cada ciudad de la itinerancia',
    ],
    entregables: ['Juego web con calendario de campaña', 'Cuadernillo (PDF imprenta)', 'Kit de comunicación'],
    plazo: 'Listo 4 semanas antes de la inauguración',
    comoSeContrata: 'dos contratos',
    precio: { produccion: [2900, 5900], nota: 'Más reparto de ventas del cuadernillo · descuento por itinerancia' },
    relacionados: ['caso-del-museo', 'videos-ia'],
    salida: 'juegos',
  },
  {
    slug: 'gincana-pasaporte',
    nombre: 'Gincana y pasaporte del museo',
    claim: 'Sellos, retos y ranking para que la visita se convierta en juego y se repita.',
    para: ['museo', 'ayuntamiento'],
    queEs:
      'Gincana digital por el museo con paradas por QR, pasaporte de sellos, álbum y ranking. Cuatro modos (libre, tesoro, relato y paseo virtual) y un panel para que el museo cree sus propias rutas sin depender de nadie.',
    incluye: [
      'Hasta 3 rutas con 8–12 paradas',
      'Pasaporte de sellos, álbum y ranking',
      'Panel de gestión para el personal del museo',
      'Modo paseo virtual para jugar desde casa',
      'Accesibilidad AA y cumplimiento RGPD',
    ],
    entregables: ['Gincana publicada', 'Placas QR', 'Manual del panel'],
    plazo: '3–5 semanas',
    comoSeContrata: 'dos contratos',
    precio: { produccion: [2500, 4900], licenciaMes: [90, 90] },
    relacionados: ['qr-audioguia', 'webar-guardianes', 'caso-del-museo'],
    salida: 'juegos',
  },
  {
    slug: 'videos-ia',
    nombre: 'Vídeos con IA · PromoMuseo',
    claim: 'Vídeos mensuales sobre sus exposiciones, listos para redes y aprobados por el museo.',
    para: ['museo', 'ayuntamiento', 'productor'],
    queEs:
      'Plan editorial mensual, guiones, locución profesional y vídeos 9:16 producidos con inteligencia artificial a partir de su archivo y de nuestras capturas, con etiqueta de transparencia. El museo aprueba cada pieza en un panel antes de publicarla.',
    incluye: [
      'Plan editorial mensual ligado a exposiciones y agenda',
      '4–8 vídeos 9:16 con locución y subtítulos',
      'Panel de aprobación con plazo de 72 h',
      'Copy y hashtags por pieza',
      'Etiqueta de transparencia IA conforme al AI Act',
    ],
    entregables: ['Pack mensual de vídeos MP4 y copies', 'Acceso al panel de aprobación'],
    plazo: 'Primer pack a los 15 días del alta',
    comoSeContrata: 'suscripción',
    precio: { alta: 900, suscripcionMes: [290, 590] },
    relacionados: ['trama-exposicion', 'ficha-portal'],
    salida: 'portal',
  },
  {
    slug: 'museos-en-casa',
    nombre: 'Museos en casa',
    claim: 'El museo en residencias y hospitales, con un reproductor pensado para mayores.',
    para: ['residencia', 'ayuntamiento', 'museo'],
    queEs:
      'Catálogo de museos en 360 con audioguía en un reproductor accesible (botones grandes, voz, subtítulos, alto contraste) para sesiones de grupo en residencias y hospitales y para tablets de teleasistencia. Incluye sesión guiada de 35 minutos y juegos de mesa camilla.',
    incluye: [
      'Acceso al catálogo de museos 360 con voz',
      'Sesión guiada de 35 minutos con guion para el dinamizador',
      'Juegos: encuentra la obra, sudoku de iconos y caso de mesa camilla',
      'Panel del centro con señales de uso (nunca diagnósticos)',
      'Formación al personal (1 sesión)',
    ],
    entregables: ['Licencia por centro o por tablet', 'Guion de sesión y material imprimible', 'Informe trimestral de uso'],
    plazo: 'Alta en una semana',
    comoSeContrata: 'suscripción',
    precio: { suscripcionMes: [49, 149], unidad: 'por centro', nota: 'Vía teleasistencia: 1–2 € por tablet y mes' },
    relacionados: ['museo-360', 'caso-del-museo'],
    salida: 'casa',
  },
  {
    slug: 'pack-museo-vivo',
    nombre: 'Pack «Museo vivo»',
    claim: 'Todo en un contrato menor: visita virtual, juego, ficha premium y museo en residencias.',
    para: ['ayuntamiento'],
    queEs:
      'Para ayuntamientos con museo municipal: Museo 360, el caso del museo, ficha premium en el portal un año y alta en Museos en casa, con licencia de plataforma y soporte. Encaja bajo el límite del contrato menor y es financiable con fondos de turismo y cultura.',
    incluye: [
      'Museo 360 de hasta 10 salas con audioguía',
      'El caso del museo (cuadernillo y web)',
      'Ficha premium en el portal durante 12 meses',
      'Alta del municipio en Museos en casa',
      'Licencia de plataforma y soporte 12 meses',
      'Formación al personal',
    ],
    entregables: ['Visor 360 y audioguía', 'Caso del museo (impreso y web)', 'Ficha premium y panel', 'Informe de uso semestral'],
    plazo: '8–10 semanas',
    comoSeContrata: 'pack',
    precio: { produccion: [14900, 14900], licenciaMes: [200, 200], nota: 'Producción 14.900 € (contrato menor) + licencia 200 €/mes' },
    relacionados: ['museo-360', 'caso-del-museo', 'ficha-portal', 'museos-en-casa'],
    salida: 'portal',
  },
];

export function getProducto(slug: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.slug === slug);
}

export function productosPara(segmento: Segmento): Producto[] {
  return PRODUCTOS.filter((p) => p.para.includes(segmento));
}

export function formatoEuros(n: number): string {
  // Separador de miles siempre (es-ES no lo pone en cifras de 4 dígitos)
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
}

export function resumenPrecio(p: Precio): string {
  const partes: string[] = [];
  if (p.produccion) {
    const [a, b] = p.produccion;
    partes.push(a === b ? formatoEuros(a) : `${formatoEuros(a)}–${formatoEuros(b)}`);
    if (p.unidad) partes[partes.length - 1] += ` ${p.unidad}`;
  }
  if (p.alta) partes.push(`alta ${formatoEuros(p.alta)}`);
  if (p.licenciaMes) {
    const [a, b] = p.licenciaMes;
    partes.push(`licencia ${a === b ? formatoEuros(a) : `${formatoEuros(a)}–${formatoEuros(b)}`}/mes`);
  }
  if (p.suscripcionMes) {
    const [a, b] = p.suscripcionMes;
    partes.push(`${a === b ? formatoEuros(a) : `${formatoEuros(a)}–${formatoEuros(b)}`}/mes${p.unidad ? ` ${p.unidad}` : ''}`);
  }
  return partes.join(' + ');
}
