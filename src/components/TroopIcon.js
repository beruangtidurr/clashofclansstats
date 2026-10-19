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
  isLocked = false,
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
  const isLockedUnit = isLocked || ((type === 'pet' || type === 'troop' || type === 'spell' || type === 'siege') && !isUnlocked);

  return (
    <div className="group relative shrink-0" title={`${name} (Lv. ${level}${maxLevel ? ` / ${maxLevel}` : ''})`}>
      <div className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border-2 bg-neutral-100 shadow-xs transition-all dark:bg-neutral-800/80 sm:h-9 sm:w-9 ${isLockedUnit ? 'border-neutral-300 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900' : isMax ? 'border-amber-400 dark:border-amber-500' : 'border-neutral-400 dark:border-neutral-500'}`}>
        {!imageError && imageUrl ? (
          <div className={`relative h-6 w-6 transition-transform duration-200 sm:h-7 sm:w-7 group-hover:scale-105 ${isLockedUnit ? 'grayscale opacity-40' : ''}`}>
            <Image src={imageUrl} alt={name} fill sizes="28px" className="object-contain" onError={() => setImageError(true)} />
          </div>
        ) : (
          <span className={`text-[10px] font-bold uppercase ${isLockedUnit ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-600 dark:text-neutral-200'}`}>{name.slice(0, 2)}</span>
        )}
        <span className={`absolute bottom-0.5 left-0.5 rounded px-0.5 py-px font-mono text-[7px] font-bold leading-none sm:text-[8px] ${isLockedUnit ? 'bg-neutral-500/80 text-neutral-100' : 'bg-black/75 text-white'}`}>{isLockedUnit ? '—' : level}</span>
        {isActiveSuperTroop && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-black/40" title="Active super troop" />}
      </div>
      <div className="absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white shadow-md group-hover:flex dark:bg-neutral-800">
        <span className="font-semibold">{name}</span>
        <span className="font-mono text-[11px] text-neutral-300 dark:text-neutral-400">{isLockedUnit ? 'Locked' : `Lv. ${level}${maxLevel ? ` (Max ${maxLevel})` : ''}${isMax ? ' · MAX' : ''}${isActiveSuperTroop ? ' · ACTIVE' : ''}`}</span>
        <span className="-mb-1 h-1.5 w-1.5 rotate-45 bg-neutral-900 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
