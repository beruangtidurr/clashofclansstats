// src/components/LeagueBadge.js
import Image from 'next/image';

export default function LeagueBadge({ leagueTier }) {
  if (!leagueTier?.iconUrls?.small) return null;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={leagueTier.iconUrls.small}
        alt={leagueTier.name || 'League Badge'}
        width={36}
        height={36}
        className="shrink-0"
      />
      <span className="text-sm font-medium">{leagueTier.name}</span>
    </div>
  );
}

