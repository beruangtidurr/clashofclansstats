'use client';

import Link from 'next/link';
import LeagueBadge from './LeagueBadge';

function trophyCount(value) {
  return new Intl.NumberFormat().format(Number(value) || 0);
}

export default function PlayerLeaderboard({ players = [], group, leagueTier, loading, error, currentPlayerTag }) {
  if (loading) {
    return <div className="animate-pulse space-y-3 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-900/60">
      {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-12 rounded-lg bg-neutral-200 dark:bg-neutral-800" />)}
    </div>;
  }

  if (!players.length) {
    return <div className="rounded-2xl border border-neutral-200/70 bg-white p-6 text-center text-sm text-neutral-500 dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:text-neutral-400">
      {error || 'No current Ranked group leaderboard is available for this player.'}
    </div>;
  }

  const rankedPlayers = [...players].sort((a, b) => {
    const aRank = Number(a.placement ?? a.rank ?? a.position);
    const bRank = Number(b.placement ?? b.rank ?? b.position);
    if (Number.isFinite(aRank) && Number.isFinite(bRank)) return aRank - bRank;
    return Number(b.leagueTrophies ?? b.trophies ?? 0) - Number(a.leagueTrophies ?? a.trophies ?? 0);
  });
  const groupLeague = group?.league?.name || group?.league?.localizedName || group?.leagueName;

  return <section className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-900/40">
    <header className="border-b border-neutral-200/70 px-4 py-4 dark:border-neutral-800/70">
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Player Leaderboard</h3>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{groupLeague ? `${groupLeague} · ` : ''}Current Ranked tournament standings</p>
    </header>
    <ol className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
      {rankedPlayers.map((player, index) => {
        const playerTag = player.playerTag || player.tag || player.player?.tag;
        const playerName = player.playerName || player.name || player.player?.name || 'Unknown player';
        const trophies = player.leagueTrophies ?? player.league_trophies ?? player.trophies ?? player.trophyCount;
        const league = player.league || player.leagueTier || leagueTier;
        const position = player.placement ?? player.rank ?? player.position ?? index + 1;
        const attackCount = player.attackCount ?? player.attacks ?? player.attack_count ?? player.attacksUsed
          ?? (player.attackWinCount != null || player.attackLoseCount != null
            ? Number(player.attackWinCount || 0) + Number(player.attackLoseCount || 0)
            : player.attackWins != null || player.attackLosses != null
              ? Number(player.attackWins || 0) + Number(player.attackLosses || 0)
              : null);
        const defenseCount = player.defenseCount ?? player.defenses ?? player.defense_count ?? player.defensesUsed
          ?? (player.defenseWinCount != null || player.defenseLoseCount != null
            ? Number(player.defenseWinCount || 0) + Number(player.defenseLoseCount || 0)
            : player.defenseWins != null || player.defenseLosses != null
              ? Number(player.defenseWins || 0) + Number(player.defenseLosses || 0)
              : null);
        const isCurrent = String(playerTag || '').replace(/^#/, '').toUpperCase() === String(currentPlayerTag || '').replace(/^#/, '').toUpperCase();
        return <li key={playerTag || playerName} className={`flex items-center gap-3 px-4 py-3 ${isCurrent ? 'bg-amber-400/10' : ''}`}>
          <span className={`w-7 shrink-0 text-center text-sm font-bold ${index < 3 ? 'text-amber-500' : 'text-neutral-400'}`}>{position}</span>
          <LeagueBadge leagueTier={league} showName={false} size="sm" />
          <div className="min-w-0 flex-1">
            <Link href={`/?tag=${encodeURIComponent(playerTag || '')}`} className="block truncate text-sm font-semibold text-neutral-900 hover:underline dark:text-neutral-100">{playerName}</Link>
            <div className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{player.clanName || player.clan?.name || playerTag}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-sm font-semibold tabular-nums text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <span aria-hidden="true" className="text-amber-400">🏆</span>{trophyCount(trophies)}
            </div>
            {(attackCount != null || defenseCount != null) && <div className="mt-1 flex justify-end gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
              {attackCount != null && <span>Attacks {attackCount}</span>}
              {defenseCount != null && <span>Defenses {defenseCount}</span>}
            </div>}
          </div>
        </li>;
      })}
    </ol>
  </section>;
}
