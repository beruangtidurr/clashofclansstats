'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerData } from '../actions';
import TownHallImage from '@/components/TownHallImage';
import TOWNHALL_MAX_LEVELS from './townhall-max-levels.json';

const STORAGE_KEY = 'coc-village-tracker-v1';
const IMPORT_KEY = 'coc-village-import-latest-v1';
const ITEM_NAMES = {
  1000000: 'Army Camp', 1000001: 'Town Hall', 1000002: 'Elixir Collector', 1000003: 'Elixir Storage', 1000004: 'Gold Mine', 1000005: 'Gold Storage', 1000006: 'Barracks', 1000007: 'Laboratory', 1000008: 'Cannon', 1000009: 'Archer Tower', 1000010: 'Wall', 1000011: 'Wizard Tower', 1000012: 'Air Defense', 1000013: 'Mortar', 1000014: 'Clan Castle', 1000015: 'Builder Hut', 1000019: 'Hidden Tesla', 1000020: 'Spell Factory', 1000021: 'X-Bow', 1000023: 'Dark Elixir Drill', 1000024: 'Dark Elixir Storage', 1000026: 'Dark Barracks', 1000027: 'Inferno Tower', 1000028: 'Air Sweeper', 1000029: 'Dark Spell Factory', 1000031: 'Eagle Artillery', 1000032: 'Bomb Tower', 1000059: 'Workshop', 1000067: 'Scattershot', 1000068: 'Pet House', 1000070: 'Blacksmith', 1000071: 'Hero Hall', 1000072: 'Spell Tower', 1000077: 'Monolith', 1000093: 'Helper Hut',
  12000000: 'Bomb', 12000001: 'Spring Trap', 12000002: 'Air Bomb', 12000005: 'Giant Bomb', 12000006: 'Seeking Air Mine', 12000008: 'Skeleton Trap', 12000010: 'Push Trap', 12000011: 'Mine', 12000013: 'Mega Mine', 12000014: 'Guard Post Trap', 12000016: 'Tornado Trap',
  28000000: 'Barbarian King', 28000001: 'Archer Queen', 28000002: 'Minion Prince', 28000003: 'Battle Machine', 28000004: 'Royal Champion', 28000005: 'Battle Copter', 28000006: 'Grand Warden', 28000007: 'Dragon Duke',
  4000000: 'Barbarian', 4000001: 'Archer', 4000002: 'Giant', 4000003: 'Goblin', 4000004: 'Wall Breaker', 4000005: 'Balloon', 4000006: 'Wizard', 4000007: 'Healer', 4000008: 'Dragon', 4000009: 'P.E.K.K.A', 4000010: 'Baby Dragon', 4000011: 'Hog Rider', 4000012: 'Valkyrie', 4000013: 'Golem', 4000015: 'Witch', 4000017: 'Lava Hound', 4000022: 'Bowler', 4000023: 'Minion', 4000024: 'Miner', 4000051: 'Wall Wrecker', 4000052: 'Battle Blimp', 4000053: 'Yeti', 4000058: 'Ice Golem', 4000059: 'Electro Dragon', 4000062: 'Stone Slammer', 4000065: 'Dragon Rider', 4000075: 'Siege Barracks', 4000082: 'Headhunter', 4000087: 'Log Launcher', 4000091: 'Flame Flinger', 4000092: 'Battle Drill', 4000095: 'Electro Titan', 4000097: 'Apprentice Warden', 4000110: 'Root Rider', 4000123: 'Druid',
  26000000: 'Lightning Spell', 26000001: 'Healing Spell', 26000002: 'Rage Spell', 26000003: 'Jump Spell', 26000005: 'Freeze Spell', 26000009: 'Poison Spell', 26000010: 'Earthquake Spell', 26000011: 'Haste Spell', 26000016: 'Clone Spell', 26000017: 'Skeleton Spell', 26000028: 'Bat Spell', 26000035: 'Invisibility Spell', 26000053: 'Recall Spell', 26000070: 'Overgrowth Spell',
  73000000: 'L.A.S.S.I', 73000001: 'Electro Owl', 73000002: 'Mighty Yak', 73000003: 'Unicorn', 73000007: 'Frosty', 73000008: 'Diggy', 73000009: 'Poison Lizard',
  90000000: 'Barbarian Puppet', 90000001: 'Rage Vial', 90000002: 'Earthquake Boots', 90000003: 'Vampstache', 90000004: 'Giant Gauntlet', 90000005: 'Spiky Ball', 90000006: 'Archer Puppet', 90000007: 'Invisibility Vial', 90000008: 'Giant Arrow', 90000009: 'Healer Puppet', 90000010: 'Eternal Tome', 90000011: 'Life Gem', 90000012: 'Rage Gem', 90000013: 'Healing Tome', 90000014: 'Fireball', 90000015: 'Royal Gem', 90000016: 'Seeking Shield', 90000017: 'Haste Vial', 90000018: 'Hog Rider Puppet',
};
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
  const id = item.dataId || Object.keys(ITEM_NAMES).find((key) => ITEM_NAMES[key] === item.name);
  const key = `${village}:${id}`;
  const caps = TOWNHALL_MAX_LEVELS[key];
  const limit = village === 'builder' ? 10 : 18;
  const level = Number(hallLevel);
  if (!caps || !level) return Number(item.maxLevel) || 0;
  return caps[Math.max(0, Math.min(limit - 1, level - 1))] || 0;
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
    const baseName = ITEM_NAMES[id] || `${prefix} ${id}`;
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

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      setProgress({});
    }
    try {
      const savedVillage = JSON.parse(localStorage.getItem(IMPORT_KEY) || 'null');
      if (savedVillage?.tag) {
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
      else setPlayer(result.data);
    } catch (e) {
      setError(e.message || 'Could not load player. Check the tag and try again.');
    } finally {
      setLoading(false);
    }
  }, [tag]);

  const importJson = async () => {
    setError('');
    setImportMessage('');
    try {
      if (!navigator.clipboard?.readText) throw new Error('Clipboard access is unavailable. Allow clipboard access in your browser and try again.');
      const imported = fromGameExport(JSON.parse(await navigator.clipboard.readText()));
      setPlayer(imported);
      setTag(imported.tag);
      localStorage.setItem(IMPORT_KEY, JSON.stringify(imported));
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
          <Link href="/" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">← Clash of Stats</Link>
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
