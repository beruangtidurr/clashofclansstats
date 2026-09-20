// src/components/TownHallImage.js
import Image from 'next/image';

export default function TownHallImage({ level }) {
  if (!level) return null;

  // Direct CDN URL from ClashKing
  const imageUrl = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${level}.webp`;

  return (
    <div style={{ position: 'relative', width: '90px', height: '90px' }}>
      <Image
        src={imageUrl}
        alt={`Town Hall Level ${level}`}
        fill
        sizes="90px"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
