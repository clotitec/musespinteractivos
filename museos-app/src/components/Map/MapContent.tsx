'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import { getMuseumIcon } from '@/lib/utils';
import type { Museum } from '@/lib/types';

// Fix default marker icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapContentProps {
  museums: Museum[];
  onMuseumClick?: (museum: Museum) => void;
}

export default function MapContent({ museums, onMuseumClick }: MapContentProps) {
  const center: [number, number] = [40.0, -3.7];

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {museums.map((museum) => (
        <Marker
          key={museum.id}
          position={[museum.lat!, museum.lng!]}
          eventHandlers={{
            click: () => onMuseumClick?.(museum),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <p className="text-xs text-gray-400 mb-1">
                {getMuseumIcon(museum.tematica_normalized)} {museum.tematica_normalized || 'General'}
              </p>
              <h3 className="font-semibold text-sm text-gray-100 mb-2">{museum.nombre}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <MapPin size={10} />
                <span>{museum.municipio}, {museum.provincia}</span>
              </div>
              <Link
                href={`/museo/${museum.slug}`}
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
              >
                Ver detalle <ExternalLink size={10} />
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
