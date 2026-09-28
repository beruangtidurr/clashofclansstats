// src/components/ClanInfoCard.js
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ClanInfoCard({ clan }) {
  const [copied, setCopied] = useState(false);

  if (!clan) return null;

  const handleCopyTag = () => {
    if (!clan.tag) return;
    navigator.clipboard.writeText(clan.tag).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const badgeUrl =
    clan.badgeUrls?.large ||
    clan.badgeUrls?.medium ||
    clan.badgeUrls?.small;

  const formatType = (type) => {
    switch (type) {
      case 'open':
        return { label: 'Anyone Can Join', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'inviteOnly':
        return { label: 'Invite Only', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'closed':
        return { label: 'Closed', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      default:
        return { label: type || 'Unknown', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' };
    }
  };

  const typeConfig = formatType(clan.type);

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-5 sm:p-6 mb-6 shadow-xs">
      {/* Top Section: Badge, Info, Tags */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {badgeUrl ? (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 filter drop-shadow-sm">
              <Image
                src={badgeUrl}
                alt={clan.name || 'Clan Badge'}
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-xl shrink-0">
              🛡️
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {clan.name}
              </h2>
              <span className="text-xs px-2 py-0.5 font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
                Level {clan.clanLevel}
              </span>
            </div>

            {/* Tag + Copy & Type Badge */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <button
                type="button"
                onClick={handleCopyTag}
                className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Click to copy clan tag"
              >
                <span>{clan.tag}</span>
                {copied ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                    Copied!
                  </span>
                ) : (
                  <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <span className={`text-[11px] px-2 py-0.5 font-medium rounded-full border ${typeConfig.color}`}>
                {typeConfig.label}
              </span>

              {clan.location?.name && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <span>📍</span>
                  <span>{clan.location.name}</span>
                </span>
              )}

              {clan.chatLanguage?.name && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <span>💬</span>
                  <span>{clan.chatLanguage.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Home Village Trophies Counter */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-800">
          <div className="text-xs text-neutral-400 font-medium">
            Clan Points
          </div>
          <div className="flex items-center gap-1.5 font-mono text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
            <Image
              src="https://assets.clashk.ing/icons/Icon_HV_Trophy.png"
              width={22}
              height={22}
              alt="Trophy"
              className="shrink-0"
            />
            <span>{clan.clanPoints?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Clan Description */}
      {clan.description && (
        <div className="mt-4 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-800/60 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
          {clan.description}
        </div>
      )}

      {/* Clan Labels */}
      {clan.labels && clan.labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          {clan.labels.map((lbl) => (
            <div
              key={lbl.id || lbl.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              {lbl.iconUrls?.small && (
                <div className="relative w-3.5 h-3.5 shrink-0">
                  <Image
                    src={lbl.iconUrls.small}
                    alt={lbl.name}
                    fill
                    sizes="14px"
                    className="object-contain"
                  />
                </div>
              )}
              <span>{lbl.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800/60 mt-4 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
            Members
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {clan.members} / 50
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
            War League
          </div>
          <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1 truncate px-1">
            {clan.warLeague?.name || 'Unranked'}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
            War Record
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {clan.warWins}W
            {clan.warLosses !== undefined ? ` - ${clan.warLosses}L` : ''}
          </div>
          {clan.warWinStreak > 0 && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              🔥 {clan.warWinStreak} streak
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
            Required TH
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            TH {clan.requiredTownhallLevel || 1}+
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-between">
          <span>Builder Base:</span>
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
            {clan.clanBuilderBasePoints?.toLocaleString() || 0} 🏆
          </span>
        </div>

        <div className="p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-between">
          <span>Capital League:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate ml-1">
            {clan.capitalLeague?.name || 'Unranked'}
          </span>
        </div>

        {clan.clanCapital?.capitalHallLevel ? (
          <div className="p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-between">
            <span>Capital Hall:</span>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              Lv. {clan.clanCapital.capitalHallLevel}
            </span>
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-between">
            <span>War Frequency:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
              {clan.warFrequency || 'Unknown'}
            </span>
          </div>
        )}

        <div className="p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-between">
          <span>Req. Trophies:</span>
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
            {clan.requiredTrophies?.toLocaleString() || 0} 🏆
          </span>
        </div>
      </div>
    </div>
  );
}
