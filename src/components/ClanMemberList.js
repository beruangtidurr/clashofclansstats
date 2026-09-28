// src/components/ClanMemberList.js
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TownHallImage from '@/components/TownHallImage';
import LeagueBadge from '@/components/LeagueBadge';

export function formatRole(role) {
  switch (role) {
    case 'leader':
      return 'Leader';
    case 'coLeader':
      return 'Co-Leader';
    case 'admin':
      return 'Elder';
    case 'member':
      return 'Member';
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';
  }
}

export function getRoleBadgeClass(role) {
  switch (role) {
    case 'leader':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold';
    case 'coLeader':
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-semibold';
    case 'admin':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 font-medium';
    case 'member':
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60 font-medium';
  }
}

export default function ClanMemberList({ members = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rank');

  // Counts for role filter pills
  const roleCounts = useMemo(() => {
    const counts = { all: members.length, leaders: 0, elders: 0, members: 0 };
    members.forEach((m) => {
      if (m.role === 'leader' || m.role === 'coLeader') counts.leaders++;
      else if (m.role === 'admin') counts.elders++;
      else counts.members++;
    });
    return counts;
  }, [members]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    if (!members.length) return null;
    const totalTrophies = members.reduce((sum, m) => sum + (m.trophies || 0), 0);
    const totalTownHall = members.reduce((sum, m) => sum + (m.townHallLevel || 0), 0);
    const totalDonations = members.reduce((sum, m) => sum + (m.donations || 0), 0);

    return {
      avgTrophies: Math.round(totalTrophies / members.length),
      avgTownHall: (totalTownHall / members.length).toFixed(1),
      totalDonations,
    };
  }, [members]);

  // Filter & sort members
  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.tag.toLowerCase().includes(q)
      );
    }

    // Filter by role
    if (roleFilter === 'leaders') {
      result = result.filter((m) => m.role === 'leader' || m.role === 'coLeader');
    } else if (roleFilter === 'elders') {
      result = result.filter((m) => m.role === 'admin');
    } else if (roleFilter === 'members') {
      result = result.filter((m) => m.role === 'member');
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return (a.clanRank || 0) - (b.clanRank || 0);
        case 'trophies':
          return (b.trophies || 0) - (a.trophies || 0);
        case 'builderTrophies':
          return (b.builderBaseTrophies || 0) - (a.builderBaseTrophies || 0);
        case 'th':
          return (b.townHallLevel || 0) - (a.townHallLevel || 0);
        case 'donations':
          return (b.donations || 0) - (a.donations || 0);
        case 'exp':
          return (b.expLevel || 0) - (a.expLevel || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return (a.clanRank || 0) - (b.clanRank || 0);
      }
    });

    return result;
  }, [members, searchQuery, roleFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Section Header & Aggregate Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Clan Members
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {filteredAndSortedMembers.length}
            {filteredAndSortedMembers.length !== members.length ? ` / ${members.length}` : ''}
          </span>
        </div>

        {aggregateStats && (
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800">
              Avg 🏆 <strong className="font-mono text-neutral-700 dark:text-neutral-300">{aggregateStats.avgTrophies}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800">
              Avg TH <strong className="font-mono text-neutral-700 dark:text-neutral-300">{aggregateStats.avgTownHall}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hidden sm:inline-block">
              Total Donated <strong className="font-mono text-neutral-700 dark:text-neutral-300">{aggregateStats.totalDonations.toLocaleString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search member name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="sm:w-44 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 cursor-pointer"
          >
            <option value="rank">Sort: Clan Rank</option>
            <option value="trophies">Sort: Trophies</option>
            <option value="builderTrophies">Sort: Builder Trophies</option>
            <option value="th">Sort: Town Hall</option>
            <option value="donations">Sort: Donations</option>
            <option value="exp">Sort: Exp Level</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/80 dark:bg-neutral-800/40 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setRoleFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          All ({roleCounts.all})
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter('leaders')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            roleFilter === 'leaders'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          Leaders ({roleCounts.leaders})
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter('elders')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            roleFilter === 'elders'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          Elders ({roleCounts.elders})
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter('members')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            roleFilter === 'members'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          Members ({roleCounts.members})
        </button>
      </div>

      {/* Member Cards List */}
      {filteredAndSortedMembers.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 text-neutral-500 text-sm">
          No members match the current search or filter.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedMembers.map((member) => {
            const rankDiff =
              member.previousClanRank && member.clanRank
                ? member.previousClanRank - member.clanRank
                : null;

            return (
              <Link
                key={member.tag}
                href={`/?tag=${encodeURIComponent(member.tag)}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900/40 hover:bg-neutral-50/90 dark:hover:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
                title={`View ${member.name}'s profile`}
              >
                {/* Left side: Rank, Rank change, TH, Name, Tag, Role */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank & Change Badge */}
                  <div className="flex flex-col items-center justify-center w-8 shrink-0 text-center">
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      #{member.clanRank}
                    </span>
                    {rankDiff !== null ? (
                      rankDiff > 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center leading-none">
                          ↑{rankDiff}
                        </span>
                      ) : rankDiff < 0 ? (
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center leading-none">
                          ↓{Math.abs(rankDiff)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 leading-none">
                          =
                        </span>
                      )
                    ) : (
                      <span className="text-[9px] font-semibold text-indigo-500 dark:text-indigo-400 leading-none">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Town Hall Image */}
                  <div className="shrink-0">
                    <TownHallImage level={member.townHallLevel} size="xs" />
                  </div>

                  {/* Name, Tag, Role */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {member.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${getRoleBadgeClass(member.role)}`}>
                        {formatRole(member.role)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="font-mono text-[11px]">{member.tag}</span>
                      <span>•</span>
                      <span className="text-[11px]">Lv. {member.expLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Trophies, League, Donations */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-800/80 shrink-0">
                  {/* Donations */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5" title="Donations given">
                      <span>▲</span>
                      <span>{(member.donations || 0).toLocaleString()}</span>
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">/</span>
                    <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-0.5" title="Donations received">
                      <span>▼</span>
                      <span>{(member.donationsReceived || 0).toLocaleString()}</span>
                    </span>
                  </div>

                  {/* League & Trophies */}
                  <div className="flex items-center gap-1.5 min-w-[90px] justify-end">
                    <LeagueBadge
                      leagueTier={member.leagueTier || member.league}
                      showName={false}
                      size="sm"
                    />
                    <div className="flex items-center gap-1 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      <Image
                        src="https://assets.clashk.ing/icons/Icon_HV_Trophy.png"
                        width={16}
                        height={16}
                        alt="Trophy"
                        className="shrink-0"
                      />
                      <span>{(member.trophies || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="text-neutral-300 dark:text-neutral-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all hidden sm:block">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
