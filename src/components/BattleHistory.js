// src/components/BattleHistory.js
'use client';

import { useState, useMemo } from 'react';

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatFullTime(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
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
  const [selectedMode, setSelectedMode] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [copiedCode, setCopiedCode] = useState(null);

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
    if (selectedMode === 'all') return battles;
    return battles.filter((b) => b.battleMode === selectedMode);
  }, [battles, selectedMode]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!Array.isArray(battles) || battles.length === 0) return null;
    const total = battles.length;
    let totalStars = 0;
    let threeStars = 0;
    let totalDestruction = 0;
    let totalGold = 0;
    let totalElixir = 0;
    let totalDarkElixir = 0;

    battles.forEach((b) => {
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
  }, [battles]);

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
    return (
      <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-6 bg-white dark:bg-neutral-900/40 animate-pulse space-y-4">
        <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-2">
          <div className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && (!battles || battles.length === 0)) {
    return (
      <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-8 bg-white dark:bg-neutral-900/40 text-center">
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

  const visibleBattles = filteredBattles.slice(0, visibleCount);

  return (
    <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-5 sm:p-6 bg-white dark:bg-neutral-900/40">
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Recent Attacks
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
            {filteredBattles.length}
          </span>
        </div>

        {/* Mode filter pills */}
        {modes.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => {
                setSelectedMode('all');
                setVisibleCount(10);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedMode === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              All
            </button>
            {modes.map((mode) => {
              const isSelected = selectedMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setSelectedMode(mode);
                    setVisibleCount(10);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Aggregate Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 mb-5 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
              3-Star Rate
            </div>
            <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {stats.threeStarRate}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
              Avg Destruction
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
            <div className="text-xs font-semibold mt-1 text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-1.5 font-mono">
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

                  <span title={formatFullTime(battle.battleTime)} className="text-[11px]">
                    {formatRelativeTime(battle.battleTime)}
                  </span>
                </div>

                {battle.duration !== undefined && (
                  <span className="font-mono text-[11px] text-neutral-400">
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
                  <span className="text-xs font-mono font-medium ml-1.5 text-neutral-500 dark:text-neutral-400">
                    {stars}/3
                  </span>
                </div>

                {/* Destruction % */}
                <div className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
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
                  <div className="flex items-center gap-3 font-mono text-[11px]">
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
                        <span>Copy Army</span>
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
