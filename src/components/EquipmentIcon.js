// src/components/EquipmentIcon.js
import Image from 'next/image';

export default function EquipmentIcon({ name, level, maxLevel }) {
  if (!name) return null;

  const formattedName = name.toLowerCase().replace(/\s+/g, '_');
  const imageUrl = `https://assets.clashk.ing/equipment/${formattedName}.webp`;

  const isEpic = maxLevel > 18;
  const isMax = maxLevel && level >= maxLevel;

  return (
    <div className="group relative flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 transition-colors">
      <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-0.5">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {name}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isEpic ? 'bg-purple-500' : 'bg-blue-400'
            }`}
            title={isEpic ? 'Epic Equipment' : 'Common Equipment'}
          />
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
        </div>
      </div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white shadow-md dark:bg-neutral-800 z-20 pointer-events-none">
        <span className="font-medium">{name} · {isEpic ? 'Epic' : 'Common'} (Max {maxLevel})</span>
        <div className="w-1.5 h-1.5 -mb-1 bg-neutral-900 dark:bg-neutral-800 rotate-45" />
      </div>
    </div>
  );
}
