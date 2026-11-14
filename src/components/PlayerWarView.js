'use client';

import Image from 'next/image';
import TownHallImage from '@/components/TownHallImage';
import { useState } from 'react';

function percent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function formatWarTime(value) {
  if (!value || value.length < 15) return '';
  const [, year, month, day, hour, minute] = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/) || [];
  if (!year) return '';
  return `${year}-${month}-${day} ${hour}:${minute} UTC`;
}

function WarTeamBadge({ team, level }) {
  const badge = team?.badgeUrls?.medium || team?.badgeUrls?.small;
  return (
    <div className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
      {badge ? <Image src={badge} alt={`${team.name} badge`} width={76} height={76} className="object-contain drop-shadow-lg" /> : <span className="text-4xl">🛡️</span>}
      {level != null && <span className="sr-only">Clan level {level}</span>}
    </div>
  );
}

function StarCount({ members }) {
  return (members || []).reduce((total, member) => total + (member.attacks || []).reduce((sum, attack) => sum + (Number(attack.stars) || 0), 0), 0);
}

function Destruction({ members }) {
  const attacks = (members || []).flatMap((member) => member.attacks || []);
  // The war's destruction is the sum of each defender's best hit, not the
  // average of attacks (multiple attacks can target the same base).
  const bestByDefender = new Map();
  for (const attack of attacks) {
    const target = String(attack.defenderTag || attack.defenderTownhallLevel || attack.order || 'unknown');
    const destruction = Number(attack.destructionPercentage) || 0;
    bestByDefender.set(target, Math.max(bestByDefender.get(target) || 0, destruction));
  }
  return [...bestByDefender.values()].reduce((total, destruction) => total + destruction, 0);
}

function TeamRows({ title, clan, members, opposingMembers = [], warSize, playerTag }) {
  const ordered = [...(members || [])].sort((a, b) => (a.mapPosition || 999) - (b.mapPosition || 999));
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3><span>{ordered.length}/{warSize || ordered.length} players</span>
      </div>
      <div className="divide-y divide-[#303438]">
        {ordered.map((member) => {
          const attack = (member.attacks || []).reduce((best, current) => !best || current.stars > best.stars || (current.stars === best.stars && current.destructionPercentage > best.destructionPercentage) ? current : best, null);
          const isPlayer = member.tag?.toUpperCase() === playerTag?.toUpperCase();
          return (
            <div key={member.tag} className={`grid min-h-[100px] grid-cols-[minmax(0,1fr)_minmax(120px,auto)] items-center gap-3 px-2 py-4 sm:min-h-[112px] sm:px-3 ${isPlayer ? 'bg-amber-500/10' : ''}`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-sm text-neutral-400">{member.mapPosition || '—'}.</span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-neutral-100"><TownHallImage level={member.townHallLevel || member.townhallLevel} size="sm" /><span className="truncate">{member.name}</span>{isPlayer && <span className="shrink-0 text-xs text-amber-400">You</span>}</div>
                  <div className="mt-2 text-sm leading-none tracking-wide text-amber-400">{'★'.repeat(attack?.stars || 0)}<span className="text-neutral-500">{'★'.repeat(3 - (attack?.stars || 0))}</span></div>
                </div>
              </div>
              <div className="space-y-2 text-xs leading-tight text-neutral-400 dark:text-neutral-400">
                {[0, 1].map((attackIndex) => {
                  const entry = (member.attacks || []).find((item) => item.order === attackIndex + 1) || (attackIndex === 0 ? attack : null);
                  const defender = entry && (members || []).concat(opposingMembers).find((candidate) => String(candidate.tag || '').toUpperCase().replace(/^%23|^#/, '') === String(entry.defenderTag || '').toUpperCase().replace(/^%23|^#/, ''));
                  return <div key={attackIndex} className="flex items-center justify-between gap-1.5"><span className="shrink-0">⚔ Attack {attackIndex + 1}</span><span className="min-w-0 truncate text-right text-neutral-100">{entry ? <>{defender ? `${defender.mapPosition}. ${defender.name} · ` : ''}<span className="text-amber-400">{'★'.repeat(entry.stars || 0)}<span className="text-neutral-600">{'★'.repeat(3 - (entry.stars || 0))}</span></span><span className="ml-1 text-neutral-300">{Number(entry.destructionPercentage || 0).toFixed(0)}%</span></> : 'Not used'}</span></div>;
                })}
              </div>
            </div>
          );
        })}
        {!ordered.length && <p className="py-4 text-center text-xs text-neutral-400">No team details available.</p>}
      </div>
    </section>
  );
}

export default function PlayerWarView({ war, playerTag, loading, error, onRefresh }) {
  const [mobileSection, setMobileSection] = useState('stats');
  if (loading && !war) return <div className="rounded-xl border border-neutral-200 p-8 text-center text-sm text-neutral-500 dark:border-neutral-800">Loading current war…</div>;
  if (error && !war) return <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center text-sm text-red-600 dark:text-red-400">{error}</div>;
  if (!war || !['preparation', 'inWar'].includes(war.state)) return null;

  const clan = war.clan || {};
  const opponent = war.opponent || {};
  const clanMembers = clan.members || [];
  const enemyMembers = opponent.members || [];
  const clanAttacks = clanMembers.flatMap((member) => member.attacks || []);
  const enemyAttacks = enemyMembers.flatMap((member) => member.attacks || []);
  const attackLimit = Number(war.attacksPerMember || 1) * (war.teamSize || clanMembers.length || 0);
  const status = war.state === 'preparation' ? 'Preparation Day' : 'Battle Day';
  const endTime = war.state === 'preparation' ? war.startTime : war.endTime;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-[#191C1F] dark:border-[#303438]">
      <div className="relative flex min-h-48 items-center justify-between gap-3 bg-cover bg-center px-4 py-8 sm:min-h-56 sm:px-8" style={{ backgroundImage: "linear-gradient(90deg,rgba(25,28,31,.82),rgba(25,28,31,.56),rgba(25,28,31,.82)),url('/clan-war-background.png')" }}>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center sm:flex-row sm:gap-4 sm:text-left"><WarTeamBadge team={clan} level={clan.clanLevel} /><span className="truncate text-sm font-extrabold text-white drop-shadow sm:text-2xl">{clan.name}</span></div>
        <div className="shrink-0 text-center text-white"><h2 className="text-lg font-medium sm:text-2xl">{status}</h2><p className="mt-1 text-[10px] text-white/80 sm:text-xs">{endTime ? formatWarTime(endTime) : `${war.teamSize} vs ${war.teamSize}`}</p></div>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center sm:flex-row-reverse sm:gap-4 sm:text-right"><WarTeamBadge team={opponent} level={opponent.clanLevel} /><span className="truncate text-sm font-extrabold text-white drop-shadow sm:text-2xl">{opponent.name}</span></div>
      </div>
      <div className="flex justify-end border-b border-[#303438] bg-[#191C1F] px-4 py-2">
        <button onClick={onRefresh} disabled={!onRefresh || loading} className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-white disabled:cursor-default disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">{loading ? 'Refreshing…' : 'Refresh war'}</button>
        {error && <span className="ml-3 self-center text-xs text-red-500">{error}</span>}
      </div>
      <nav aria-label="War sections" className="flex gap-5 overflow-x-auto border-b border-[#303438] px-4 sm:hidden">
        {[
          ['stats', 'Stats'],
          ['events', 'Events'],
          ['my-team', 'My Team'],
          ['enemy-team', 'Enemy Team'],
        ].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMobileSection(id)} className={`relative shrink-0 py-3 text-sm font-medium transition-colors ${mobileSection === id ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}>
            {label}
            {mobileSection === id && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-400" />}
          </button>
        ))}
      </nav>
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(180px,220px)_minmax(0,1fr)] gap-5 p-5 sm:grid">
        <TeamRows title="Attacks" clan={clan} members={clanMembers} opposingMembers={enemyMembers} warSize={war.teamSize} playerTag={playerTag} />
        <aside className="mt-7 h-fit rounded-xl border border-[#303438] bg-[#191C1F] px-3 py-3 text-center">
          {[
          { label: 'Stars', left: StarCount(clanMembers), right: StarCount(enemyMembers), icon: '★' },
          { label: 'Total destruction', left: percent(Destruction(clanMembers)), right: percent(Destruction(enemyMembers)), icon: '%' },
          { label: 'Attacks used', left: `${clanAttacks.length}/${attackLimit}`, right: `${enemyAttacks.length}/${attackLimit}`, icon: '⚔' },
          ].map((stat) => <div key={stat.label} className="border-b border-[#303438] py-3 last:border-0"><p className="mb-2 text-xs text-neutral-400">{stat.label}</p><div className="flex items-center justify-center gap-3 text-sm font-semibold text-white"><span>{stat.left}</span><span className="text-base text-amber-400">{stat.icon}</span><span>{stat.right}</span></div></div>)}
        </aside>
        <TeamRows title="Attacks" clan={opponent} members={enemyMembers} opposingMembers={clanMembers} warSize={war.teamSize} />
      </div>
      <div className="p-4 sm:hidden">
        {mobileSection === 'stats' && (
          <aside className="mx-auto max-w-sm rounded-xl border border-[#303438] bg-[#191C1F] px-4 py-3 text-center">
            {[
              { label: 'Stars', left: StarCount(clanMembers), right: StarCount(enemyMembers), icon: '★' },
              { label: 'Total destruction', left: percent(Destruction(clanMembers)), right: percent(Destruction(enemyMembers)), icon: '%' },
              { label: 'Attacks used', left: `${clanAttacks.length}/${attackLimit}`, right: `${enemyAttacks.length}/${attackLimit}`, icon: '⚔' },
            ].map((stat) => <div key={stat.label} className="border-b border-[#303438] py-5 last:border-0"><p className="mb-2 text-sm text-neutral-400">{stat.label}</p><div className="flex items-center justify-center gap-5 text-lg font-semibold text-white"><span>{stat.left}</span><span className="text-xl text-amber-400">{stat.icon}</span><span>{stat.right}</span></div></div>)}
          </aside>
        )}
        {mobileSection === 'events' && <p className="py-8 text-center text-sm text-neutral-400">No war events available.</p>}
        {mobileSection === 'my-team' && <TeamRows title="My Team · Attacks" clan={clan} members={clanMembers} opposingMembers={enemyMembers} warSize={war.teamSize} playerTag={playerTag} />}
        {mobileSection === 'enemy-team' && <TeamRows title="Enemy Team · Attacks" clan={opponent} members={enemyMembers} opposingMembers={clanMembers} warSize={war.teamSize} />}
      </div>
    </div>
  );
}
