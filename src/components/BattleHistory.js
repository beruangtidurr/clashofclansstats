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

function getArmyLabel(battle, units) {
  const combatUnits = units.filter((unit) => unit.type !== 'spell' && unit.type !== 'siege');
  const superTroopNamesSet = new Set(Object.values(superTroopNames));
  const supportTroops = new Set(['Healer', 'Wall Breaker', 'Super Wall Breaker', 'Sneaky Goblin', 'Super Archer']);
  const coreUnits = combatUnits.filter((unit) => !supportTroops.has(unit.name));
  const signatureUnit = coreUnits.filter((unit) => superTroopNamesSet.has(unit.name)).sort((a, b) => b.quantity - a.quantity)[0]
    || coreUnits.sort((a, b) => b.quantity - a.quantity)[0]
    || combatUnits.sort((a, b) => b.quantity - a.quantity)[0];
  return battle.armyName || battle.familyName || battle.family?.name || battle.army?.name || signatureUnit?.name || 'Army variant';
}

function groupArmyVariants(battles) {
  const groups = new Map();
  battles.forEach((battle) => {
    if (battle.isAttack === false) return;
    const units = getArmyUnits(battle);
    const signature = units.length
      ? units.map((unit) => `${unit.type}:${unit.name}:${unit.quantity}`).sort().join('|')
      : battle.familyId || battle.shareCode || '';
    if (!signature) return;
    const key = `${battle.battleMode || 'Unknown'}:${signature}`;
    if (!groups.has(key)) groups.set(key, { key, label: getArmyLabel(battle, units), units, battles: [], shareCode: battle.shareCode || '' });
    groups.get(key).battles.push(battle);
  });
  return [...groups.values()].sort((a, b) => b.battles.length - a.battles.length);
}

function ArmyComposition({ units }) {
  if (!units.length) return <p className="text-xs text-neutral-500 dark:text-neutral-400">Composition details aren’t available for these attacks.</p>;
  return <div className="flex flex-wrap gap-1.5">{units.map((unit, index) => {
    const image = getTroopImageUrl(unit.name, unit.type === 'spell' ? 'spell' : unit.type);
    return <div key={`${unit.type}-${unit.name}-${index}`} title={`${unit.quantity} × ${unit.name}`} className="relative h-9 w-9 overflow-hidden rounded-md bg-neutral-800">
      <Image src={image} alt={unit.name} fill sizes="36px" className="object-contain" unoptimized />
      <span className="absolute bottom-0 right-0 rounded-tl bg-black/75 px-1 text-[9px] font-semibold text-white">{unit.quantity}×</span>
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
  const armyVariants = groupArmyVariants(filteredBattles);

  return (
    <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-5 sm:p-6 bg-white dark:bg-neutral-900/40">
      {/* Header & Filter Row */}
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-start gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {selectedDirection === 'defense' ? 'Recent Defenses' : selectedDirection === 'all' ? 'Recent Battles' : 'Recent Attacks'}
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {filteredBattles.length} {filteredBattles.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {(hasDirectionData || modes.length > 1) && <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-start sm:gap-x-8 sm:gap-y-3 [&>div]:!ml-0">
          {hasDirectionData && <div className="flex flex-col items-start gap-1.5"><span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Result</span><div role="group" aria-label="Battle direction" className="flex flex-wrap items-center gap-x-4 gap-y-2">{[
            ['attack', `Attacks (${attackCount})`],
            ['defense', `Defenses (${defenseCount})`],
            ['all', 'All'],
          ].map(([direction, label]) => <button key={direction} type="button" aria-pressed={selectedDirection === direction} onClick={() => { setSelectedDirection(direction); setVisibleCount(10); }} className={`whitespace-nowrap border-b-2 pb-1.5 text-xs transition-colors ${selectedDirection === direction ? 'border-neutral-900 font-semibold text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'}`}>{label}</button>)}</div></div>}

          {modes.length > 1 && <div className="flex flex-col items-start gap-1.5"><span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Mode</span><div role="group" aria-label="Battle mode" className="flex flex-wrap items-center gap-x-4 gap-y-2"><button type="button" aria-pressed={selectedMode === 'all'} onClick={() => { setSelectedMode('all'); setVisibleCount(10); }} className={`border-b-2 pb-1.5 text-xs transition-colors cursor-pointer ${selectedMode === 'all' ? 'border-neutral-900 font-semibold text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'}`}>All</button>{modes.map((mode) => { const isSelected = selectedMode === mode; return <button key={mode} type="button" aria-pressed={isSelected} onClick={() => { setSelectedMode(mode); setVisibleCount(10); }} className={`border-b-2 pb-1.5 text-xs capitalize transition-colors cursor-pointer ${isSelected ? 'border-neutral-900 font-semibold text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'}`}>{mode}</button>; })}</div></div>}
        </div>}
      </div>

      {/* Aggregate Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 mb-5 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
              {selectedDirection === 'defense' ? '3-Star Rate Conceded' : '3-Star Rate'}
            </div>
            <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {stats.threeStarRate}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
              {selectedDirection === 'defense' ? 'Avg Destruction Taken' : 'Avg Destruction'}
            </div>
            <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {stats.avgDestruction}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
              Avg Stars
            </div>
            <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {stats.avgStars} ★
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
              Total Loot
            </div>
            <div className="text-xs font-semibold mt-1 text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-1.5 font-sans">
              <span className="text-amber-600 dark:text-amber-400">{formatCompact(stats.totalGold)}</span>
              <span className="text-neutral-300 dark:text-neutral-600">/</span>
              <span className="text-pink-600 dark:text-pink-400">{formatCompact(stats.totalElixir)}</span>
              {stats.totalDarkElixir > 0 && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-600">/</span>
                  <span className="text-indigo-500 dark:text-indigo-400">{formatCompact(stats.totalDarkElixir)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedDirection !== 'defense' && armyVariants.length > 0 && (
        <section className="mb-5" aria-labelledby="army-variants-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h4 id="army-variants-heading" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Attack army variants</h4>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{armyVariants.length} {armyVariants.length === 1 ? 'variant' : 'variants'}</span>
          </div>
          <div className="flex flex-col gap-3">
            {armyVariants.slice(0, 6).map((variant, index) => {
              const count = variant.battles.length;
              const avgStars = (variant.battles.reduce((sum, battle) => sum + (battle.stars ?? 0), 0) / count).toFixed(1);
              const avgDestruction = Math.round(variant.battles.reduce((sum, battle) => sum + (battle.destructionPercentage ?? 0), 0) / count);
              return <article key={variant.key} className="rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    {index === 0 && <span className="mb-1 inline-block rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950">Most used</span>}
                    <h5 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{variant.label}</h5>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{count} {count === 1 ? 'attack' : 'attacks'}</p>
                  </div>
                  {variant.shareCode && <a href={`https://link.clashofclans.com/en?action=CopyArmy&army=${encodeURIComponent(variant.shareCode)}`} target="_blank" rel="noreferrer" aria-label={`Open ${variant.label} in Clash of Clans`} title="Open army in Clash of Clans" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><span aria-hidden="true">↗</span></a>}
                </div>
                <ArmyComposition units={variant.units} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-2 text-xs dark:border-neutral-800">
                  <span className="text-amber-500">★★★ <span className="text-neutral-500 dark:text-neutral-400">×{variant.battles.filter((battle) => battle.stars === 3).length}</span></span>
                  <span className="text-neutral-600 dark:text-neutral-300">Avg. {avgStars} ★ <span className="ml-1 text-neutral-500 dark:text-neutral-400">{avgDestruction}%</span></span>
                </div>
              </article>;
            })}
          </div>
        </section>
      )}

      {/* Battle Cards List */}
      <div className="space-y-2.5">
        {visibleBattles.map((battle, index) => {
          const stars = battle.stars ?? 0;
          const destruction = battle.destructionPercentage ?? 0;
          const isThreeStar = stars === 3;
          const isCopied = copiedCode === battle.shareCode;

          return (
            <div
              key={`${battle.battleTime}-${index}`}
              className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/70 bg-neutral-50/30 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              {/* Top row: Mode badge, timestamp, duration */}
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {battle.battleMode || 'Attack'}
                  </span>
                  {typeof battle.isAttack === 'boolean' && <span className={`text-[10px] font-semibold uppercase tracking-wider ${battle.isAttack ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{battle.isAttack ? 'Attack' : 'Defense'}</span>}

                  <span title={formatFullTime(battle.battleTime)} className="text-[11px]">
                    {formatRelativeTime(battle.battleTime)}
                  </span>
                </div>

                {battle.duration !== undefined && (
                  <span className="font-sans text-[11px] text-neutral-400">
                    {formatDuration(battle.duration)}
                  </span>
                )}
              </div>

              {/* Middle row: Stars, Destruction % */}
              <div className="flex items-center justify-between gap-4 my-1.5">
                {/* Visual Stars */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((starIdx) => {
                    const earned = starIdx < stars;
                    return (
                      <svg
                        key={starIdx}
                        className={`w-5 h-5 ${
                          earned
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-200 dark:text-neutral-800 fill-neutral-200 dark:fill-neutral-800'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  })}
                  <span className="text-xs font-sans font-medium ml-1.5 text-neutral-500 dark:text-neutral-400">
                    {stars}/3
                  </span>
                </div>

                {/* Destruction % */}
                <div className="text-base font-bold font-sans text-neutral-900 dark:text-neutral-100">
                  {destruction}%
                </div>
              </div>

              {/* Slender Destruction Progress Bar */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1 overflow-hidden my-2.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    isThreeStar
                      ? 'bg-amber-400'
                      : destruction >= 50
                      ? 'bg-neutral-600 dark:bg-neutral-300'
                      : 'bg-neutral-400 dark:bg-neutral-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, destruction))}%` }}
                />
              </div>

              {/* Bottom row: Looted Resources & Copy Army Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
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
