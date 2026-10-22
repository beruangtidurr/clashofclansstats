'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'coc_saved_clans';
const STORAGE_EVENT = 'coc-saved-clans-updated';

export function normalizeClanTag(tag) {
  if (!tag) return '';
  const clean = tag.toString().trim().toUpperCase().replace(/^#/, '');
  return clean ? `#${clean}` : '';
}

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') return '[]';
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot() {
  return '[]';
}

export function useSavedClans() {
  const rawData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const savedClans = useMemo(() => {
    try {
      const parsed = JSON.parse(rawData);
      return Array.isArray(parsed)
        ? parsed.map((clan) => ({ ...clan, tag: normalizeClanTag(clan.tag) })).filter((clan) => clan.tag)
        : [];
    } catch {
      return [];
    }
  }, [rawData]);

  const update = useCallback((clans) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clans));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch (error) {
      console.error('Failed to save clans to localStorage:', error);
    }
  }, []);

  const isClanSaved = useCallback((tag) => {
    const normalized = normalizeClanTag(tag);
    return Boolean(normalized && savedClans.some((clan) => clan.tag === normalized));
  }, [savedClans]);

  const toggleSavedClan = useCallback((clan) => {
    const tag = normalizeClanTag(clan?.tag);
    if (!tag) return;
    const current = savedClans.find((item) => item.tag === tag);
    update(current
      ? savedClans.filter((item) => item.tag !== tag)
      : [{ tag, name: clan.name || '', badgeUrls: clan.badgeUrls || null, clanLevel: clan.clanLevel || null, members: clan.members || clan.memberCount || null }, ...savedClans]);
  }, [savedClans, update]);

  const clearSavedClans = useCallback(() => {
    if (window.confirm('Clear all bookmarked clans?')) update([]);
  }, [update]);

  return { savedClans, isClanSaved, toggleSavedClan, clearSavedClans };
}

export default function SavedClans({ savedClans, onClear }) {
  if (!savedClans?.length) return null;

  return (
    <section className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900/70 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Bookmarked Clans</h2>
        <button type="button" onClick={onClear} className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">Clear all</button>
      </div>
      <ul className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
        {savedClans.map((clan) => (
          <li key={clan.tag}>
            <Link href={`/clan/${encodeURIComponent(clan.tag)}`} className="flex min-h-16 items-center gap-3 py-2.5 transition-colors hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30">
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-200/70 dark:bg-neutral-800">
                {clan.badgeUrls?.small ? <img src={clan.badgeUrls.small} alt="" className="h-9 w-9 object-contain" /> : <span className="text-lg text-neutral-400">♜</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">{clan.name || clan.tag}</span>
                <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">{clan.tag}{clan.clanLevel ? ` · Level ${clan.clanLevel}` : ''}</span>
              </span>
              {clan.members != null && <span className="shrink-0 rounded-md bg-neutral-200/70 px-2.5 py-2 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">{clan.members}/50</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
