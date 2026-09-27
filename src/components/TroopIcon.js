// src/components/TroopIcon.js
'use client';

import { useState } from 'react';
import Image from 'next/image';

export function getTroopImageUrl(name, type) {
  if (!name) return '';
  const formattedName = name
    .toLowerCase()
    .replace(/[\.]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  if (type === 'pet') {
    return `https://assets.clashk.ing/pets/${formattedName}/icon.webp`;
  }
  if (type === 'spell') {
    return `https://assets.clashk.ing/spells/${formattedName}.webp`;
  }
  return `https://assets.clashk.ing/troops/${formattedName}/icon.webp`;
}

export default function TroopIcon({
  name,
  level = 1,
  maxLevel,
  type = 'troop',
  isActiveSuperTroop = false,
}) {
  const [imageError, setImageError] = useState(false);

  if (!name) return null;

  const imageUrl = getTroopImageUrl(name, type);
  const isMax = maxLevel && level >= maxLevel;
  const progress = maxLevel ? Math.min(100, Math.round((level / maxLevel) * 100)) : 100;

  return (
    <div
      className="group relative flex flex-col justify-between p-2 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
      title={`${name} (Lv. ${level}${maxLevel ? ` / ${maxLevel}` : ''})`}
    >
      <div className="flex items-center gap-2.5">
        {/* Troop Avatar / Fallback */}
        <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="32px"
              className="object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase select-none">
              {name.slice(0, 2)}
            </span>
          )}
        </div>

        {/* Name and Level */}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {name}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5 font-mono">
            <span>Lv {level}</span>
            {maxLevel && (
              <span className="text-neutral-400 dark:text-neutral-600">/ {maxLevel}</span>
            )}
            {isMax && (
              <span className="text-[9px] font-sans font-semibold px-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                MAX
              </span>
            )}
            {isActiveSuperTroop && (
              <span className="text-[9px] font-sans font-semibold px-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Level Progress Indicator */}
      {maxLevel > 1 && (
        <div className="w-full bg-neutral-200/60 dark:bg-neutral-700/60 h-1 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isMax ? 'bg-amber-500' : 'bg-neutral-400 dark:bg-neutral-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
