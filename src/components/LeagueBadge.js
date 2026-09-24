// src/components/LeagueBadge.js
import Image from 'next/image';

export default function LeagueBadge({ leagueTier, showName = true }) {
  if (!leagueTier?.iconUrls?.small) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
        <Image
          src={leagueTier.iconUrls.small}
          alt={leagueTier.name || 'League Badge'}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      {showName && (
        <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {leagueTier.name}
        </span>
      )}
    </div>
  );
}
