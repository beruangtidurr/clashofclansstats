'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerData } from '../actions';
import TownHallImage from '@/components/TownHallImage';
import TOWNHALL_MAX_LEVELS from './townhall-max-levels.json';
import ITEM_NAMES from './item-names.json';

const STORAGE_KEY = 'coc-village-tracker-v1';
const IMPORT_KEY = 'coc-village-import-latest-v1';
const ACCOUNTS_KEY = 'coc-village-tracker-accounts-v1';
const CATEGORIES = [
  { id: 'buildings', label: 'Buildings', key: 'buildings', icon: '🏰' },
  { id: 'heroes', label: 'Heroes', key: 'heroes', icon: '👑' },
  { id: 'troops', label: 'Troops', key: 'troops', icon: '⚔️' },
  { id: 'pets', label: 'Pets', key: 'pets', icon: '🐾' },
  { id: 'spells', label: 'Spells', key: 'spells', icon: '✨' },
  { id: 'equipment', label: 'Equipment', key: 'heroEquipment', icon: '🛡️' },
  { id: 'builderBuildings', label: 'Builder Base', key: 'builderBuildings', icon: '🛠️' },
  { id: 'builderTroops', label: 'Builder troops', key: 'builderTroops', icon: '⚔️' },
  { id: 'builderHeroes', label: 'Builder heroes', key: 'builderHeroes', icon: '👑' },
];

function tagKey(tag) {
  return (tag || '').trim().toUpperCase().replace(/^#/, '');
}

function formatTimeLeft(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds <= 0) return 'Complete';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', `${minutes}m`].filter(Boolean).join(' ');
}

function maxLevelAtHall(item, hallLevel, village = 'home') {
  const id = item.dataId;
  const key = `${village}:${id}`;
  const caps = TOWNHALL_MAX_LEVELS[key];
  const limit = village === 'builder' ? 10 : 18;
  const level = Number(hallLevel);
  if (!caps || !level) return Number(item.maxLevel) || 0;
  return caps[Math.max(0, Math.min(limit - 1, level - 1))] || 0;
}

function normalizeItemNames(player) {
  const collections = ['buildings', 'heroes', 'troops', 'pets', 'spells', 'heroEquipment'];
  return {
    ...player,
    ...Object.fromEntries(collections.map((collection) => [
      collection,
      (player[collection] || []).map((item) => {
        const namespace = item.village === 'builderBase' ? 'builder' : 'home';
        const name = ITEM_NAMES[`${namespace}:${item.dataId}`];
        return name ? { ...item, name } : item;
      }),
    ])),
  };
}

function getItems(player) {
  const home = (items) => (items || []).filter((item) => !item.village || item.village === 'home');
  return {
    buildings: home(player?.buildings),
    heroes: home(player?.heroes),
    troops: home(player?.troops),
    pets: home(player?.pets),
    spells: home(player?.spells),
    heroEquipment: player?.heroEquipment || [],
    builderBuildings: (player?.buildings || []).filter((item) => item.village === 'builderBase'),
    builderHeroes: (player?.heroes || []).filter((item) => item.village === 'builderBase'),
    builderTroops: [...(player?.troops || []).filter((item) => item.village === 'builderBase'), ...(player?.troops || []).filter((item) => item.village === 'builderBase' && item.isSiege)],
  };
}

function fromGameExport(data) {
  if (!data || typeof data !== 'object' || !data.tag || !Array.isArray(data.buildings) || !Array.isArray(data.units)) {
    throw new Error('This does not look like a Clash of Clans village export. It needs a tag, buildings, and units.');
  }
  const entries = (list, village = 'home', prefix = 'Item') => (list || []).flatMap((item) => {
    if (!item || !Number.isFinite(Number(item.data))) return [];
    const id = Number(item.data);
    const nameSpace = village === 'builderBase' ? 'builder' : 'home';
    const baseName = ITEM_NAMES[`${nameSpace}:${id}`] || `${prefix} ${id}`;
    const count = Math.max(1, Number(item.cnt) || 1);
    return [{
      name: baseName,
      dataId: id,
      level: Number(item.lvl) || 1,
      count,
      village,
      ...(Number(item.timer) > 0 ? { timer: Number(item.timer), timerEndsAt: ((Number(data.timestamp) || Date.now() / 1000) + Number(item.timer)) * 1000 } : {}),
    }];
  });
  const homeBuildings = [...entries(data.buildings, 'home', 'Building'), ...entries(data.traps, 'home', 'Trap')];
  const builderBuildings = [...entries(data.buildings2, 'builderBase', 'Builder building'), ...entries(data.traps2, 'builderBase', 'Builder trap')];
  return {
    tag: String(data.tag).startsWith('#') ? data.tag : `#${data.tag}`,
    name: 'Imported village', townHallLevel: homeBuildings.find((item) => item.name === 'Town Hall')?.level || 0,
    builderHallLevel: builderBuildings.find((item) => item.dataId === 1000034)?.level || 0,
    trophies: 0, expLevel: 0,
    buildings: [...homeBuildings, ...builderBuildings],
    heroes: [...entries(data.heroes, 'home', 'Hero'), ...entries(data.heroes2, 'builderBase', 'Hero')],
    troops: [...entries(data.units, 'home', 'Troop'), ...entries(data.siege_machines, 'home', 'Siege machine'), ...entries(data.units2, 'builderBase', 'Builder troop')],
    spells: entries(data.spells, 'home', 'Spell'), pets: entries(data.pets, 'home', 'Pet'),
    heroEquipment: entries(data.equipment, 'home', 'Equipment'), _imported: true,
  };
}

function ItemIcon({ item, type }) {
  const slug = item.name.toLowerCase().replace(/\./g, '').trim().replace(/\s+/g, '_');
  let imageUrl = '';
  if (type.toLowerCase().includes('hero')) imageUrl = `https://assets.clashk.ing/heroes/${slug}/icon.webp`;
  else if (type.toLowerCase().includes('troop')) imageUrl = `https://assets.clashk.ing/troops/${slug}/icon.webp`;
  else if (type === 'pets') imageUrl = `https://assets.clashk.ing/pets/${slug}/icon.webp`;
  else if (type === 'spells') imageUrl = `https://assets.clashk.ing/spells/${slug.endsWith('_spell') ? slug : `${slug}_spell`}.webp`;
  else if (type === 'equipment') imageUrl = `https://assets.clashk.ing/equipment/${slug}.webp`;
  else if (type.toLowerCase().includes('building')) imageUrl = `https://assets.clashk.ing/buildings/${item.village === 'builderBase' ? 'builder-base' : 'home-village'}/${slug}/level_${item.level}.webp`;
  return <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-100 text-lg dark:bg-neutral-800"><span className="absolute inset-0 grid place-items-center">{type.toLowerCase().includes('hero') ? '👑' : type === 'spells' ? '✨' : type.toLowerCase().includes('troop') ? '⚔️' : '🏗️'}</span>{imageUrl && <Image src={imageUrl} alt={item.name} fill sizes="44px" className="z-10 object-contain p-1" unoptimized onError={(event) => { event.currentTarget.style.display = 'none'; }} />}</div>;
}

export default function TrackPage() {
  const [tag, setTag] = useState('');
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('buildings');
  const [progress, setProgress] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState('all');
  const [importMessage, setImportMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const [savedAccounts, setSavedAccounts] = useState([]);

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      setProgress({});
    }
    try {
      const storedAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
      const accounts = storedAccounts && typeof storedAccounts === 'object' ? storedAccounts : {};
      setSavedAccounts(Object.values(accounts));
      const storedVillage = JSON.parse(localStorage.getItem(IMPORT_KEY) || 'null');
      if (storedVillage?.tag) {
        const savedVillage = normalizeItemNames(storedVillage);
        localStorage.setItem(IMPORT_KEY, JSON.stringify(savedVillage));
        setPlayer(savedVillage);
        setTag(savedVillage.tag);
        accounts[tagKey(savedVillage.tag)] = savedVillage;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        setSavedAccounts(Object.values(accounts));
        setImportMessage(`Restored saved village ${savedVillage.tag}.`);
      } else if (Object.keys(accounts).length) {
        const activeTag = localStorage.getItem(`${ACCOUNTS_KEY}-active`);
        const active = accounts[activeTag] || Object.values(accounts)[0];
        const savedVillage = normalizeItemNames(active);
        setPlayer(savedVillage);
        setTag(savedVillage.tag);
        setImportMessage(`Restored saved village ${savedVillage.tag}.`);
      }
    } catch {
      localStorage.removeItem(IMPORT_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, hydrated]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const playerProgress = progress[tagKey(player?.tag)] || {};
  const lookup = useCallback(async (event) => {
    event.preventDefault();
    if (!tag.trim()) return;
    setLoading(true);
    setError('');
    setPlayer(null);
    try {
      const result = await getPlayerData(tag.trim());
      if (result.error) setError(result.error);
      else {
        const nextPlayer = normalizeItemNames(result.data);
        setPlayer(nextPlayer);
        const key = tagKey(nextPlayer.tag);
        const nextAccounts = { ...Object.fromEntries(savedAccounts.map((entry) => [tagKey(entry.tag), entry])), [key]: nextPlayer };
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
        localStorage.setItem(`${ACCOUNTS_KEY}-active`, key);
        setSavedAccounts(Object.values(nextAccounts));
      }
    } catch (e) {
      setError(e.message || 'Could not load player. Check the tag and try again.');
    } finally {
      setLoading(false);
    }
  }, [tag, savedAccounts]);

  const switchAccount = (account) => {
    const normalized = normalizeItemNames(account);
    setPlayer(normalized);
    setTag(normalized.tag);
    setCategory('buildings');
    setFilter('all');
    setError('');
    setImportMessage(`Switched to saved village ${normalized.tag}.`);
    localStorage.setItem(`${ACCOUNTS_KEY}-active`, tagKey(normalized.tag));
    if (normalized._imported) localStorage.setItem(IMPORT_KEY, JSON.stringify(normalized));
  };

  const importJson = async () => {
    setError('');
    setImportMessage('');
    try {
      if (!navigator.clipboard?.readText) throw new Error('Clipboard access is unavailable. Allow clipboard access in your browser and try again.');
      const imported = fromGameExport(JSON.parse(await navigator.clipboard.readText()));
      setPlayer(imported);
      setTag(imported.tag);
      localStorage.setItem(IMPORT_KEY, JSON.stringify(imported));
      const key = tagKey(imported.tag);
      const nextAccounts = { ...Object.fromEntries(savedAccounts.map((entry) => [tagKey(entry.tag), entry])), [key]: imported };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
      localStorage.setItem(`${ACCOUNTS_KEY}-active`, key);
      setSavedAccounts(Object.values(nextAccounts));
      setCategory('buildings');
      setFilter('all');
      setImportMessage(`Imported village ${imported.tag}.`);
    } catch (e) {
      setError(e instanceof SyntaxError ? 'Clipboard does not contain valid game export JSON. Copy the export, then try again.' : e.message);
    }
  };

  const itemsByCategory = useMemo(() => getItems(player), [player]);
  const current = CATEGORIES.find((item) => item.id === category);
  const items = itemsByCategory[current?.key] || [];
  const itemMaxLevel = (item, group = category) => {
    const builder = group.startsWith('builder') || item.village === 'builderBase';
    return maxLevelAtHall(item, builder ? player?.builderHallLevel : player?.townHallLevel, builder ? 'builder' : 'home');
  };
  const itemStatus = (group, item) => {
    const cap = itemMaxLevel(item, group);
    if (cap && item.level >= cap) return 'complete';
    return playerProgress[`${group}:${item.name}:${item.level}`]?.status || (item.timerEndsAt > now ? 'upgrading' : 'not-started');
  };
  const filteredItems = items.filter((item) => {
    const status = itemStatus(category, item);
    return filter === 'all' || (filter === 'upgrading' && status === 'upgrading') || (filter === 'todo' && status !== 'complete') || (filter === 'complete' && status === 'complete');
  });
  const completedCount = items.filter((item) => itemStatus(category, item) === 'complete').length;
  const maxedRows = items.flatMap((item) => {
    const maxLevel = itemMaxLevel(item);
    return maxLevel ? [{ item, maxLevel }] : [];
  });
  const maxedCount = maxedRows.reduce((count, row) => count + (row.item.level >= row.maxLevel ? row.item.count || 1 : 0), 0);
  const eligibleCount = maxedRows.reduce((count, row) => count + (row.item.count || 1), 0);
  const levelProgress = maxedRows.reduce((total, row) => total + Math.min(row.item.level || 0, row.maxLevel) * (row.item.count || 1), 0);
  const maxPossibleLevels = maxedRows.reduce((total, row) => total + row.maxLevel * (row.item.count || 1), 0);
  const progressPercent = category === 'buildings'
    ? (eligibleCount ? Math.round(maxedCount / eligibleCount * 100) : 0)
    : (maxPossibleLevels ? Math.round(levelProgress / maxPossibleLevels * 100) : 0);

  const setItemStatus = (item, status) => {
    const key = tagKey(player.tag);
    const itemKey = `${category}:${item.name}:${item.level}`;
    setProgress((old) => ({
      ...old,
      [key]: { ...(old[key] || {}), [itemKey]: { status, updatedAt: Date.now() } },
    }));
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 font-sans antialiased sm:px-6 sm:py-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Village tracker</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Plan upgrades and keep your village progress in one place.</p>
        </div>
        <span className="hidden rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 sm:block">Saved on this device</span>
      </header>

      <form onSubmit={lookup} className="mb-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5">
        <label htmlFor="player-tag" className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">Find your village</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="player-tag" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Player tag, e.g. #2ABC123" className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm uppercase text-neutral-900 outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
          <button disabled={loading || !tag.trim()} className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300">{loading ? 'Loading village…' : 'Load village'}</button>
        </div>
        <p className="mt-2 text-xs text-neutral-400">Progress is stored locally in this browser. Your village levels come from the Clash of Clans player profile.</p>
      </form>
      <section className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Saved accounts</h2><p className="mt-1 text-xs text-neutral-500">Switch between villages saved on this device.</p></div>
          <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">{savedAccounts.length}</span>
        </div>
        {savedAccounts.length ? <div className="flex flex-wrap gap-2">{savedAccounts.map((account) => {
          const active = tagKey(player?.tag) === tagKey(account.tag);
          return <button key={tagKey(account.tag)} type="button" onClick={() => switchAccount(account)} aria-pressed={active} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${active ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'}`}><span className="text-xs font-semibold">{account.name || 'Imported village'}</span><span className={`font-mono text-[10px] ${active ? 'opacity-70' : 'text-neutral-400'}`}>{account.tag}</span></button>;
        })}</div> : <p className="rounded-xl bg-neutral-50 px-3 py-2.5 text-xs text-neutral-400 dark:bg-neutral-950">Your loaded villages will appear here.</p>}
      </section>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div><h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Paste village JSON</h2><p className="mt-1 text-xs text-neutral-500">Copy your game export first. Imported village data is saved in this browser for next time.</p></div>
        <button type="button" onClick={importJson} className="shrink-0 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">Paste from clipboard</button>
      </div>
      {importMessage && <p role="status" className="mb-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">{importMessage}</p>}

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

      {!player && !error && <section className="grid gap-3 sm:grid-cols-3">
        {[
          ['01', 'Load your village', 'Enter a player tag to pull your current home village levels.'],
          ['02', 'Plan your upgrades', 'Mark items as upgrading or filter down to what still needs work.'],
          ['03', 'Track your progress', 'Your status is saved automatically on this device.'],
        ].map(([number, title, description]) => <div key={number} className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40"><span className="text-xs font-mono text-neutral-400">{number}</span><h2 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2><p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</p></div>)}
      </section>}

      {player && <>
        <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3"><TownHallImage level={player.townHallLevel} /><div><h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{player.name}</h2><p className="font-mono text-xs text-neutral-500">{player.tag}{player.clan ? ` · ${player.clan.name}` : ''}</p></div></div>
          <div className="grid grid-cols-3 gap-5 text-center sm:text-right"><div><div className="text-[10px] uppercase tracking-wider text-neutral-400">Town Hall</div><div className="mt-1 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">TH {player.townHallLevel}</div></div><div><div className="text-[10px] uppercase tracking-wider text-neutral-400">Trophies</div><div className="mt-1 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{player.trophies?.toLocaleString()}</div></div><div><div className="text-[10px] uppercase tracking-wider text-neutral-400">Player level</div><div className="mt-1 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{player.expLevel}</div></div></div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Village</p>
            {CATEGORIES.map((item) => {
              const list = itemsByCategory[item.key] || [];
              const done = list.filter((entry) => itemStatus(item.id, entry) === 'complete').length;
              return <button key={item.id} onClick={() => setCategory(item.id)} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${category === item.id ? 'bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/60'}`}><span className="flex items-center gap-2.5"><span>{item.icon}</span>{item.label}</span><span className="font-mono text-[10px] text-neutral-400">{done}/{list.length}</span></button>;
            })}
          </aside>

          <section className="min-w-0 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="border-b border-neutral-100 p-4 dark:border-neutral-800 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{current?.label}</h2><p className="mt-1 text-xs text-neutral-500">{eligibleCount ? `${maxedCount} of ${eligibleCount} maxed for ${category.startsWith('builder') ? `BH ${player?.builderHallLevel}` : `TH ${player?.townHallLevel}`}${category === 'buildings' ? '' : ` · ${progressPercent}% level progress`}` : `${completedCount} of ${items.length} marked complete`}</p></div><div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">{[['all', 'All'], ['todo', 'To do'], ['upgrading', 'Upgrading'], ['complete', 'Done']].map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={`rounded-md px-2 py-1.5 text-[10px] font-medium transition sm:px-2.5 ${filter === id ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-500'}`}>{label}</button>)}</div></div>
              {eligibleCount > 0 ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} /></div> : items.length > 0 && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(completedCount / items.length * 100)}%` }} /></div>}
            </div>

            {items.length === 0 ? <div className="p-10 text-center"><div className="text-2xl">🧭</div><p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">No {current?.label.toLowerCase()} found</p><p className="mt-1 text-xs text-neutral-400">This profile doesn’t include any data for this section.</p></div> : filteredItems.length === 0 ? <div className="p-10 text-center text-sm text-neutral-500">Nothing in this filter yet.</div> : <div className="divide-y divide-neutral-100 dark:divide-neutral-800">{filteredItems.map((item, index) => {
              const status = itemStatus(category, item);
              const statusStyle = status === 'complete' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : status === 'upgrading' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300' : 'border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300';
              const nextStatus = status === 'not-started' ? 'upgrading' : status === 'upgrading' ? 'complete' : 'not-started';
              const label = status === 'not-started' ? 'Not started' : status === 'upgrading' ? 'Upgrading' : 'Complete';
              const townHallCap = itemMaxLevel(item);
              const atTownHallMax = townHallCap > 0 && item.level >= townHallCap;
              return <div key={`${item.name}-${item.level}-${index}`} className="flex items-center gap-3 px-4 py-3 sm:px-5"><ItemIcon item={item} type={category} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.name}{item.count > 1 ? <span className="ml-1.5 text-xs font-medium text-neutral-400">×{item.count}</span> : null}{atTownHallMax ? <span className="ml-2 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Max {category.startsWith('builder') ? `BH ${player?.builderHallLevel}` : `TH ${player?.townHallLevel}`}</span> : null}</div><div className="mt-0.5 text-xs text-neutral-500">Level <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">{item.level ?? '—'}</span>{townHallCap ? <span className="text-neutral-400"> / {townHallCap}</span> : item.maxLevel ? <span className="text-neutral-400"> / {item.maxLevel}</span> : null}{item.timerEndsAt ? <span className={`ml-2 ${item.timerEndsAt > now ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{item.timerEndsAt > now ? `Time left: ${formatTimeLeft(item.timerEndsAt - now)}` : 'Upgrade complete'}</span> : null}</div></div><button onClick={() => setItemStatus(item, nextStatus)} disabled={atTownHallMax} aria-label={`${item.name}: ${label}${atTownHallMax ? ', maxed for current hall' : '; click to change status'}`} className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition hover:opacity-75 disabled:cursor-default disabled:opacity-75 sm:px-3 sm:text-xs ${statusStyle}`}>{status === 'complete' ? '✓ ' : status === 'upgrading' ? '↗ ' : ''}{label}</button></div>;
            })}</div>}
            <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-[10px] text-neutral-400 dark:border-neutral-800 sm:px-5"><span>Levels reflect the latest player profile data.</span><button onClick={() => setProgress((old) => ({ ...old, [tagKey(player.tag)]: {} }))} className="hover:text-neutral-700 dark:hover:text-neutral-200">Reset this village</button></div>
          </section>
        </div>
      </>}
    </main>
  );
}
