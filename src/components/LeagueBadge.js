// src/components/LeagueBadge.js
import Image from 'next/image';

export default function LeagueBadge({ leagueTier, showName = true, size = 'md' }) {
  if (!leagueTier?.iconUrls?.small) return null;

  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7 sm:w-8 sm:h-8';
  const pixelSize = size === 'sm' ? 20 : 32;

  return (
    <div className="flex items-center gap-1.5">
      <div className={`relative ${sizeClass} shrink-0`}>
        <Image
          src={leagueTier.iconUrls.small}
          alt={leagueTier.name || 'League Badge'}
          fill
          sizes={`${pixelSize}px`}
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
