'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapPin, ExternalLink, ZoomIn, ZoomOut, Locate } from 'lucide-react';
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

// Custom cluster icon with gradient style
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 40;
  let className = 'cluster-small';

  if (count >= 100) {
    size = 56;
    className = 'cluster-large';
  } else if (count >= 30) {
    size = 48;
    className = 'cluster-medium';
  }

  return L.divIcon({
    html: `<div class="${className}"><span>${count}</span></div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size, true),
  });
}

// Map controls component
function MapControls() {
  const map = useMap();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();
  const resetView = () => map.setView([40.0, -3.7], 6);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={zoomIn}
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-gray-300 hover:text-white hover:border-purple-500/50 transition-all"
        title="Acercar"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={zoomOut}
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-gray-300 hover:text-white hover:border-purple-500/50 transition-all"
        title="Alejar"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={resetView}
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-gray-300 hover:text-white hover:border-purple-500/50 transition-all"
        title="Vista de España"
      >
        <Locate size={18} />
      </button>
    </div>
  );
}

interface MapContentProps {
  museums: Museum[];
  onMuseumClick?: (museum: Museum) => void;
}

export default function MapContent({ museums, onMuseumClick }: MapContentProps) {
  const center: [number, number] = [40.0, -3.7];

  return (
    <>
      <style>{`
        .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-cluster-icon div {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease;
        }
        .custom-cluster-icon div:hover {
          transform: scale(1.1);
        }
        .cluster-small {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }
        .cluster-medium {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6, #a855f7) !important;
          border: 3px solid rgba(255, 255, 255, 0.3);
          font-size: 14px !important;
        }
        .cluster-large {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #a855f7, #d946ef) !important;
          border: 3px solid rgba(255, 255, 255, 0.3);
          font-size: 15px !important;
        }
        .cluster-small span, .cluster-medium span, .cluster-large span {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .leaflet-popup-content-wrapper {
          background: #1f2937 !important;
          border: 1px solid #374151 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: #1f2937 !important;
          border: 1px solid #374151 !important;
        }
        .leaflet-popup-close-button {
          color: #9ca3af !important;
        }
        .leaflet-popup-close-button:hover {
          color: #e5e7eb !important;
        }
        .marker-cluster-anim .leaflet-marker-icon,
        .marker-cluster-anim .leaflet-marker-shadow {
          transition: transform 0.3s ease-out, opacity 0.3s ease-out !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
        maxZoom={18}
        minZoom={5}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapControls />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          iconCreateFunction={createClusterIcon}
          animate
          animateAddingMarkers={false}
          disableClusteringAtZoom={16}
          removeOutsideVisibleBounds
        >
          {museums.map((museum) => (
            <Marker
              key={museum.id}
              position={[museum.lat!, museum.lng!]}
              eventHandlers={{
                click: () => onMuseumClick?.(museum),
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getMuseumIcon(museum.tematica_normalized)}</span>
                    <span className="text-xs text-purple-400 font-medium">
                      {museum.tematica_normalized || 'General'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-100 mb-2 leading-tight">
                    {museum.nombre}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin size={10} />
                    <span>{museum.municipio}, {museum.provincia}</span>
                  </div>
                  {museum.es_gratuito && (
                    <span className="inline-block text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full mb-2">
                      Gratuito
                    </span>
                  )}
                  <Link
                    href={`/museo/${museum.slug}`}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Ver detalle <ExternalLink size={10} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
}
