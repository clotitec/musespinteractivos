'use client';

import { useEffect, useRef } from 'react';
import { Map as MapaLibre, Marker, NavigationControl, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ESTILO_BASE, activarTerreno, prepararMapLibre, prepararMapa3D } from '@/lib/mapa3d';

interface MiniMapa3DProps {
  lat: number;
  lng: number;
  nombre: string;
}

export default function MiniMapa3D({ lat, lng, nombre }: MiniMapa3DProps) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenedor.current) return;
    prepararMapLibre();
    const map = new MapaLibre({
      container: contenedor.current,
      style: ESTILO_BASE,
      center: [lng, lat],
      zoom: 15.6,
      pitch: 60,
      bearing: -30,
      maxPitch: 75,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ visualizePitch: true, showZoom: false }), 'top-right');
    map.on('load', () => {
      prepararMapa3D(map);
      activarTerreno(map, true);
      new Marker({ color: '#ff7aac' }).setLngLat([lng, lat]).setPopup(new Popup({ offset: 24 }).setText(nombre)).addTo(map);
      map.easeTo({ bearing: 10, duration: 6000, easing: (t: number) => t });
    });
    return () => {
      map.remove();
    };
  }, [lat, lng, nombre]);

  return <div ref={contenedor} className="h-80 w-full overflow-hidden rounded-2xl border border-neutral-200" aria-label={`Mapa 3D de ${nombre}`} />;
}
