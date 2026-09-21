// src/components/EquipmentIcon.js
import Image from 'next/image';

export default function EquipmentIcon({ name, level, maxLevel }) {
  if (!name) return null;

  // Convert gear name to snake_case for ClashKing asset URL
  // e.g. "Giant Gauntlet" -> "giant_gauntlet"
  // e.g. "Frozen Arrow" -> "frozen_arrow"
  const formattedName = name.toLowerCase().replace(/\s+/g, '_');

  const imageUrl = `https://assets.clashk.ing/equipment/${formattedName}.webp`;

  return (
    <div className="inline-flex items-center gap-2 mb-1.5">
      <div className="relative w-8 h-8 shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="32px"
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

