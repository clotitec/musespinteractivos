'use client';

interface ServiceBadgesProps {
  servicios: string[];
}

export default function ServiceBadges({ servicios }: ServiceBadgesProps) {
  if (!servicios || servicios.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic">No hay servicios registrados</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {servicios.map((s) => (
        <span
          key={s}
          className="text-[11px] uppercase tracking-wider bg-neutral-100 text-neutral-700 px-3 py-1 border border-neutral-200"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
