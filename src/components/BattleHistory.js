// src/components/BattleHistory.js
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getTroopImageUrl } from './TroopIcon';
import itemNames from '../app/track/item-names.json';

const superTroopNames = {
  4000026: 'Super Barbarian',
  4000027: 'Super Archer',
  4000028: 'Super Wall Breaker',
  4000029: 'Super Giant',
  4000055: 'Sneaky Goblin',
  4000056: 'Super Miner',
  4000057: 'Rocket Balloon',
  4000063: 'Inferno Dragon',
  4000064: 'Super Valkyrie',
  4000066: 'Super Witch',
  4000076: 'Ice Hound',
  4000080: 'Super Bowler',
  4000081: 'Super Dragon',
  4000083: 'Super Wizard',
  4000084: 'Super Minion',
  4000098: 'Super Hog Rider',
  4000147: 'Super Yeti',
};

function decodeArmyShareCode(shareCode) {
  if (typeof shareCode !== 'string') return [];
  const payload = shareCode.includes('army=')
    ? new URLSearchParams(shareCode.split('?').pop()).get('army') || ''
    : shareCode;
  const units = [];
  for (const [, section, contents] of payload.matchAll(/([us])((?:\d+x\d+)(?:-\d+x\d+)*)/gi)) {
    const type = section.toLowerCase() === 's' ? 'spell' : 'troop';
    const baseId = type === 'spell' ? 26000000 : 4000000;
    const entries = contents.matchAll(/(\d+)x(\d+)/g);
    // Clash battle-log army codes encode quantity x troop ID (for example, 5x80 = five Super Bowlers).
    for (const [, quantity, id] of entries) {
      const dataId = baseId + Number(id);
      const name = itemNames[`home:${dataId}`] || (type === 'troop' ? superTroopNames[dataId] : undefined);
      if (name) units.push({ name, type, quantity: Number(quantity) });
    }
  }
  return units;
}

function getArmyUnits(battle) {
  const source = battle.army || battle.composition || battle;
  const troops = source.troops || source.units || [];
  const spells = source.spells || [];
  const units = [
    ...troops.map((unit) => ({ ...unit, type: unit.type === 'siege' ? 'siege' : 'troop', quantity: unit.quantity ?? unit.count ?? unit.amount ?? 1 })),
    ...spells.map((unit) => ({ ...unit, type: 'spell', quantity: unit.quantity ?? unit.count ?? unit.amount ?? 1 })),
  ].filter((unit) => unit.name);
  return units.length ? units : decodeArmyShareCode(battle.shareCode || battle.armyShareCode);
}

function ArmyComposition({ units }) {
  if (!units.length) return <p className="text-xs text-neutral-500 dark:text-neutral-400">Composition details aren’t available for these attacks.</p>;
  return <div className="flex flex-wrap gap-0.5">{units.map((unit, index) => {
    const image = getTroopImageUrl(unit.name, unit.type === 'spell' ? 'spell' : unit.type);
    return <div key={`${unit.type}-${unit.name}-${index}`} title={`${unit.quantity} × ${unit.name}`} className="relative h-9 w-9 overflow-hidden rounded-md bg-neutral-800/70">
      <Image src={image} alt={unit.name} fill sizes="36px" className="object-contain" unoptimized />
      {unit.quantity > 1 && <span className="absolute bottom-0 right-0 rounded-tl bg-black/75 px-1 text-[9px] font-semibold text-white">{unit.quantity}×</span>}
    </div>;
  })}</div>;
}

function parseBattleDate(value) {
  if (!value) return null;
  if (typeof value === 'number' || /^\d+$/.test(String(value).trim())) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  // Clash timestamps commonly use the compact API form: YYYYMMDDTHHmmss.sssZ.
  const compact = String(value).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?Z?$/);
  if (!compact) return null;
  const [, year, month, day, hour, minute, second, fraction = '0'] = compact;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), Number(`0.${fraction}`) * 1000));
}

function formatRelativeTime(isoString) {
  const date = parseBattleDate(isoString);
  if (!date) return '';
  try {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatFullTime(isoString) {
  const date = parseBattleDate(isoString);
  if (!date) return '';
  try {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
}

function formatDuration(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

function formatCompact(num) {
  if (typeof num !== 'number') return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

function GoldIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-amber-500 fill-amber-400" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
    </svg>
  );
}

function ElixirIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-pink-500 fill-pink-500" viewBox="0 0 24 24">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function DarkElixirIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-indigo-400 fill-indigo-900 stroke-indigo-400 stroke-1" viewBox="0 0 24 24">
      <path d="M12 2L4 9l8 13 8-13z" />
    </svg>
  );
}

export default function BattleHistory({ battles, loading, error }) {
  const [selectedDirection, setSelectedDirection] = useState('attack');
  const [selectedMode, setSelectedMode] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [copiedCode, setCopiedCode] = useState(null);
  const hasDirectionData = Array.isArray(battles) && battles.length > 0 && battles.every((battle) => typeof battle.isAttack === 'boolean');
  const attackCount = Array.isArray(battles) ? battles.filter((battle) => battle.isAttack === true).length : 0;
  const defenseCount = Array.isArray(battles) ? battles.filter((battle) => battle.isAttack === false).length : 0;

  // Available modes from items
  const modes = useMemo(() => {
    if (!Array.isArray(battles)) return [];
    const set = new Set();
    battles.forEach((b) => {
      if (b.battleMode) set.add(b.battleMode);
    });
    return Array.from(set);
  }, [battles]);

  // Filtered battles
  const filteredBattles = useMemo(() => {
    if (!Array.isArray(battles)) return [];
    return battles.filter((battle) => {
      const matchesDirection = selectedDirection === 'all'
        || (selectedDirection === 'attack' ? battle.isAttack === true : battle.isAttack === false);
      const matchesMode = selectedMode === 'all' || battle.battleMode === selectedMode;
      return matchesDirection && matchesMode;
    });
  }, [battles, selectedDirection, selectedMode]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!filteredBattles.length) return null;
    const total = filteredBattles.length;
    let totalStars = 0;
    let threeStars = 0;
    let totalDestruction = 0;
    let totalGold = 0;
    let totalElixir = 0;
    let totalDarkElixir = 0;

    filteredBattles.forEach((b) => {
      totalStars += b.stars ?? 0;
      if (b.stars === 3) threeStars += 1;
      totalDestruction += b.destructionPercentage ?? 0;
      if (b.lootedResources) {
        totalGold += b.lootedResources.gold ?? 0;
        totalElixir += b.lootedResources.elixir ?? 0;
        totalDarkElixir += b.lootedResources.darkElixir ?? 0;
      }
    });

    return {
      total,
      threeStarRate: Math.round((threeStars / total) * 100),
      avgStars: (totalStars / total).toFixed(1),
      avgDestruction: Math.round(totalDestruction / total),
      totalGold,
      totalElixir,
      totalDarkElixir,
    };
  }, [filteredBattles]);

  const handleCopyArmy = (shareCode) => {
    if (!shareCode) return;
    const armyUrl = `https://link.clashofclans.com/en?action=CopyArmy&army=${shareCode}`;
    navigator.clipboard.writeText(armyUrl).then(() => {
      setCopiedCode(shareCode);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    });
  };

  if (loading) {
    return <div className="space-y-4 py-4 animate-pulse"><div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-800" /><div className="h-px bg-neutral-200 dark:bg-neutral-800" /><div className="h-16 bg-neutral-100 dark:bg-neutral-900" /><div className="h-16 bg-neutral-100 dark:bg-neutral-900" /></div>;
  }

  if (error && (!battles || battles.length === 0)) {
    return (
      <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-6 bg-white dark:bg-neutral-900/40 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Unable to load battle history: {error}
        </p>
      </div>
    );
  }

  if (!battles || battles.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-8 bg-white dark:bg-neutral-900/40 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No recorded battle history found for this player.
        </p>
      </div>
    );
  }

  if (!filteredBattles.length) {
    return <div className="py-8 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">No {selectedDirection === 'defense' ? 'defense' : 'attack'} records found for this player.</p></div>;
  }

  const visibleBattles = filteredBattles.slice(0, visibleCount);
  const starCounts = [1, 2, 3].map((stars) => filteredBattles.filter((battle) => battle.stars === stars).length);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5 flex flex-col items-center gap-4">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Battle</h3>
        <div className="flex items-center gap-8 border-b border-neutral-200 dark:border-neutral-800" role="tablist" aria-label="Battle history">
          <button type="button" role="tab" aria-selected="true" className="border-b-2 border-amber-300 px-1 pb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Log</button>
          <button type="button" role="tab" aria-selected="false" disabled className="border-b-2 border-transparent px-1 pb-2 text-sm text-neutral-400">Ranking</button>
          <button type="button" role="tab" aria-selected="false" disabled className="border-b-2 border-transparent px-1 pb-2 text-sm text-neutral-400">History</button>
        </div>
        <div className="flex w-full justify-center gap-8">
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <span className="sr-only">Battle direction</span>
            <select value={selectedDirection} onChange={(event) => { setSelectedDirection(event.target.value); setVisibleCount(10); }} className="cursor-pointer appearance-none bg-transparent py-1 pr-5 font-medium focus:outline-none">
              <option value="attack">Attacks</option><option value="defense">Defenses</option><option value="all">All battles</option>
            </select><span aria-hidden="true" className="pointer-events-none -ml-5 text-xs">▼</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <span className="sr-only">Battle mode</span>
            <select value={selectedMode} onChange={(event) => { setSelectedMode(event.target.value); setVisibleCount(10); }} className="cursor-pointer appearance-none bg-transparent py-1 pr-5 font-medium capitalize focus:outline-none">
              <option value="all">All modes</option>{modes.map((mode) => <option key={mode} value={mode} className="capitalize">{mode}</option>)}
            </select><span aria-hidden="true" className="pointer-events-none -ml-5 text-xs">▼</span>
          </label>
        </div>
      </div>

      {stats && <div className="mb-5 flex items-start justify-center gap-7 text-center sm:gap-10">
        <div className="flex gap-3 sm:gap-4">{starCounts.map((count, index) => <div key={index}>
          <div className="text-sm leading-none text-amber-400">{'★'.repeat(index + 1)}<span className="text-neutral-500">{'★'.repeat(2 - index)}</span></div>
          <div className="mt-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100">{count} <span className="font-normal text-neutral-500">({stats.total ? ((count / stats.total) * 100).toFixed(2) : '0.00'}%)</span></div>
        </div>)}</div>
        <div><div className="text-[11px] text-neutral-500 dark:text-neutral-400">Average stars</div><div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{stats.avgStars}</div><div className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">Average destruction</div><div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{stats.avgDestruction}%</div></div>
      </div>}

      {/* Battle Cards List */}
      <div className="space-y-2.5">
        {visibleBattles.map((battle, index) => {
          const stars = battle.stars ?? 0;
          const destruction = battle.destructionPercentage ?? 0;
          const isCopied = copiedCode === battle.shareCode;

          return (
            <div
              key={`${battle.battleTime}-${index}`}
              className="rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-4 dark:border-neutral-800/70 dark:bg-[#2b2e36]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {battle.isAttack === false ? 'Defense' : 'Attack'}
                    {typeof battle.trophyChange === 'number' && <span className={`ml-2 ${battle.trophyChange >= 0 ? 'text-green-500' : 'text-red-400'}`}>{battle.trophyChange > 0 ? '+' : ''}{battle.trophyChange}</span>}
                  </div>
                  <div className="truncate text-xs text-neutral-500 dark:text-neutral-400" title={battle.opponentTag || undefined}>{battle.opponentName || battle.battleMode || 'Battle'}{battle.opponentTag && <span className="ml-1 text-neutral-400">{battle.opponentTag}</span>}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    <span className="tracking-tight text-amber-400">{'★'.repeat(stars)}<span className="text-neutral-500">{'★'.repeat(Math.max(0, 3 - stars))}</span></span>
                    <span>{destruction}%</span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400" title={formatFullTime(battle.battleTime)}>{formatDuration(battle.duration) || formatRelativeTime(battle.battleTime)}</div>
                </div>
              </div>

              <div className="mb-3">
                {getArmyUnits(battle).length > 0
                  ? <ArmyComposition units={getArmyUnits(battle)} />
                  : <p className="text-xs text-neutral-500 dark:text-neutral-400">Army composition unavailable</p>}
              </div>

              {/* Bottom row: Looted Resources & Copy Army Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {/* Loot */}
                {battle.lootedResources ? (
                  <div className="flex items-center gap-3 font-sans text-[11px]">
                    <div className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300" title={`Gold: ${formatNumber(battle.lootedResources.gold)}`}>
                      <GoldIcon />
                      <span>{formatCompact(battle.lootedResources.gold)}</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300" title={`Elixir: ${formatNumber(battle.lootedResources.elixir)}`}>
                      <ElixirIcon />
                      <span>{formatCompact(battle.lootedResources.elixir)}</span>
                    </div>

                    {battle.lootedResources.darkElixir > 0 && (
                      <div className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300" title={`Dark Elixir: ${formatNumber(battle.lootedResources.darkElixir)}`}>
                        <DarkElixirIcon />
                        <span>{formatCompact(battle.lootedResources.darkElixir)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400 text-xs">No loot recorded</span>
                )}

                {/* Army Copy Button */}
                {battle.shareCode && (
                  <button
                    type="button"
                    onClick={() => handleCopyArmy(battle.shareCode)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ml-auto ${
                      isCopied
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                    title="Copy Army link"
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {/* <span>Copy Army</span> */}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredBattles.length > 10 && (
        <div className="mt-4 flex items-center justify-center gap-3 pt-2">
          {visibleCount < filteredBattles.length ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredBattles.length))}
              className="px-4 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Show More ({filteredBattles.length - visibleCount} remaining)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisibleCount(10)}
              className="px-4 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
