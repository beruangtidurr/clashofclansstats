// src/components/LeagueBadge.js
import Image from 'next/image';

export default function LeagueBadge({ leagueTier }) {
  if (!leagueTier?.iconUrls?.small) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image
        src={leagueTier.iconUrls.small}
        alt={leagueTier.name || 'League Badge'}
        width={36}
        height={36}
      />
      <span>{leagueTier.name}</span>
    </div>
  );
}
