// src/app/page.js
'use client'

import { useState } from 'react';
import { getPlayerData, getPlayerBattleHistory, getPlayerCwlHistory } from './actions';
import LeagueBadge from '@/components/LeagueBadge';
import TownHallImage from '@/components/TownHallImage';
import HeroIcon from '@/components/HeroIcon';
import EquipmentIcon from '@/components/EquipmentIcon';
import BattleHistory from '@/components/BattleHistory';
import CwlHistory from '@/components/CwlHistory';
import SavedPlayers, { useSavedPlayers, normalizeTag, StarIcon } from '@/components/SavedPlayers';
import Image from 'next/image';

export default function Home() {
  const [tag, setTag] = useState('');
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [battles, setBattles] = useState(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleError, setBattleError] = useState(null);
  const [cwl, setCwl] = useState(null);
  const [cwlLoading, setCwlLoading] = useState(false);
  const [cwlError, setCwlError] = useState(null);
  const [activeTab, setActiveTab] = useState('battles');

  const {
    savedPlayers,
    isPlayerSaved,
    handleSavePlayer,
    handleRemoveSavedPlayer,
    handleToggleSavePlayer,
    handleClearAllSaved,
    enrichSavedPlayer,
  } = useSavedPlayers();

  const searchPlayer = async (targetTag) => {
    const cleanTag = (targetTag || tag).trim();
    if (!cleanTag) return;

    setTag(cleanTag);
    setLoading(true);
    setError(null);
    setBattles(null);
    setBattleError(null);
    setBattleLoading(true);
    setCwl(null);
    setCwlError(null);
    setCwlLoading(true);

    const [playerResult, battleResult, cwlResult] = await Promise.all([
      getPlayerData(cleanTag),
      getPlayerBattleHistory(cleanTag),
      getPlayerCwlHistory(cleanTag),
    ]);

    if (playerResult.error) {
      setError(playerResult.error);
      setPlayer(null);
      setBattles(null);
      setCwl(null);
    } else {
      setPlayer(playerResult.data);
      enrichSavedPlayer(playerResult.data);

      if (battleResult.error) {
        setBattleError(battleResult.error);
        setBattles([]);
      } else {
        setBattles(battleResult.data || []);
      }

      if (cwlResult.error) {
        setCwlError(cwlResult.error);
        setCwl([]);
      } else {
        setCwl(cwlResult.data || []);
      }
    }

    setLoading(false);
    setBattleLoading(false);
    setCwlLoading(false);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    searchPlayer(tag);
  };

  return (
    <main className="max-w-[640px] w-full mx-auto my-8 px-4 font-sans">
      <h1 className="text-2xl font-bold mb-6">Clash of Clans Player Lookup</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter Player Tag (e.g. #2ABC)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-3 py-2 pr-9 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase"
          />
          {tag.trim() && (
            <button
              type="button"
              onClick={() => {
                const norm = normalizeTag(tag);
                if (isPlayerSaved(norm)) {
                  handleRemoveSavedPlayer(norm);
                } else if (player && normalizeTag(player.tag) === norm) {
                  handleSavePlayer(player);
                } else {
                  handleSavePlayer({ tag: norm });
                }
              }}
              title={isPlayerSaved(tag) ? 'Remove tag from saved' : 'Save this tag'}
              aria-label={isPlayerSaved(tag) ? 'Remove tag from saved' : 'Save this tag'}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-pointer ${
                isPlayerSaved(tag)
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-gray-400 hover:text-amber-500 dark:text-neutral-500 dark:hover:text-amber-400'
              }`}
            >
              <StarIcon filled={isPlayerSaved(tag)} className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Saved Players list from browser memory */}
      <SavedPlayers
        savedPlayers={savedPlayers}
        currentTag={player ? player.tag : tag}
        onSelectPlayer={(selectedTag) => searchPlayer(selectedTag)}
        onRemovePlayer={(tagToRemove) => handleRemoveSavedPlayer(tagToRemove)}
        onClearAll={handleClearAllSaved}
      />

      {error && (
        <div className="text-red-600 dark:text-red-400 mb-4 p-2 border border-red-500/50 bg-red-50 dark:bg-red-950/20 rounded text-sm">
          {error}
        </div>
      )}

      {player && (
        <>
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 dark:text-neutral-400 font-mono text-sm">{player.tag}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleSavePlayer(player)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        isPlayerSaved(player.tag)
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-950/60'
                          : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700'
                      }`}
                      title={isPlayerSaved(player.tag) ? "Remove from saved players" : "Save this player's tag"}
                      aria-label={isPlayerSaved(player.tag) ? "Remove from saved players" : "Save this player's tag"}
                    >
                      <StarIcon filled={isPlayerSaved(player.tag)} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{isPlayerSaved(player.tag) ? 'Saved' : 'Save Tag'}</span>
                    </button>
                  </div>
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

          {/* History Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-neutral-800 mt-6 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('battles')}
              className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                activeTab === 'battles'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <span>Battle History</span>
              {battles && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                  {battles.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cwl')}
              className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                activeTab === 'cwl'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <span>CWL History</span>
              {cwl && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
                  {cwl.length} {cwl.length === 1 ? 'season' : 'seasons'}
                </span>
              )}
            </button>
          </div>

          {/* Active History View */}
          {activeTab === 'battles' ? (
            <BattleHistory
              battles={battles}
              loading={battleLoading}
              error={battleError}
            />
          ) : (
            <CwlHistory
              cwl={cwl}
              loading={cwlLoading}
              error={cwlError}
            />
          )}
        </>
      )}
    </main>
  );
}

