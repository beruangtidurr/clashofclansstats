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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
      <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="32px"
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div>
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{name}</span>
        <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '0.3rem' }}>
          Lvl {level}{maxLevel ? `/${maxLevel}` : ''}
        </span>
      </div>
    </div>
  );
}
