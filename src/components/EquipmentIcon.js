// src/components/EquipmentIcon.js
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function EquipmentIcon({ name, level = 1, maxLevel }) {
  const [imageError, setImageError] = useState(false);
  const [prevName, setPrevName] = useState(name);

  if (prevName !== name) {
    setPrevName(name);
    setImageError(false);
  }

  if (!name) return null;

  const formattedName = name.toLowerCase().replace(/\s+/g, '_');
  const imageUrl = name === 'Portal Pendant'
    ? 'https://www.clash.ninja/images/entities/296.png'
    : `https://assets.clashk.ing/equipment/${formattedName}.webp`;

  const isEpic = maxLevel > 18;
  const isMax = Boolean(maxLevel && level >= maxLevel);

  return (
    <div
      className="group relative shrink-0"
      title={`${name} (Lv. ${level}${maxLevel ? ` / ${maxLevel}` : ''})`}
    >
      <div
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border transition-all select-none shadow-xs flex items-center justify-center ${
          isEpic ? 'bg-[#8f409e]' : 'bg-[#3c8bcc]'
        } ${
          isMax
            ? 'border-2 border-amber-400 dark:border-amber-500 hover:border-amber-400 dark:hover:border-amber-500'
            : 'border-2 border-neutral-400 dark:border-neutral-500 hover:border-neutral-500 dark:hover:border-neutral-400'
        }`}
      >
        {!imageError && imageUrl ? (
          <div className="relative h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-105">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="28px"
              className="object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-200 uppercase select-none">
            {name.slice(0, 2)}
          </span>
        )}

        {/* Level badge inside image left corner */}
        <div className="absolute bottom-0.5 left-0.5 px-0.5 py-px rounded bg-black/75 dark:bg-black/85 backdrop-blur-xs text-white text-[7px] sm:text-[8px] font-mono font-bold leading-none shadow-sm flex items-center gap-0.5 pointer-events-none transition-all z-10">
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
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{name}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isEpic ? 'bg-purple-500' : 'bg-blue-400'
            }`}
          />
        </div>
        <span className="text-[11px] text-neutral-300 dark:text-neutral-400 font-mono">
          {isEpic ? 'Epic' : 'Common'} · Lv. {level}{maxLevel ? ` (Max ${maxLevel})` : ''}{isMax ? ' · MAX' : ''}
        </span>
        <div className="w-1.5 h-1.5 -mb-1 bg-neutral-900 dark:bg-neutral-800 rotate-45" />
      </div>
    </div>
  );
}
