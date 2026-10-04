'use client';

import { useEffect, useMemo, useState } from 'react';
import { normalizeTag } from './SavedPlayers';

const TRACKER_KEY = 'coc_base_tracker';
const TRACKER_EVENT = 'coc-base-tracker-updated';

const emptyUpgrade = {
  builder: 'Builder 1',
  target: '',
  village: 'Home',
  finishAt: '',
};

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(TRACKER_EVENT));
}

function getTimestamp() {
  return Date.now();
}

function formatFinishTime(value) {
  if (!value) return 'No finish time';
  const finish = new Date(value);
  if (Number.isNaN(finish.getTime())) return 'Invalid time';

  const diff = finish.getTime() - Date.now();
  if (diff <= 0) return 'Finished';

  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function fromInputDateTime(value) {
  if (!value) return '';
  return new Date(value).toISOString();
}

export default function BaseTracker({ player, onVerifyToken }) {
  const playerTag = normalizeTag(player?.tag);
  const [trackerData, setTrackerData] = useState({});
  const [playerToken, setPlayerToken] = useState('');
  const [rememberToken, setRememberToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [upgradeDraft, setUpgradeDraft] = useState(emptyUpgrade);
  const [baseNotes, setBaseNotes] = useState('');
  const [builderCount, setBuilderCount] = useState(6);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const load = () => setTrackerData(readJson(TRACKER_KEY, {}));
    load();
    window.addEventListener('storage', load);
    window.addEventListener(TRACKER_EVENT, load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener(TRACKER_EVENT, load);
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => setNow(getTimestamp()));
    const timer = setInterval(() => setNow(getTimestamp()), 60000);
    return () => clearInterval(timer);
  }, []);

  const current = playerTag ? trackerData[playerTag] || {} : {};
  const upgrades = useMemo(() => {
    return [...(current.upgrades || [])].sort((a, b) => {
      const aTime = new Date(a.finishAt || 0).getTime();
      const bTime = new Date(b.finishAt || 0).getTime();
      return aTime - bTime;
    });
  }, [current.upgrades]);

  useEffect(() => {
    queueMicrotask(() => {
      setBaseNotes(current.baseNotes || '');
      setBuilderCount(current.builderCount || 6);
      setPlayerToken(current.playerApiToken || '');
      setRememberToken(Boolean(current.playerApiToken));
      setVerifyMessage('');
    });
  }, [playerTag, current.baseNotes, current.builderCount, current.playerApiToken]);

  const saveTracker = (nextCurrent) => {
    if (!playerTag) return;
    const nextData = {
      ...trackerData,
      [playerTag]: {
        ...current,
        ...nextCurrent,
        updatedAt: getTimestamp(),
      },
    };
    setTrackerData(nextData);
    saveJson(TRACKER_KEY, nextData);
  };

  const saveSnapshot = () => {
    saveTracker({
      name: player?.name || '',
      townHallLevel: player?.townHallLevel || null,
      builderHallLevel: player?.builderHallLevel || null,
      trophies: player?.trophies || null,
      builderBaseTrophies: player?.builderBaseTrophies || null,
      baseNotes,
      builderCount,
    });
  };

  const verifyToken = async (event) => {
    event.preventDefault();
    if (!playerTag || !playerToken.trim() || !onVerifyToken) return;

    setVerifying(true);
    setVerifyMessage('');

    const result = await onVerifyToken(playerTag, playerToken);

    if (result?.error) {
      setVerifyMessage(result.error);
    } else if (result?.data?.status === 'ok') {
      saveTracker({
        verified: true,
        verifiedAt: getTimestamp(),
        playerApiToken: rememberToken ? playerToken.trim() : '',
      });
      setVerifyMessage('Verified');
    } else {
      const status = result?.data?.status || 'invalid';
      saveTracker({
        verified: false,
        verifiedAt: getTimestamp(),
        playerApiToken: rememberToken ? playerToken.trim() : '',
      });
      setVerifyMessage(`Token ${status}`);
    }

    setVerifying(false);
  };

  const clearPlayerToken = () => {
    setPlayerToken('');
    setRememberToken(false);
    saveTracker({
      verified: false,
      verifiedAt: null,
      playerApiToken: '',
    });
    setVerifyMessage('');
  };

  const addUpgrade = (event) => {
    event.preventDefault();
    if (!upgradeDraft.target.trim() || !upgradeDraft.finishAt) return;
    const nextUpgrade = {
      id: `${getTimestamp()}`,
      builder: upgradeDraft.builder.trim() || 'Builder',
      target: upgradeDraft.target.trim(),
      village: upgradeDraft.village,
      finishAt: fromInputDateTime(upgradeDraft.finishAt),
      createdAt: getTimestamp(),
    };
    saveTracker({ upgrades: [nextUpgrade, ...(current.upgrades || [])] });
    setUpgradeDraft(emptyUpgrade);
  };

  const removeUpgrade = (id) => {
    saveTracker({ upgrades: (current.upgrades || []).filter((item) => item.id !== id) });
  };

  const finishedCount = upgrades.filter((item) => new Date(item.finishAt).getTime() <= now).length;
  const activeCount = upgrades.length - finishedCount;
  const idleBuilders = Math.max(0, Number(builderCount || 0) - activeCount);
  const nextUpgrade = upgrades.find((item) => new Date(item.finishAt).getTime() > now);

  return (
    <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Base Tracker
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Verify this player, save a base snapshot, and track builder finish order.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center shrink-0">
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wide text-neutral-400">Active</div>
            <div className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{activeCount}</div>
          </div>
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wide text-neutral-400">Idle</div>
            <div className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{idleBuilders}</div>
          </div>
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wide text-neutral-400">Done</div>
            <div className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{finishedCount}</div>
          </div>
        </div>
      </div>

      {player ? (
        <>
          <form onSubmit={verifyToken} className="mb-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                In-game API Token
              </div>
              {current.verified && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Verified
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={playerToken}
                onChange={(event) => setPlayerToken(event.target.value)}
                placeholder="Paste token from Clash settings"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={verifying || !playerToken.trim()}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:disabled:bg-neutral-700 text-white dark:text-neutral-900 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {verifying ? 'Checking...' : 'Verify'}
                </button>
                {(playerToken || current.verified) && (
                  <button
                    type="button"
                    onClick={clearPlayerToken}
                    className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <label className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={rememberToken}
                onChange={(event) => setRememberToken(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-neutral-300"
              />
              <span>Remember token on this browser</span>
            </label>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
              This proves the token belongs to {player.tag}. It does not expose live building timers from the official API.
            </p>
            {verifyMessage && (
              <div className={`mt-2 text-xs font-medium ${
                verifyMessage === 'Verified'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {verifyMessage}
              </div>
            )}
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 p-3">
              <div className="text-[10px] uppercase tracking-wide text-neutral-400">Town Hall</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">TH {player.townHallLevel || '-'}</div>
            </div>
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 p-3">
              <div className="text-[10px] uppercase tracking-wide text-neutral-400">Builder Hall</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">BH {player.builderHallLevel || '-'}</div>
            </div>
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 p-3">
              <div className="text-[10px] uppercase tracking-wide text-neutral-400">Builder Cups</div>
              <div className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{player.builderBaseTrophies || '-'}</div>
            </div>
            <label className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 p-3">
              <span className="block text-[10px] uppercase tracking-wide text-neutral-400">Builders</span>
              <input
                type="number"
                min="1"
                max="10"
                value={builderCount}
                onChange={(event) => setBuilderCount(event.target.value)}
                className="w-full bg-transparent text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </label>
          </div>

          <label className="block mb-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Base Notes
            </span>
            <textarea
              value={baseNotes}
              onChange={(event) => setBaseNotes(event.target.value)}
              rows={3}
              placeholder="Example: walls TH13 mostly done, lab is busy, save gold for eagle..."
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10"
            />
          </label>

          <button
            type="button"
            onClick={saveSnapshot}
            className="mb-5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            Save Base Snapshot
          </button>

          <form onSubmit={addUpgrade} className="border-t border-neutral-200/70 dark:border-neutral-800 pt-5 mb-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Add Builder Upgrade
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={upgradeDraft.builder}
                onChange={(event) => setUpgradeDraft((draft) => ({ ...draft, builder: event.target.value }))}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
              <input
                type="text"
                value={upgradeDraft.target}
                onChange={(event) => setUpgradeDraft((draft) => ({ ...draft, target: event.target.value }))}
                placeholder="Upgrade target"
                className="sm:col-span-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
              />
              <select
                value={upgradeDraft.village}
                onChange={(event) => setUpgradeDraft((draft) => ({ ...draft, village: event.target.value }))}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
              >
                <option>Home</option>
                <option>Builder Base</option>
              </select>
              <input
                type="datetime-local"
                value={upgradeDraft.finishAt}
                onChange={(event) => setUpgradeDraft((draft) => ({ ...draft, finishAt: event.target.value }))}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-2 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Add Upgrade
            </button>
          </form>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Finish Order
              </div>
              {nextUpgrade && (
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Next: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{nextUpgrade.target}</span>
                </div>
              )}
            </div>

            {upgrades.length > 0 ? (
              <div className="space-y-2">
                {upgrades.map((item, index) => {
                  const isFinished = new Date(item.finishAt).getTime() <= now;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-400">#{index + 1}</span>
                          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{item.target}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {item.village}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {item.builder} · {new Date(item.finishAt).toLocaleString()} · {formatFinishTime(item.finishAt)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUpgrade(item.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          isFinished
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {isFinished ? 'Clear' : 'Remove'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 p-4 text-center text-xs text-neutral-400">
                Add active upgrades to see which builder finishes first.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 p-4 text-center text-xs text-neutral-400">
          Search a player to save a base snapshot and track builder timers.
        </div>
      )}
    </section>
  );
}
