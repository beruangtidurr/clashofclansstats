// src/components/HeroIcon.js
import Image from 'next/image';

export default function HeroIcon({ name, level, maxLevel }) {
  if (!name) return null;

  // Convert hero name to snake_case for ClashKing asset URL
  // e.g. "Barbarian King" -> "barbarian_king"
  // e.g. "Grand Warden" -> "grand_warden"
  const formattedName = name.toLowerCase().replace(/\s+/g, '_');
  
  const imageUrl = `https://assets.clashk.ing/heroes/${formattedName}/icon.webp`;

  return (
    <div className="inline-flex items-center gap-2 mb-1.5">
      <div className="relative w-9 h-9 shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="36px"
          className="object-contain"
        />
      </div>
      <div>
        <span className="font-semibold text-sm">{name}</span>
        <span className="text-gray-500 dark:text-neutral-400 text-xs ml-1.5">
          Lvl {level}{maxLevel ? `/${maxLevel}` : ''}
        </span>
      </div>
    </div>
  );
}

