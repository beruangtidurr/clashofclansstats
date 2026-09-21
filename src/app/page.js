// src/app/page.js
'use client'

import { useState } from 'react';
import { getPlayerData } from './actions';
import LeagueBadge from '@/components/LeagueBadge';
import TownHallImage from '@/components/TownHallImage';
import HeroIcon from '@/components/HeroIcon';
import EquipmentIcon from '@/components/EquipmentIcon';
import Image from 'next/image';

export default function Home() {
  const [tag, setTag] = useState('');
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!tag) return;

    setLoading(true);
    setError(null);

    const result = await getPlayerData(tag);

    if (result.error) {
      setError(result.error);
      setPlayer(null);
    } else {
      setPlayer(result.data);
    }

    setLoading(false);
  };

  return (
    <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h1>Clash of Clans Player Lookup</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Enter Player Tag (e.g. #2ABC)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {player && (
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TownHallImage level={player.townHallLevel} />
              <div>
                <h2 style={{ margin: 0 }}>{player.name}</h2>
                <span style={{ color: '#666', fontFamily: 'monospace' }}>{player.tag}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LeagueBadge leagueTier={player.leagueTier || player.league} />
              <Image src="https://assets.clashk.ing/icons/Icon_HV_Trophy.png" width="25" height="25" alt="Trophy Icon" />
              <strong>{player.trophies}</strong>
            </div>
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>Town Hall Level:</strong> {player.townHallLevel}
            </div>
            <div>
              <strong>Best Trophies:</strong> {player.bestTrophies}
            </div>
            <div>
              <strong>Exp Level:</strong> {player.expLevel}
            </div>
            <div>
              <strong>War Stars:</strong> {player.warStars}
            </div>

            {/* Home Village Heroes section */}
            <div style={{ gridColumn: '1 / -1' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Home Village Heroes:</strong>
              {player.heroes && player.heroes.filter((hero) => hero.village === 'home').length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {player.heroes
                    .filter((hero) => hero.village === 'home')
                    .map((hero) => (
                      <HeroIcon
                        key={hero.name}
                        name={hero.name}
                        level={hero.level}
                        maxLevel={hero.maxLevel}
                      />
                    ))}
                </div>
              ) : (
                <span> None</span>
              )}
            </div>

            {/* Hero Equipment section */}
            <div style={{ gridColumn: '1 / -1' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Hero Equipment:</strong>
              {player.heroEquipment && player.heroEquipment.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {player.heroEquipment.map((gear) => (
                    <EquipmentIcon
                      key={gear.name}
                      name={gear.name}
                      level={gear.level}
                      maxLevel={gear.maxLevel}
                    />
                  ))}
                </div>
              ) : (
                <span> None</span>
              )}
            </div>

            <div>
              <strong>Clan:</strong> {player.clan ? player.clan.name : 'No Clan'}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
