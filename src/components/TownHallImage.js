// src/components/TownHallImage.js
import Image from 'next/image';

export default function TownHallImage({ level }) {
  if (!level) return null;

  // Direct CDN URL from ClashKing
  const imageUrl = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${level}.webp`;

  return (
    <div className="relative w-[90px] h-[90px] shrink-0">
      <Image
        src={imageUrl}
        alt={`Town Hall Level ${level}`}
        fill
        sizes="90px"
        className="object-contain"
      />
    </div>
  );
}

