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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
      <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="36px"
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div>
        <span style={{ fontWeight: '600' }}>{name}</span>
        <span style={{ color: '#666', fontSize: '0.875rem', marginLeft: '0.3rem' }}>
          Lvl {level}{maxLevel ? `/${maxLevel}` : ''}
        </span>
      </div>
    </div>
  );
}
