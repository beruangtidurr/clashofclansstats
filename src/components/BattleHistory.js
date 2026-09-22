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

function SwordsIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <div className="mt-6 border border-gray-300 dark:border-neutral-700 p-6 rounded-lg bg-white dark:bg-neutral-900 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="h-16 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-20 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (error && (!battles || battles.length === 0)) {
    return (
      <div className="mt-6 border border-gray-300 dark:border-neutral-700 p-5 rounded-lg bg-white dark:bg-neutral-900 shadow-sm text-sm text-gray-500 dark:text-neutral-400 text-center">
        Unable to load battle history: {error}
      </div>
    );
  }

  if (!battles || battles.length === 0) {
    return (
      <div className="mt-6 border border-gray-300 dark:border-neutral-700 p-6 rounded-lg bg-white dark:bg-neutral-900 shadow-sm text-center">
        <h3 className="text-base font-semibold mb-1">Battle History</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          No recorded battle history found for this player.
        </p>
      </div>
    );
  }

  const visibleBattles = filteredBattles.slice(0, visibleCount);

  return (
    <div className="mt-6 border border-gray-300 dark:border-neutral-700 p-6 rounded-lg shadow-sm bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <SwordsIcon />
          <h3 className="text-lg font-bold">Battle History</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
            {filteredBattles.length} attacks
          </span>
        </div>

        {/* Mode filter pills */}
        {modes.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => {
                setSelectedMode('all');
                setVisibleCount(10);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              All ({battles.length})
            </button>
            {modes.map((mode) => {
              const count = battles.filter((b) => b.battleMode === mode).length;
              const isSelected = selectedMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setSelectedMode(mode);
                    setVisibleCount(10);
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {mode} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Aggregate Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-800 mb-5 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">3-Star Rate</div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400">
              {stats.threeStarRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Avg Destruction</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              {stats.avgDestruction}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Avg Stars</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              {stats.avgStars} ★
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Loot (G / E / DE)</div>
            <div className="text-xs font-semibold mt-0.5 text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5">
              <span className="text-amber-600 dark:text-amber-400">{formatCompact(stats.totalGold)}</span>
              <span>/</span>
              <span className="text-pink-600 dark:text-pink-400">{formatCompact(stats.totalElixir)}</span>
              <span>/</span>
              <span className="text-indigo-500 dark:text-indigo-400">{formatCompact(stats.totalDarkElixir)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Battle Cards List */}
      <div className="space-y-3">
        {visibleBattles.map((battle, index) => {
          const stars = battle.stars ?? 0;
          const destruction = battle.destructionPercentage ?? 0;
          const isThreeStar = stars === 3;
          const isCopied = copiedCode === battle.shareCode;

          // Mode styling
          const isLegend = battle.battleMode === 'legend';
          const isFarming = battle.battleMode === 'farming';

          return (
            <div
              key={`${battle.battleTime}-${index}`}
              className="p-3.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors"
            >
              {/* Top row: Mode badge, timestamp, duration */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[11px] uppercase tracking-wider ${
                      isLegend
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                        : isFarming
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {battle.battleMode || 'Attack'}
                  </span>

                  <span title={formatFullTime(battle.battleTime)}>
                    {formatRelativeTime(battle.battleTime)}
                  </span>
                </div>

                {battle.duration !== undefined && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(battle.duration)}
                  </span>
                )}
              </div>

              {/* Middle row: Stars, Destruction %, Progress bar */}
              <div className="flex items-center justify-between gap-4 my-2">
                {/* Visual Stars */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((starIdx) => {
                    const earned = starIdx < stars;
                    return (
                      <svg
                        key={starIdx}
                        className={`w-6 h-6 ${
                          earned
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_1px_2px_rgba(245,158,11,0.5)]'
                            : 'text-gray-300 dark:text-neutral-700 fill-gray-200 dark:fill-neutral-800'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  })}
                  <span className="text-xs font-semibold ml-1 text-neutral-600 dark:text-neutral-400">
                    {stars}/3
                  </span>
                </div>

                {/* Destruction % */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span
                      className={`text-lg font-black ${
                        isThreeStar
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : destruction >= 50
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {destruction}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Destruction Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    isThreeStar
                      ? 'bg-emerald-500'
                      : destruction >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, destruction))}%` }}
                />
              </div>

              {/* Bottom row: Looted Resources & Copy Army Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800/80 text-xs">
                {/* Loot */}
                {battle.lootedResources ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400" title={`Gold: ${formatNumber(battle.lootedResources.gold)}`}>
                      <GoldIcon />
                      <span>{formatNumber(battle.lootedResources.gold)}</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium text-pink-700 dark:text-pink-400" title={`Elixir: ${formatNumber(battle.lootedResources.elixir)}`}>
                      <ElixirIcon />
                      <span>{formatNumber(battle.lootedResources.elixir)}</span>
                    </div>

                    {battle.lootedResources.darkElixir > 0 && (
                      <div className="flex items-center gap-1 font-medium text-indigo-700 dark:text-indigo-400" title={`Dark Elixir: ${formatNumber(battle.lootedResources.darkElixir)}`}>
                        <DarkElixirIcon />
                        <span>{formatNumber(battle.lootedResources.darkElixir)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">No loot data</span>
                )}

                {/* Army Copy / Link */}
                {battle.shareCode && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleCopyArmy(battle.shareCode)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                      title="Copy Clash of Clans Army Link to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy Army</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://link.clashofclans.com/en?action=CopyArmy&army=${battle.shareCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                      title="Open Army in Clash of Clans"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less Pagination */}
      {filteredBattles.length > 10 && (
        <div className="mt-4 flex items-center justify-center gap-3 pt-2">
          {visibleCount < filteredBattles.length ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredBattles.length))}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-sm font-medium transition-colors cursor-pointer"
            >
              Show More ({filteredBattles.length - visibleCount} remaining)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisibleCount(10)}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-sm font-medium transition-colors cursor-pointer"
            >
              Show Less
            </button>
          )}

          {visibleCount < filteredBattles.length && (
            <button
              type="button"
              onClick={() => setVisibleCount(filteredBattles.length)}
              className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Show All ({filteredBattles.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
