// src/components/TownHallImage.js
import Image from 'next/image';

export default function TownHallImage({ level, size = 'md' }) {
  if (!level) return null;

  const imageLevel = Math.min(19, Math.max(1, Number(level)));
  const imageUrl = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${imageLevel}.webp`;
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
        alt={`Town Hall Level ${imageLevel}`}
        fill
        sizes={`${pixelSize}px`}
        className="object-contain"
      />
    </div>
  );
}
