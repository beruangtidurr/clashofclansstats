// src/app/page.js
'use client'

import { useState } from 'react';
import { getPlayerData } from './actions';
import LeagueBadge from '@/components/LeagueBadge';
import TownHallImage from '@/components/TownHallImage';
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
            <div>
              <h2 className="font-black">{player.name}</h2>
              <span className="font-mono text-[#666]">{player.tag}</span>
            </div>
            {/* Render the League Badge if league / leagueTier exists */}
            <LeagueBadge leagueTier={player.leagueTier || player.league} />
            <Image src="https://assets.clashk.ing/icons/Icon_HV_Trophy.png"  width="25" height="25" alt="Throphy Icon"/>
            {player.trophies}
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <TownHallImage level={player.townHallLevel} />
              <strong>Town Hall Level:</strong> {player.townHallLevel}
            </div>
            <div>
              <strong>Best Trophies:</strong> {player.bestTrophies}
            </div>
            <div>
              <strong>Exp Level:</strong> {player.expLevel}
            </div>
            <div>
              <strong>Clan:</strong> {player.clan ? player.clan.name : 'No Clan'}
            </div>
            <div>
              <strong>War Stars:</strong> {player.warStars}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
