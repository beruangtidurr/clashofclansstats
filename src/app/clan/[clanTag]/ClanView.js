// src/app/clan/[clanTag]/ClanView.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClanInfoCard from '@/components/ClanInfoCard';
import ClanMemberList from '@/components/ClanMemberList';
import { getClanData, getClanMembers } from '@/app/actions';

export default function ClanView({
  clanTag,
  initialClan,
  initialClanError,
  initialMembers = [],
  initialMembersError,
}) {
  const router = useRouter();
  const [clan, setClan] = useState(initialClan);
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState(initialClanError || (initialClan ? null : 'Failed to load clan'));
  const [membersError, setMembersError] = useState(initialMembersError);
  const [searchTag, setSearchTag] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const cleanDisplayTag = clan?.tag || (clanTag ? decodeURIComponent(clanTag).trim() : '');

  const handleRefresh = async () => {
    if (!clanTag) return;
    setRefreshing(true);
    setError(null);
    setMembersError(null);

    try {
      const [clanResult, membersResult] = await Promise.all([
        getClanData(clanTag),
        getClanMembers(clanTag),
      ]);

      if (clanResult.error) {
        setError(clanResult.error);
      } else {
        setClan(clanResult.data);
      }

      if (membersResult.error) {
        if (clanResult.data?.memberList?.length) {
          setMembers(clanResult.data.memberList);
        } else {
          setMembersError(membersResult.error);
        }
      } else {
        setMembers(
          membersResult.data?.length > 0
            ? membersResult.data
            : clanResult.data?.memberList || []
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh clan information');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchClan = (e) => {
    e.preventDefault();
    const clean = searchTag.trim().toUpperCase().replace(/^#/, '');
    if (!clean) return;
    router.push(`/clan/${encodeURIComponent(`#${clean}`)}`);
  };

  return (
    <main className="max-w-2xl w-full mx-auto py-8 sm:py-10 px-4 sm:px-6 font-sans antialiased">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors py-1 px-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Player Search</span>
        </Link>

        {clan && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors py-1 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
            title="Refresh clan data"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Clan Details & Members
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
          {cleanDisplayTag}
        </p>
      </div>

      {/* Quick Clan Search Form */}
      <form onSubmit={handleSearchClan} className="mb-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 focus-within:border-neutral-400 dark:focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-neutral-900/5 dark:focus-within:ring-neutral-100/5 transition-all">
          <div className="pl-2.5 text-neutral-400 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search another clan tag (e.g. #2J8Q9YCGV)"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            className="w-full bg-transparent px-1 py-1 text-sm font-mono uppercase text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-sans focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            Go
          </button>
        </div>
      </form>

      {/* Error state */}
      {error ? (
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
          <div className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">
            Failed to Load Clan
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
            {error}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Clan Overview Details */}
          {clan && <ClanInfoCard clan={clan} />}

          {/* Members Error Notice (if clan loaded but members endpoint failed) */}
          {membersError && (
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs font-medium mb-4">
              {membersError}
            </div>
          )}

          {/* Clan Members List */}
          <ClanMemberList members={members} />
        </>
      )}
    </main>
  );
}
