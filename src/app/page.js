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
    <main className="max-w-[600px] w-full mx-auto my-8 px-4 font-sans">
      <h1 className="text-2xl font-bold mb-6">Clash of Clans Player Lookup</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Player Tag (e.g. #2ABC)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 dark:text-red-400 mb-4 p-2 border border-red-500/50 bg-red-50 dark:bg-red-950/20 rounded text-sm">
          {error}
        </div>
      )}

      {player && (
        <div className="border border-gray-300 dark:border-neutral-700 p-6 rounded-lg shadow-sm bg-white dark:bg-neutral-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TownHallImage level={player.townHallLevel} />
              <div>
                <h2 className="m-0 text-xl font-bold">{player.name}</h2>
                {player.clan ? (
                  <div className="flex items-center gap-1.5 my-0.5">
                    {player.clan.badgeUrls?.small && (
                      <div className="relative w-6 h-6 shrink-0">
                        <Image
                          src={player.clan.badgeUrls.small}
                          alt={player.clan.name || 'Clan Badge'}
                          fill
                          sizes="24px"
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {player.clan.name}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-neutral-400 my-0.5">
                    No Clan
                  </div>
                )}
                <span className="text-gray-500 dark:text-neutral-400 font-mono text-sm">{player.tag}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeagueBadge leagueTier={player.leagueTier || player.league} />
              <Image src="https://assets.clashk.ing/icons/Icon_HV_Trophy.png" width={25} height={25} alt="Trophy Icon" className="shrink-0" />
              <strong>{player.trophies}</strong>
            </div>
          </div>

          <hr className="my-4 border-gray-200 dark:border-neutral-800" />

          <div className="grid grid-cols-2 gap-4">
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
            <div className="col-span-2">
              <strong className="block mb-2">Home Village Heroes:</strong>
              {player.heroes && player.heroes.filter((hero) => hero.village === 'home').length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
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
            <div className="col-span-2">
              <strong className="block mb-2">Hero Equipment:</strong>
              {player.heroEquipment && player.heroEquipment.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
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
          </div>
        </div>
      )}
    </main>
  );
}
