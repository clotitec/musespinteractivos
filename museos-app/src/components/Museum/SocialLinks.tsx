'use client';

import { ExternalLink } from 'lucide-react';
import { getSocialPlatform } from '@/lib/utils';

interface SocialLinksProps {
  redes_sociales: Record<string, string>;
}

export default function SocialLinks({ redes_sociales }: SocialLinksProps) {
  const entries = Object.entries(redes_sociales).filter(([, url]) => url && url.trim());

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic">No hay redes sociales registradas</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {entries.map(([key, url]) => {
        const platform = getSocialPlatform(key);
        return (
          <a
            key={key}
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-neutral-200 px-4 py-2 text-xs uppercase tracking-wider text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
          >
            {platform}
            <ExternalLink size={10} />
          </a>
        );
      })}
    </div>
  );
}
