'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapPin, Clock, Ticket, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { getMuseumIcon, formatPrice } from '@/lib/utils';
import type { Museum } from '@/lib/types';

// Fix default marker icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Museum SVG icon for individual markers — dark pin
const museumMarkerIcon = L.divIcon({
  html: `<div class="museum-pin">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
      <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a2 2 0 0 1 4 0v4"/>
      <path d="M3 7h18"/>
    </svg>
  </div>`,
  className: 'museum-marker-wrapper',
  iconSize: L.point(32, 32, true),
  iconAnchor: L.point(16, 32),
  popupAnchor: L.point(0, -32),
});

// Custom cluster icon — monochrome
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
        className="bg-white border border-neutral-200 p-2 text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
        title="Acercar"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={zoomOut}
        className="bg-white border border-neutral-200 p-2 text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
        title="Alejar"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={resetView}
        className="bg-white border border-neutral-200 p-2 text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
        title="Vista de Espa&ntilde;a"
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
        /* Individual museum marker — dark elegant pin */
        .museum-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .museum-pin {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .museum-pin:hover {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }
        .museum-pin svg {
          transform: rotate(45deg);
        }

        /* Cluster icons — monochrome */
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
          font-weight: 600;
          font-size: 13px;
          font-family: var(--font-dm-sans), system-ui, sans-serif;
          transition: transform 0.2s ease;
        }
        .custom-cluster-icon div:hover {
          transform: scale(1.1);
        }
        .cluster-small {
          width: 40px;
          height: 40px;
          background: #1a1a1a !important;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .cluster-medium {
          width: 48px;
          height: 48px;
          background: #991b1b !important;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-size: 14px !important;
        }
        .cluster-large {
          width: 56px;
          height: 56px;
          background: #7f1d1d !important;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-size: 15px !important;
        }

        /* Popup styling — clean white */
        .leaflet-popup-content-wrapper {
          background: #ffffff !important;
          border: 1px solid #e5e5e5 !important;
          border-radius: 0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
          border: 1px solid #e5e5e5 !important;
        }
        .leaflet-popup-close-button {
          color: #a3a3a3 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
          z-index: 10;
        }
        .leaflet-popup-close-button:hover {
          color: #1a1a1a !important;
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
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
              icon={museumMarkerIcon}
              eventHandlers={{
                click: () => onMuseumClick?.(museum),
              }}
            >
              <Popup>
                <div className="w-[280px]">
                  {/* Header */}
                  <div className="bg-neutral-900 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getMuseumIcon(museum.tematica_normalized)}</span>
                      <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                        {museum.tematica_normalized || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3 space-y-3">
                    <h3 className="font-bold text-[15px] text-neutral-900 leading-snug">
                      {museum.nombre}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <MapPin size={12} className="text-neutral-400 shrink-0" />
                        <span>{museum.municipio}, {museum.provincia}</span>
                      </div>
                      {museum.horario && (
                        <div className="flex items-start gap-2 text-xs text-neutral-500">
                          <Clock size={12} className="text-neutral-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{museum.horario}</span>
                        </div>
                      )}
                      {(museum.precio || museum.es_gratuito) && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Ticket size={12} className="text-neutral-400 shrink-0" />
                          {museum.es_gratuito ? (
                            <span className="text-neutral-900 font-medium">Entrada gratuita</span>
                          ) : (
                            <span>{formatPrice(museum.precio)}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button — clean outlined */}
                    <Link
                      href={`/museo/${museum.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider transition-colors"
                    >
                      Ver ficha completa
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
}
