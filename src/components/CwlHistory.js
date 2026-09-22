// src/components/CwlHistory.js
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

function formatSeason(seasonStr) {
  if (!seasonStr) return '';
  const parts = seasonStr.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const date = new Date(Date.UTC(year, month, 1));
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return seasonStr;
}

function formatDuration(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function TrophyIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 text-amber-500 fill-amber-400" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H8v2h8v-2h-3v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export default function CwlHistory({ cwl, loading, error }) {
  // Initialize with the most recent season expanded
  const [expandedSeasons, setExpandedSeasons] = useState({ 0: true });

  const toggleSeason = (index) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Career stats across all seasons
  const careerStats = useMemo(() => {
    if (!Array.isArray(cwl) || cwl.length === 0) return null;

    let totalAttacks = 0;
    let totalMissed = 0;
    let totalStars = 0;
    let threeStars = 0;
    let totalDestruction = 0;

    cwl.forEach((season) => {
      totalMissed += season.missedAttacks ?? 0;
      (season.attacks || []).forEach((att) => {
        totalAttacks += 1;
        totalStars += att.stars ?? 0;
        if (att.stars === 3) threeStars += 1;
        totalDestruction += att.destructionPercentage ?? 0;
      });
    });

    return {
      seasonsCount: cwl.length,
      totalAttacks,
      totalMissed,
      totalStars,
      threeStarRate: totalAttacks > 0 ? Math.round((threeStars / totalAttacks) * 100) : 0,
      avgDestruction: totalAttacks > 0 ? Math.round(totalDestruction / totalAttacks) : 0,
    };
  }, [cwl]);

  if (loading) {
    return (
      <div className="mt-4 border border-gray-300 dark:border-neutral-700 p-6 rounded-lg bg-white dark:bg-neutral-900 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="h-16 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-28 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-28 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (error && (!cwl || cwl.length === 0)) {
    return (
      <div className="mt-4 border border-gray-300 dark:border-neutral-700 p-5 rounded-lg bg-white dark:bg-neutral-900 shadow-sm text-sm text-gray-500 dark:text-neutral-400 text-center">
        Unable to load CWL history: {error}
      </div>
    );
  }

  if (!cwl || cwl.length === 0) {
    return (
      <div className="mt-4 border border-gray-300 dark:border-neutral-700 p-6 rounded-lg bg-white dark:bg-neutral-900 shadow-sm text-center">
        <h3 className="text-base font-semibold mb-1">CWL History</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          No Clan War Leagues history recorded for this player.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-gray-300 dark:border-neutral-700 p-6 rounded-lg shadow-sm bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrophyIcon />
          <h3 className="text-lg font-bold">Clan War Leagues History</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            {cwl.length} {cwl.length === 1 ? 'Season' : 'Seasons'}
          </span>
        </div>
      </div>

      {/* Overall Career Stats Bar */}
      {careerStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 mb-5 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Total Stars</div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400">
              {careerStats.totalStars} ★
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">3-Star Rate</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              {careerStats.threeStarRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Avg Destruction</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              {careerStats.avgDestruction}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Attacks / Missed</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              {careerStats.totalAttacks}
              {careerStats.totalMissed > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 text-xs ml-1">
                  ({careerStats.totalMissed} missed)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs ml-1 font-normal">
                  (0 missed)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seasons List */}
      <div className="space-y-4">
        {cwl.map((season, index) => {
          const isExpanded = !!expandedSeasons[index];
          const attacks = [...(season.attacks || [])].sort((a, b) => (a.round || 0) - (b.round || 0));

          // Season totals
          const seasonStars = attacks.reduce((sum, a) => sum + (a.stars ?? 0), 0);
          const maxStars = attacks.length * 3;
          const seasonAvgDestruction = attacks.length > 0
            ? Math.round(attacks.reduce((sum, a) => sum + (a.destructionPercentage ?? 0), 0) / attacks.length)
            : 0;

          return (
            <div
              key={`${season.season}-${index}`}
              className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              {/* Season Top Header Clickable */}
              <div
                onClick={() => toggleSeason(index)}
                className="p-4 bg-gray-50/70 dark:bg-neutral-800/40 hover:bg-gray-100/70 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {/* Clan Badge */}
                  {season.clan?.badgeUrls?.small && (
                    <div className="relative w-9 h-9 shrink-0">
                      <Image
                        src={season.clan.badgeUrls.small}
                        alt={season.clan.name || 'Clan Badge'}
                        fill
                        sizes="36px"
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                        {formatSeason(season.season)}
                      </h4>
                      {season.townHallLevel && (
                        <span className="text-[10px] px-1.5 py-0.5 font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                          TH{season.townHallLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {season.clan?.name || 'Clan'}
                      </span>
                      {season.clan?.warLeague?.name && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {season.clan.warLeague.name}
                          </span>
                        </>
                      )}
                      {season.clan?.wars && (
                        <>
                          <span>•</span>
                          <span>
                            {season.clan.wars.won}W-{season.clan.wars.lost}L{season.clan.wars.tied > 0 ? `-${season.clan.wars.tied}T` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Season Performance Badges & Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-sm text-amber-600 dark:text-amber-400">
                      <span>{seasonStars}</span>
                      <span className="text-gray-400 text-xs">/{maxStars} ★</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                      {attacks.length} {attacks.length === 1 ? 'round' : 'rounds'} ({seasonAvgDestruction}%)
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400"
                    aria-label={isExpanded ? 'Collapse season details' : 'Expand season details'}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Rounds Details */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-neutral-800 space-y-2.5">
                  {/* Clan Rank / Placement Badges */}
                  <div className="flex flex-wrap items-center gap-2 pb-2 text-xs">
                    {season.placement?.clan && (
                      <span className="px-2 py-0.5 rounded font-medium bg-gray-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        Player Clan Rank: #{season.placement.clan}
                      </span>
                    )}
                    {season.clan?.placement?.group && (
                      <span className="px-2 py-0.5 rounded font-medium bg-gray-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        Clan Group Rank: #{season.clan.placement.group}
                      </span>
                    )}
                    {season.missedAttacks > 0 && (
                      <span className="px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {season.missedAttacks} Missed Attack{season.missedAttacks > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {attacks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No individual round attacks recorded for this season.</p>
                  ) : (
                    attacks.map((attack) => {
                      const stars = attack.stars ?? 0;
                      const destruction = attack.destructionPercentage ?? 0;
                      const isThreeStar = stars === 3;

                      return (
                        <div
                          key={attack.round || attack.warTag}
                          className="p-3 rounded-lg border border-gray-100 dark:border-neutral-800/80 bg-gray-50/50 dark:bg-neutral-850"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                            {/* Round & Opponent Clan */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                Round {attack.round}
                              </span>
                              {attack.opponent?.name && (
                                <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                  <span>vs</span>
                                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {attack.opponent.name}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Attack Duration */}
                            {attack.duration !== undefined && (
                              <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                                <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDuration(attack.duration)}
                              </span>
                            )}
                          </div>

                          {/* Attack Outcome & Target Defender */}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            {/* Defender Info */}
                            {attack.defender ? (
                              <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                                <ShieldIcon />
                                <span className="font-medium">{attack.defender.name}</span>
                                {attack.defender.mapPosition && (
                                  <span className="text-gray-400 font-mono text-[11px]">
                                    (#{attack.defender.mapPosition})
                                  </span>
                                )}
                                {attack.defender.townHallLevel && (
                                  <span className="text-[10px] px-1 font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    TH{attack.defender.townHallLevel}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Target unknown</span>
                            )}

                            {/* Stars & Destruction % */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-0.5">
                                {[0, 1, 2].map((starIdx) => {
                                  const earned = starIdx < stars;
                                  return (
                                    <svg
                                      key={starIdx}
                                      className={`w-4 h-4 ${
                                        earned
                                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_1px_1px_rgba(245,158,11,0.5)]'
                                          : 'text-gray-300 dark:text-neutral-700 fill-gray-200 dark:fill-neutral-800'
                                      }`}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                  );
                                })}
                              </div>

                              <span
                                className={`text-sm font-bold ${
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
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
