'use client';

import { Check, X } from 'lucide-react';

interface AccessibilityGridProps {
  accesibilidad: Record<string, boolean>;
}

const LABELS: Record<string, string> = {
  'silla_ruedas': 'Silla de ruedas',
  'wheelchair': 'Silla de ruedas',
  'rampa': 'Rampas',
  'ramp': 'Rampas',
  'ascensor': 'Ascensor',
  'elevator': 'Ascensor',
  'audioguia': 'Audiogu\u00eda',
  'audioguide': 'Audiogu\u00eda',
  'braille': 'Braille',
  'bucle_magnetico': 'Bucle magn\u00e9tico',
  'hearing_loop': 'Bucle magn\u00e9tico',
  'lengua_signos': 'Lengua de signos',
  'sign_language': 'Lengua de signos',
  'perro_guia': 'Perro gu\u00eda',
  'guide_dog': 'Perro gu\u00eda',
  'aparcamiento': 'Aparcamiento adaptado',
  'parking': 'Aparcamiento adaptado',
  'aseo_adaptado': 'Aseo adaptado',
  'restroom': 'Aseo adaptado',
};

function formatLabel(key: string): string {
  return LABELS[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccessibilityGrid({ accesibilidad }: AccessibilityGridProps) {
  const entries = Object.entries(accesibilidad);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic">No hay informaci&oacute;n de accesibilidad disponible</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {entries.map(([key, available]) => (
        <div key={key} className="flex items-center gap-2">
          {available ? (
            <Check size={14} className="text-green-600 shrink-0" />
          ) : (
            <X size={14} className="text-neutral-300 shrink-0" />
          )}
          <span className={`text-sm ${available ? 'text-neutral-700' : 'text-neutral-400'}`}>
            {formatLabel(key)}
          </span>
        </div>
      ))}
    </div>
  );
}
