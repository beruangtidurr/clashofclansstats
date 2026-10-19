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
    const spellName = formattedName.endsWith('_spell') ? formattedName : `${formattedName}_spell`;
    return `https://assets.clashk.ing/spells/${spellName}.webp`;
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
  const [prevKey, setPrevKey] = useState(`${type}-${name}`);

  if (prevKey !== `${type}-${name}`) {
    setPrevKey(`${type}-${name}`);
    setImageError(false);
  }

  if (!name) return null;

  const imageUrl = getTroopImageUrl(name, type);
  const isMax = maxLevel && level >= maxLevel;
  const isUnlocked = Number(level) > 0;
  const progress = maxLevel ? Math.min(100, Math.round((level / maxLevel) * 100)) : 100;

  if (type === 'pet') {
    return (
      <div className="group relative shrink-0" title={`${name} (Lv. ${level}${maxLevel ? ` / ${maxLevel}` : ''})`}>
        <div className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border-2 bg-neutral-100 shadow-xs transition-all dark:bg-neutral-800/80 sm:h-9 sm:w-9 ${!isUnlocked ? 'border-neutral-300 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900' : isMax ? 'border-amber-400 dark:border-amber-500' : 'border-neutral-400 dark:border-neutral-500'}`}>
          {!imageError && imageUrl ? (
            <div className={`relative h-6 w-6 sm:h-7 sm:w-7 ${!isUnlocked ? 'grayscale opacity-40' : ''}`}>
              <Image src={imageUrl} alt={name} fill sizes="28px" className="object-contain" onError={() => setImageError(true)} />
            </div>
          ) : (
          <span className={`text-[10px] font-bold ${isUnlocked ? 'text-neutral-600 dark:text-neutral-200' : 'text-neutral-400 dark:text-neutral-500'}`}>{name.slice(0, 2)}</span>
          )}
          <span className={`absolute bottom-0.5 left-0.5 rounded px-0.5 py-px font-mono text-[7px] font-bold leading-none sm:text-[8px] ${isUnlocked ? 'bg-black/75 text-white' : 'bg-neutral-500/80 text-neutral-100'}`}>{isUnlocked ? level : '—'}</span>
        </div>
        <div className="absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white shadow-md group-hover:flex dark:bg-neutral-800">
          <span className="font-semibold">{name}</span>
          <span className="font-mono text-[11px] text-neutral-300 dark:text-neutral-400">{isUnlocked ? `Lv. ${level}${maxLevel ? ` (Max ${maxLevel})` : ''}${isMax ? ' · MAX' : ''}` : 'Locked'}</span>
          <span className="-mb-1 h-1.5 w-1.5 rotate-45 bg-neutral-900 dark:bg-neutral-800" />
        </div>
      </div>
    );
  }

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
