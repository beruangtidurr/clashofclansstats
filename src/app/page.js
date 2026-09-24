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
  const [copiedTag, setCopiedTag] = useState(false);

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

  const handleCopyTag = (playerTag) => {
    if (!playerTag) return;
    navigator.clipboard.writeText(playerTag).then(() => {
      setCopiedTag(true);
      setTimeout(() => setCopiedTag(false), 2000);
    });
  };

  return (
    <main className="max-w-2xl w-full mx-auto py-10 px-4 sm:px-6 font-sans antialiased">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Clash of Clans
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Player stats, attacks & CWL performance
        </p>
      </div>

      {/* Minimalist Search Form */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 focus-within:border-neutral-400 dark:focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-neutral-900/5 dark:focus-within:ring-neutral-100/5 transition-all">
          <div className="pl-2.5 text-neutral-400 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Enter player tag (e.g. #2ABC)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full bg-transparent px-1 py-1 text-sm font-mono uppercase text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-sans focus:outline-none"
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
              className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isPlayerSaved(tag)
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
            >
              <StarIcon filled={isPlayerSaved(tag)} className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:disabled:bg-neutral-700 text-white dark:text-neutral-900 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Saved Players list */}
      <SavedPlayers
        savedPlayers={savedPlayers}
        currentTag={player ? player.tag : tag}
        onSelectPlayer={(selectedTag) => searchPlayer(selectedTag)}
        onRemovePlayer={(tagToRemove) => handleRemoveSavedPlayer(tagToRemove)}
        onClearAll={handleClearAllSaved}
      />

      {/* Error state */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Player Profile Details */}
      {player && (
        <>
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-5 sm:p-6 mb-6">
            {/* Top row: TH image, Player info, League badge & Trophies */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TownHallImage level={player.townHallLevel} />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {player.name}
                  </h2>

                  {/* Clan Row */}
                  {player.clan ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {player.clan.badgeUrls?.small && (
                        <div className="relative w-4 h-4 shrink-0">
                          <Image
                            src={player.clan.badgeUrls.small}
                            alt={player.clan.name || 'Clan Badge'}
                            fill
                            sizes="16px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {player.clan.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 mt-0.5">
                      No Clan
                    </div>
                  )}

                  {/* Tag + Save & Copy Actions */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyTag(player.tag)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                      title="Click to copy tag"
                    >
                      <span>{player.tag}</span>
                      {copiedTag ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                          Copied
                        </span>
                      ) : (
                        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSavePlayer(player)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        isPlayerSaved(player.tag)
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}
                      title={isPlayerSaved(player.tag) ? "Remove from saved players" : "Save this player's tag"}
                      aria-label={isPlayerSaved(player.tag) ? "Remove from saved players" : "Save this player's tag"}
                    >
                      <StarIcon filled={isPlayerSaved(player.tag)} className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{isPlayerSaved(player.tag) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Trophies & League Block */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-800/80">
                <LeagueBadge leagueTier={player.leagueTier || player.league} />
                <div className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <Image
                    src="https://assets.clashk.ing/icons/Icon_HV_Trophy.png"
                    width={20}
                    height={20}
                    alt="Trophy"
                    className="shrink-0"
                  />
                  <span>{player.trophies}</span>
                </div>
              </div>
            </div>

            {/* 4 Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 my-5 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                  Town Hall
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  TH {player.townHallLevel}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                  Best Trophies
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {player.bestTrophies}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                  War Stars
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {player.warStars} ★
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                  Exp Level
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  Lv. {player.expLevel}
                </div>
              </div>
            </div>

            {/* Home Village Heroes section */}
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                Heroes
              </div>
              {player.heroes && player.heroes.filter((hero) => hero.village === 'home').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                <div className="text-xs text-neutral-400">No heroes unlocked</div>
              )}
            </div>

            {/* Hero Equipment section */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                Equipment
              </div>
              {player.heroEquipment && player.heroEquipment.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                <div className="text-xs text-neutral-400">No equipment unlocked</div>
              )}
            </div>
          </div>

          {/* History Navigation Tabs */}
          <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl mb-4 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('battles')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'battles'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <span>Recent Attacks</span>
              {battles && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {battles.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cwl')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cwl'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <span>CWL History</span>
              {cwl && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {cwl.length}
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
