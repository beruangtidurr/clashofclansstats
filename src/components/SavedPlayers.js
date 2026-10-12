// src/components/SavedPlayers.js
'use client';

import { useSyncExternalStore, useMemo, useCallback } from 'react';
import TownHallImage from '@/components/TownHallImage';

const STORAGE_KEY = 'coc_saved_players';
const STORAGE_EVENT = 'coc-saved-players-updated';

export function normalizeTag(tag) {
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
    return localStorage.getItem(STORAGE_KEY) || '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot() {
  return '[]';
}

export function useSavedPlayers() {
  const rawData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const savedPlayers = useMemo(() => {
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (typeof item === 'string') {
              return { tag: normalizeTag(item), name: '', savedAt: 0 };
            }
            return {
              ...item,
              tag: normalizeTag(item.tag),
              savedAt: item.savedAt || 0,
            };
          })
          .filter((item) => Boolean(item.tag));
      }
    } catch (e) {
      console.error('Failed to parse saved players:', e);
    }
    return [];
  }, [rawData]);

  const updateSavedPlayers = useCallback((nextList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch (err) {
      console.error('Failed to save players to localStorage:', err);
    }
  }, []);

  const isPlayerSaved = useCallback(
    (checkTag) => {
      const norm = normalizeTag(checkTag);
      if (!norm) return false;
      return savedPlayers.some((p) => normalizeTag(p.tag) === norm);
    },
    [savedPlayers]
  );

  const handleSavePlayer = useCallback(
    (playerData) => {
      if (!playerData || !playerData.tag) return;
      const normTag = normalizeTag(playerData.tag);
      if (!normTag) return;

      const existing = savedPlayers.find((p) => normalizeTag(p.tag) === normTag);
      const newEntry = {
        tag: normTag,
        name: playerData.name || existing?.name || '',
        townHallLevel: playerData.townHallLevel || existing?.townHallLevel || null,
        clanName: playerData.clan?.name || playerData.clanName || existing?.clanName || '',
        clanRole: playerData.role || existing?.clanRole || '',
        trophies: playerData.trophies ?? existing?.trophies ?? null,
        savedAt: Date.now(),
      };

      const remaining = savedPlayers.filter((p) => normalizeTag(p.tag) !== normTag);
      updateSavedPlayers([newEntry, ...remaining]);
    },
    [savedPlayers, updateSavedPlayers]
  );

  const handleRemoveSavedPlayer = useCallback(
    (tagToRemove) => {
      const norm = normalizeTag(tagToRemove);
      if (!norm) return;
      const remaining = savedPlayers.filter((p) => normalizeTag(p.tag) !== norm);
      updateSavedPlayers(remaining);
    },
    [savedPlayers, updateSavedPlayers]
  );

  const handleToggleSavePlayer = useCallback(
    (playerData) => {
      if (!playerData || !playerData.tag) return;
      if (isPlayerSaved(playerData.tag)) {
        handleRemoveSavedPlayer(playerData.tag);
      } else {
        handleSavePlayer(playerData);
      }
    },
    [isPlayerSaved, handleRemoveSavedPlayer, handleSavePlayer]
  );

  const handleClearAllSaved = useCallback(() => {
    if (typeof window !== 'undefined' && window.confirm('Clear all saved players?')) {
      updateSavedPlayers([]);
    }
  }, [updateSavedPlayers]);

  const enrichSavedPlayer = useCallback(
    (playerData) => {
      if (!playerData || !playerData.tag) return;
      const normTag = normalizeTag(playerData.tag);
      const existing = savedPlayers.find((p) => normalizeTag(p.tag) === normTag);
      if (!existing) return;

      if (
        existing.name !== (playerData.name || '') ||
        existing.townHallLevel !== (playerData.townHallLevel || null) ||
        existing.clanName !== (playerData.clan?.name || '') ||
        existing.clanRole !== (playerData.role || '') ||
        existing.trophies !== (playerData.trophies ?? null)
      ) {
        const updated = savedPlayers.map((item) => {
          if (normalizeTag(item.tag) === normTag) {
            return {
              ...item,
              name: playerData.name || item.name,
              townHallLevel: playerData.townHallLevel || item.townHallLevel,
              clanName: playerData.clan?.name || item.clanName,
              clanRole: playerData.role || item.clanRole,
              trophies: playerData.trophies ?? item.trophies,
            };
          }
          return item;
        });
        updateSavedPlayers(updated);
      }
    },
    [savedPlayers, updateSavedPlayers]
  );

  return {
    savedPlayers,
    isPlayerSaved,
    handleSavePlayer,
    handleRemoveSavedPlayer,
    handleToggleSavePlayer,
    handleClearAllSaved,
    enrichSavedPlayer,
  };
}

export function StarIcon({ filled = false, className = 'w-4 h-4' }) {
  if (filled) {
    return (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

export default function SavedPlayers({
  savedPlayers = [],
  currentTag = '',
  onSelectPlayer,
  onRemovePlayer,
  onClearAll,
}) {
  if (!savedPlayers || savedPlayers.length === 0) {
    return null;
  }

  const normalizedCurrent = normalizeTag(currentTag);

  return (
    <div className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900/70 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between px-0.5">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Bookmarked Players
        </span>
        {savedPlayers.length > 1 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
        {savedPlayers.map((item) => {
          const itemTag = normalizeTag(item.tag);
          const isSelected = normalizedCurrent && normalizedCurrent === itemTag;
          const role = item.clanRole === 'coLeader' ? 'Co-Leader' : item.clanRole ? `${item.clanRole[0].toUpperCase()}${item.clanRole.slice(1)}` : '';

          return (
            <div
              key={item.tag}
              className={`group flex min-h-[72px] items-center gap-3 py-3 transition-colors ${isSelected ? 'bg-neutral-100/80 dark:bg-neutral-800/50' : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30'}`}
            >
              <button
                type="button"
                onClick={() => onSelectPlayer && onSelectPlayer(item.tag)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left cursor-pointer"
                title={`View stats for ${item.name || item.tag}`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-200/70 dark:bg-neutral-800">
                  {item.townHallLevel ? <TownHallImage level={item.townHallLevel} size="sm" /> : <span className="text-lg text-neutral-400">♟</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">{item.name || item.tag}</span>
                  {item.clanName ? <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">⚔️ {item.clanName}{role ? <><span className="px-1">|</span>{role}</> : null}</span> : <span className="mt-0.5 block truncate font-mono text-[10px] text-neutral-400">{item.tag}</span>}
                </span>
              </button>

              <span className="flex min-w-[70px] shrink-0 items-center justify-between gap-2 rounded-md bg-neutral-200/70 px-2.5 py-2 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200" title="Trophies">
                <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 3h3v3a5 5 0 0 1-4.3 4.95A6 6 0 0 1 13 14.9V18h4v3H7v-3h4v-3.1a6 6 0 0 1-3.7-3.95A5 5 0 0 1 3 6V3h3V1h12v2ZM6 5H5v1a3 3 0 0 0 2.1 2.86A8 8 0 0 1 6 5Zm13 0a8 8 0 0 1-1.1 3.86A3 3 0 0 0 20 6V5h-1Z" /></svg>
                {item.trophies ?? '—'}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer && onRemovePlayer(item.tag);
                }}
                aria-label={`Remove ${item.name || item.tag} from saved`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-base text-neutral-400 opacity-50 transition hover:bg-neutral-200 hover:text-neutral-800 focus:opacity-100 group-hover:opacity-100 sm:opacity-0 dark:hover:bg-neutral-700 dark:hover:text-white"
                title="Remove from saved"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
