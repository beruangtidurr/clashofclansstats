// src/components/SavedPlayers.js
'use client';

import { useSyncExternalStore, useMemo, useCallback } from 'react';

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
        existing.clanName !== (playerData.clan?.name || '')
      ) {
        const updated = savedPlayers.map((item) => {
          if (normalizeTag(item.tag) === normTag) {
            return {
              ...item,
              name: playerData.name || item.name,
              townHallLevel: playerData.townHallLevel || item.townHallLevel,
              clanName: playerData.clan?.name || item.clanName,
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
    <div className="mb-6 p-3 bg-gray-50/80 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
          <StarIcon filled className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          Saved Players ({savedPlayers.length})
        </span>
        {savedPlayers.length > 1 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-gray-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {savedPlayers.map((item) => {
          const itemTag = normalizeTag(item.tag);
          const isSelected = normalizedCurrent && normalizedCurrent === itemTag;

          return (
            <div
              key={item.tag}
              className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-md text-xs border transition-all ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950/50 dark:border-blue-600 dark:text-blue-200 ring-1 ring-blue-400/30'
                  : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 hover:border-gray-400 dark:hover:border-neutral-600'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectPlayer && onSelectPlayer(item.tag)}
                className="flex items-center gap-1.5 font-medium cursor-pointer text-left hover:underline"
                title={`View stats for ${item.name || item.tag}`}
              >
                {item.name ? (
                  <>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-neutral-400">
                      {item.tag}
                    </span>
                  </>
                ) : (
                  <span className="font-mono">{item.tag}</span>
                )}

                {item.townHallLevel && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    TH{item.townHallLevel}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer && onRemovePlayer(item.tag);
                }}
                aria-label={`Remove ${item.name || item.tag} from saved`}
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:hover:text-red-400 rounded transition-colors cursor-pointer text-sm leading-none"
                title="Remove from saved"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
