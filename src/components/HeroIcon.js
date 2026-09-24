// src/components/HeroIcon.js
import Image from 'next/image';

export default function HeroIcon({ name, level, maxLevel }) {
  if (!name) return null;

  const formattedName = name.toLowerCase().replace(/\s+/g, '_');
  const imageUrl = `https://assets.clashk.ing/heroes/${formattedName}/icon.webp`;
  const isMax = maxLevel && level >= maxLevel;

  return (
    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 transition-colors">
      <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
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
        </div>
      </div>
    </div>
  );
}
