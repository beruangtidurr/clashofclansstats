// src/components/EquipmentIcon.js
import Image from 'next/image';

export default function EquipmentIcon({ name, level, maxLevel }) {
  if (!name) return null;

  // Convert gear name to snake_case for ClashKing asset URL
  const formattedName = name.toLowerCase().replace(/\s+/g, '_');
  const imageUrl = `https://assets.clashk.ing/equipment/${formattedName}.webp`;

  // Determine rarity background and style based on maxLevel
  // Epic max level is usually 27 (or 24), Common max level is 18
  const isEpic = maxLevel > 18;
  const bgColor = isEpic ? 'bg-[#8F409E]' : 'bg-[#3C8BCC]';

  const tooltipText = `${name} (Max Lvl ${maxLevel})`;

  return (
    <div className="group relative inline-flex items-center gap-1.5 mb-1.5 cursor-pointer">
      {/* Icon Container with Rarity Background */}
      <div className={`relative w-9 h-9 shrink-0 p-1 rounded-lg ${bgColor} shadow-sm flex items-center justify-center`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="36px"
          className="object-contain p-0.5"
        />
      </div>

      {/* Current Level Badge */}
      <span className="font-bold text-xs text-gray-800 dark:text-neutral-200">
        Lvl {level}
      </span>

      {/* Hover Tooltip showing Name and Max Level */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white shadow-lg dark:bg-neutral-800 z-20 pointer-events-none">
        <span className="font-medium">{tooltipText}</span>
        {/* Tooltip Arrow */}
        <div className="w-2 h-2 -mb-1 bg-gray-900 dark:bg-neutral-800 rotate-45" />
      </div>
    </div>
  );
}
