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

// Museum SVG icon for individual markers
const museumMarkerIcon = L.divIcon({
  html: `<div class="museum-pin">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
      <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a2 2 0 0 1 4 0v4"/>
      <path d="M3 7h18"/>
    </svg>
  </div>`,
  className: 'museum-marker-wrapper',
  iconSize: L.point(36, 36, true),
  iconAnchor: L.point(18, 36),
  popupAnchor: L.point(0, -36),
});

// Custom cluster icon - granate/maroon gradient with museum symbol
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 44;
  let className = 'cluster-small';

  if (count >= 100) {
    size = 60;
    className = 'cluster-large';
  } else if (count >= 30) {
    size = 52;
    className = 'cluster-medium';
  }

  const museumSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="position:absolute;top:4px;left:50%;transform:translateX(-50%)"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M3 7h18"/></svg>`;

  return L.divIcon({
    html: `<div class="${className}">${museumSvg}<span>${count}</span></div>`,
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
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-gray-300 hover:text-white hover:border-rose-800/60 transition-all"
        title="Acercar"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={zoomOut}
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-gray-300 hover:text-white hover:border-rose-800/60 transition-all"
        title="Alejar"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={resetView}
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-gray-300 hover:text-white hover:border-rose-800/60 transition-all"
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
        /* Individual museum marker */
        .museum-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .museum-pin {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #7f1d1d, #991b1b, #b91c1c);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 12px rgba(127, 29, 29, 0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .museum-pin:hover {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 5px 20px rgba(127, 29, 29, 0.7);
        }
        .museum-pin svg {
          transform: rotate(45deg);
        }

        /* Cluster icons - granate/maroon theme */
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
          font-size: 14px;
          box-shadow: 0 4px 18px rgba(127, 29, 29, 0.45);
          transition: transform 0.2s ease;
          position: relative;
          padding-top: 10px;
        }
        .custom-cluster-icon div:hover {
          transform: scale(1.12);
        }
        .cluster-small {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #7f1d1d, #991b1b) !important;
          border: 3px solid rgba(255, 255, 255, 0.2);
        }
        .cluster-medium {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #991b1b, #b91c1c) !important;
          border: 3px solid rgba(255, 255, 255, 0.25);
          font-size: 15px !important;
        }
        .cluster-large {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #b91c1c, #dc2626) !important;
          border: 3px solid rgba(255, 255, 255, 0.3);
          font-size: 16px !important;
        }
        .cluster-small span, .cluster-medium span, .cluster-large span {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        /* Popup styling */
        .leaflet-popup-content-wrapper {
          background: #111827 !important;
          border: 1px solid #374151 !important;
          border-radius: 16px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #111827 !important;
          border: 1px solid #374151 !important;
        }
        .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 20px !important;
          top: 8px !important;
          right: 10px !important;
          z-index: 10;
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
              icon={museumMarkerIcon}
              eventHandlers={{
                click: () => onMuseumClick?.(museum),
              }}
            >
              <Popup>
                <div className="w-[280px]">
                  {/* Header with category */}
                  <div className="bg-gradient-to-r from-red-950 to-red-900 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getMuseumIcon(museum.tematica_normalized)}</span>
                      <span className="text-xs text-red-200/80 font-medium uppercase tracking-wide">
                        {museum.tematica_normalized || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3 space-y-3">
                    <h3 className="font-bold text-[15px] text-gray-100 leading-snug">
                      {museum.nombre}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={12} className="text-red-400 shrink-0" />
                        <span>{museum.municipio}, {museum.provincia}</span>
                      </div>
                      {museum.horario && (
                        <div className="flex items-start gap-2 text-xs text-gray-400">
                          <Clock size={12} className="text-red-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{museum.horario}</span>
                        </div>
                      )}
                      {(museum.precio || museum.es_gratuito) && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Ticket size={12} className="text-red-400 shrink-0" />
                          {museum.es_gratuito ? (
                            <span className="text-green-400 font-medium">Entrada gratuita</span>
                          ) : (
                            <span>{formatPrice(museum.precio)}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button - prominent */}
                    <Link
                      href={`/museo/${museum.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-950/30 hover:shadow-red-900/40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a2 2 0 0 1 4 0v4"/><path d="M3 7h18"/>
                      </svg>
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
