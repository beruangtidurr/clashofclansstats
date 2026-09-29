// src/components/HeroIcon.js
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function HeroIcon({ name, level = 1, maxLevel }) {
  const [imageError, setImageError] = useState(false);
  const [prevName, setPrevName] = useState(name);

  if (prevName !== name) {
    setPrevName(name);
    setImageError(false);
  }

  if (!name) return null;

  const formattedName = name.toLowerCase().replace(/\s+/g, '_');
  const imageUrl = `https://assets.clashk.ing/heroes/${formattedName}/icon.webp`;
  const isMax = Boolean(maxLevel && level >= maxLevel);

  return (
    <div
      className="group relative shrink-0"
      title={`${name} (Lv. ${level}${maxLevel ? ` / ${maxLevel}` : ''})`}
    >
      <div
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800/80 border transition-all select-none shadow-xs flex items-center justify-center ${
          isMax
            ? 'border-amber-400/60 dark:border-amber-500/50 hover:border-amber-500 dark:hover:border-amber-400'
            : 'border-neutral-200/60 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
        }`}
      >
        {!imageError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 40px, 44px"
            className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase select-none">
            {name.slice(0, 2)}
          </span>
        )}

        {/* Level badge inside image left corner */}
        <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-black/75 dark:bg-black/85 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-mono font-bold leading-none shadow-sm flex items-center gap-0.5 pointer-events-none transition-all z-10">
          <span>{level}</span>
          {maxLevel && (
            <span className="hidden group-hover:inline text-neutral-300 dark:text-neutral-400 font-normal">
              /{maxLevel}
            </span>
          )}
          {isMax && (
            <span className="hidden group-hover:inline text-[8px] font-sans font-semibold text-amber-400 ml-0.5">
              MAX
            </span>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white shadow-md dark:bg-neutral-800 z-30 pointer-events-none">
        <span className="font-semibold">{name}</span>
        <span className="text-[11px] text-neutral-300 dark:text-neutral-400 font-mono">
          Lv. {level}{maxLevel ? ` (Max ${maxLevel})` : ''}{isMax ? ' · MAX' : ''}
        </span>
        <div className="w-1.5 h-1.5 -mb-1 bg-neutral-900 dark:bg-neutral-800 rotate-45" />
      </div>
    </div>
  );
}
