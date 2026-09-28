// src/components/TownHallImage.js
import Image from 'next/image';

export default function TownHallImage({ level, size = 'md' }) {
  if (!level) return null;

  const imageUrl = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${level}.webp`;
  const sizeClasses =
    size === 'xs'
      ? 'w-7 h-7 sm:w-8 sm:h-8'
      : size === 'sm'
      ? 'w-10 h-10'
      : 'w-14 h-14 sm:w-16 sm:h-16';
  const pixelSize = size === 'xs' ? 32 : size === 'sm' ? 40 : 64;

  return (
    <div className={`relative ${sizeClasses} shrink-0`}>
      <Image
        src={imageUrl}
        alt={`Town Hall Level ${level}`}
        fill
        sizes={`${pixelSize}px`}
        className="object-contain"
      />
    </div>
  );
}
