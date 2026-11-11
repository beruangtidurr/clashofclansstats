'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import EquipmentIcon from '@/components/EquipmentIcon';
import { normalizeTag, useSavedPlayers } from '@/components/SavedPlayers';
import { getPlayerData } from '../actions';

const EQUIPMENT = [
  ['Barbarian Puppet', 'Barbarian King', 'Common'], ['Rage Vial', 'Barbarian King', 'Common'], ['Earthquake Boots', 'Barbarian King', 'Common'], ['Giant Gauntlet', 'Barbarian King', 'Epic'], ['Spiky Ball', 'Barbarian King', 'Epic'], ['Snake Bracelet', 'Barbarian King', 'Epic'], ['Stick Horse', 'Barbarian King', 'Epic'], ['Vampstache', 'Barbarian King', 'Common'],
  ['Archer Puppet', 'Archer Queen', 'Common'], ['Invisibility Vial', 'Archer Queen', 'Common'], ['Giant Arrow', 'Archer Queen', 'Common'], ['Healer Puppet', 'Archer Queen', 'Common'], ['Frozen Arrow', 'Archer Queen', 'Epic'], ['Magic Mirror', 'Archer Queen', 'Epic'], ['Action Figure', 'Archer Queen', 'Epic'], ['Monolith Arrow', 'Archer Queen', 'Epic'],
  ['Eternal Tome', 'Grand Warden', 'Common'], ['Life Gem', 'Grand Warden', 'Common'], ['Rage Gem', 'Grand Warden', 'Common'], ['Healing Tome', 'Grand Warden', 'Common'], ['Fireball', 'Grand Warden', 'Epic'], ['Heroic Torch', 'Grand Warden', 'Epic'], ['Lavaloon Puppet', 'Grand Warden', 'Epic'],
  ['Seeking Shield', 'Royal Champion', 'Common'], ['Royal Gem', 'Royal Champion', 'Common'], ['Hog Rider Puppet', 'Royal Champion', 'Common'], ['Haste Vial', 'Royal Champion', 'Common'], ['Rocket Spear', 'Royal Champion', 'Epic'], ['Electro Boots', 'Royal Champion', 'Epic'], ['Frost Flake', 'Royal Champion', 'Epic'],
  ['Henchmen Puppet', 'Minion Prince', 'Common'], ['Dark Orb', 'Minion Prince', 'Common'], ['Metal Pants', 'Minion Prince', 'Common'], ['Noble Iron', 'Minion Prince', 'Common'], ['Dark Crown', 'Minion Prince', 'Epic'], ['Meteor Staff', 'Minion Prince', 'Epic'], ['Portal Pendant', 'Minion Prince', 'Epic'],
  ['Fire Heart', 'Dragon Duke', 'Common'], ['Stun Blaster', 'Dragon Duke', 'Common'], ['Flame Blower', 'Dragon Duke', 'Common'], ['Electro Fangs', 'Dragon Duke', 'Common'], ['Rocket Backpack', 'Dragon Duke', 'Epic'], ['Revenge Deck', 'Dragon Duke', 'Epic'],
].map(([name, hero, rarity]) => ({ name, hero, rarity, max: rarity === 'Epic' ? 27 : 18 }));

// Cost of each level, indexed by the level being reached. These game costs are
// identical for every piece of the same rarity.
const SHINY = [0, 0, 120, 240, 400, 600, 840, 1120, 1440, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600];
const GLOWY = [0, 0, 0, 20, 0, 0, 100, 0, 0, 200, 0, 0, 400, 0, 0, 600, 0, 0, 600, 0, 0, 600, 0, 0, 600, 0, 0, 600];
const STARRY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 20, 0, 0, 30, 0, 0, 50, 0, 0, 100, 0, 0, 120, 0, 0, 150];
const ORES = [
  { id: 'shiny', name: 'Shiny Ore', color: 'text-cyan-600 dark:text-cyan-300', dot: 'bg-cyan-400' },
  { id: 'glowy', name: 'Glowy Ore', color: 'text-purple-600 dark:text-purple-300', dot: 'bg-purple-400' },
  { id: 'starry', name: 'Starry Ore', color: 'text-amber-600 dark:text-amber-300', dot: 'bg-amber-400' },
];
const STORAGE_KEY = 'coc-equipment-ore-plan-v1';
const PLAYER_TAG_KEY = 'coc-equipment-player-tag-v1';
const INITIAL = { plan: [], levels: {}, ore: { shiny: 0, glowy: 0, starry: 0 } };
const numberFormat = new Intl.NumberFormat();

function normalizeEquipmentName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function costBetween(item, current, target) {
  const totals = { shiny: 0, glowy: 0, starry: 0 };
  for (let level = current + 1; level <= target; level += 1) {
    totals.shiny += SHINY[level] || 0;
    totals.glowy += GLOWY[level] || 0;
    if (item.rarity === 'Epic') totals.starry += STARRY[level] || 0;
  }
  return totals;
}

function readSavedPlan() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || !Array.isArray(saved.plan)) return INITIAL;
    const plan = saved.plan.filter((row) => EQUIPMENT.some((item) => item.name === row.name));
    const levels = Object.fromEntries(Object.entries(saved.levels || {}).flatMap(([name, level]) => {
      const item = EQUIPMENT.find((candidate) => candidate.name === name);
      return item ? [[name, Math.min(item.max, Math.max(1, Number(level) || 1))]] : [];
    }));
    plan.forEach((row) => {
      if (!levels[row.name]) levels[row.name] = Math.min(EQUIPMENT.find((item) => item.name === row.name).max, Math.max(1, Number(row.current) || 1));
    });
    return {
      plan: plan.map((row) => ({
        name: row.name,
        current: Math.min(27, Math.max(1, Number(row.current) || 1)),
        target: Math.min(27, Math.max(1, Number(row.target) || 1)),
      })),
      levels,
      ore: Object.fromEntries(ORES.map(({ id }) => [id, Math.max(0, Number(saved.ore?.[id]) || 0)])),
    };
  } catch {
    return INITIAL;
  }
}

function OreInput({ ore, value, onChange, compact = false }) {
  return <label className="block"><span className={`mb-1.5 block font-medium ${compact ? 'text-[11px]' : 'text-xs'} ${ore.color}`}>{ore.name}</span><input inputMode="numeric" type="number" min="0" step="1" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className={`w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-500 ${compact ? 'h-10' : 'h-11'}`} /></label>;
}

function CustomDropdown({ value, options, onChange, placeholder, ariaLabel, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return <div ref={rootRef} className={`relative ${className}`}><button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((current) => !current)} className="flex h-full min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-left text-sm text-neutral-800 outline-none transition hover:bg-neutral-50 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus:border-neutral-500 dark:focus:ring-neutral-100/5"><span className="min-w-0 truncate">{selected?.label || placeholder || ''}</span><svg className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg></button>{open && <div role="listbox" aria-label={ariaLabel} className="absolute right-0 top-full z-40 mt-1.5 max-h-64 w-full min-w-max overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl shadow-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/30">{options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} disabled={option.disabled} onClick={() => { if (!option.disabled) { onChange(option.value); setOpen(false); } }} className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-35 ${option.value === value ? 'bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/70'}`}><span>{option.label}</span>{option.value === value && <span aria-hidden="true">✓</span>}</button>)}</div>}</div>;
}

export default function EquipmentPage() {
  const [saved, setSaved] = useState(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const [heroFilter, setHeroFilter] = useState('All heroes');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [playerTag, setPlayerTag] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const playerRequestId = useRef(0);
  const { savedPlayers } = useSavedPlayers();

  useEffect(() => {
    setSaved(readSavedPlan());
    setPlayerTag(window.localStorage.getItem(PLAYER_TAG_KEY) || '');
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [loaded, saved]);

  const filteredEquipment = useMemo(() => EQUIPMENT.filter((item) => (heroFilter === 'All heroes' || item.hero === heroFilter) && item.name.toLowerCase().includes(search.trim().toLowerCase())), [heroFilter, search]);
  const planWithCosts = useMemo(() => saved.plan.map((row) => {
    const item = EQUIPMENT.find((candidate) => candidate.name === row.name);
    const current = Math.min(item.max, Math.max(1, Number(row.current) || 1));
    const target = Math.min(item.max, Math.max(current, Number(row.target) || current));
    return { ...row, current, target, item, cost: costBetween(item, current, target) };
  }), [saved.plan]);
  const totals = useMemo(() => planWithCosts.reduce((sum, row) => ({
    shiny: sum.shiny + row.cost.shiny,
    glowy: sum.glowy + row.cost.glowy,
    starry: sum.starry + row.cost.starry,
  }), { shiny: 0, glowy: 0, starry: 0 }), [planWithCosts]);
  const totalItems = saved.plan.length;
  const selectedBookmarkedPlayer = savedPlayers.find((player) => normalizeTag(player.tag) === normalizeTag(playerTag));

  const addItem = (item) => setSaved((value) => value.plan.some((row) => row.name === item.name) ? value : ({ ...value, plan: [...value.plan, { name: item.name, current: value.levels?.[item.name] || 1, target: item.max }] }));
  const updateItem = (name, field, rawValue) => setSaved((value) => {
    const plan = value.plan.map((row) => {
    if (row.name !== name) return row;
    const item = EQUIPMENT.find((candidate) => candidate.name === name);
    const nextValue = Math.min(item.max, Math.max(1, Number(rawValue) || 1));
    const updated = { ...row, [field]: nextValue };
    if (field === 'current') updated.target = Math.max(nextValue, Number(row.target) || nextValue);
    else updated.target = Math.max(Number(row.current) || 1, nextValue);
    return updated;
    });
    const currentRow = plan.find((row) => row.name === name);
    return { ...value, plan, levels: currentRow ? { ...value.levels, [name]: currentRow.current } : value.levels };
  });
  const removeItem = (name) => setSaved((value) => ({ ...value, plan: value.plan.filter((row) => row.name !== name) }));
  const clearPlan = () => setSaved((value) => ({ ...value, plan: [] }));

  const loadPlayerProfile = async (event) => {
    event.preventDefault();
    const requestedTag = playerTag.trim();
    if (!requestedTag) return;
    const requestId = ++playerRequestId.current;
    setPlayerLoading(true);
    setPlayerError('');
    setProfileMessage('');
    try {
      const result = await getPlayerData(requestedTag);
      if (requestId !== playerRequestId.current) return;
      if (result?.error) throw new Error(result.error);
      const player = result?.data;
      if (!player) throw new Error('Player profile was not returned. Check the tag and try again.');
      const profileItems = Array.isArray(player.heroEquipment) ? player.heroEquipment : [];
      const profileLevels = new Map(profileItems
        .filter((item) => item?.name && Number(item.level) > 0)
        .map((item) => [normalizeEquipmentName(item.name), Number(item.level)]));
      const matchingItems = EQUIPMENT.filter((item) => profileLevels.has(normalizeEquipmentName(item.name)));
      if (!matchingItems.length) throw new Error('No recognized hero equipment was found on this profile.');

      setSaved((value) => {
        const existing = new Map(value.plan.map((row) => [row.name, row]));
        const levels = {};
        matchingItems.forEach((item) => {
          levels[item.name] = Math.min(item.max, Math.max(1, profileLevels.get(normalizeEquipmentName(item.name))));
        });
        return {
          ...value,
          levels,
          plan: matchingItems.map((item) => {
            const current = levels[item.name];
            const row = existing.get(item.name);
            return { name: item.name, current, target: Math.max(current, Math.min(item.max, Number(row?.target) || item.max)) };
          }),
        };
      });
      setPlayerTag(player.tag || requestedTag);
      setPlayerName(player.name || 'Player profile');
      window.localStorage.setItem(PLAYER_TAG_KEY, player.tag || requestedTag);
      setProfileMessage(`Loaded ${matchingItems.length} equipment pieces from ${player.name || player.tag || requestedTag}.`);
    } catch (error) {
      if (requestId === playerRequestId.current) setPlayerError(error.message || 'Could not load this player profile.');
    } finally {
      if (requestId === playerRequestId.current) setPlayerLoading(false);
    }
  };

  const copyPlanLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('plan', btoa(unescape(encodeURIComponent(JSON.stringify(saved)))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', ''));
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get('plan');
    if (!encoded) return;
    try {
      const standard = encoded.replaceAll('-', '+').replaceAll('_', '/');
      const imported = JSON.parse(decodeURIComponent(escape(atob(standard))));
      if (Array.isArray(imported.plan)) setSaved(readPlanFromData(imported));
    } catch {
      // An invalid or out-of-date link simply leaves the local plan in place.
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 font-sans antialiased sm:px-6 sm:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Clash of Clans</p><h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Equipment & ore calculator</h1><p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Plan your hero equipment upgrades and see the ore bill.</p></div>
        <span className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-800">Common · max 18 &nbsp; Epic · max 27</span>
      </header>

      <section className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5" aria-labelledby="load-profile-heading">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="load-profile-heading" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Load from player profile</h2><p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Enter a player tag to fill in current equipment levels from their profile.</p></div>{playerName && <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{playerName} {playerTag && `· ${playerTag}`}</span>}</div>
        <form onSubmit={loadPlayerProfile} className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="equipment-player-tag">Player tag</label><input id="equipment-player-tag" type="text" autoCapitalize="characters" placeholder="Enter player tag (e.g. #2ABC)" value={playerTag} onChange={(event) => setPlayerTag(event.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none placeholder:normal-case focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />{savedPlayers.length > 0 && <CustomDropdown value={selectedBookmarkedPlayer?.tag || ''} placeholder="Bookmarked players…" ariaLabel="Choose a bookmarked player" className="sm:w-56" options={savedPlayers.map((player) => ({ value: player.tag, label: player.name ? `${player.name} · ${player.tag}` : player.tag }))} onChange={setPlayerTag} />}<button type="submit" disabled={playerLoading || !playerTag.trim()} className="h-11 shrink-0 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">{playerLoading ? 'Loading profile…' : 'Load equipment'}</button></form>
        {playerError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{playerError}</p>}
        {profileMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{profileMessage}</p>}
      </section>

      <section className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5" aria-labelledby="equipment-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="equipment-list-heading" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Choose equipment</h2><p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Add pieces to your plan to calculate their upgrade cost.</p></div><span className="text-xs text-neutral-400">{filteredEquipment.length} pieces</span></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]"><label className="sr-only" htmlFor="equipment-search">Search equipment</label><input id="equipment-search" type="search" placeholder="Search equipment" value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" /><CustomDropdown value={heroFilter} ariaLabel="Filter by hero" options={['All heroes', 'Barbarian King', 'Archer Queen', 'Grand Warden', 'Royal Champion', 'Minion Prince', 'Dragon Duke'].map((hero) => ({ value: hero, label: hero }))} onChange={setHeroFilter} /></div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => {
            const added = saved.plan.some((row) => row.name === item.name);
            return <button key={item.name} type="button" onClick={() => addItem(item)} aria-pressed={added} className={`flex min-w-0 items-center gap-3 rounded-xl border p-2.5 text-left transition ${added ? 'border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/70' : 'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/40'}`}><EquipmentIcon name={item.name} level={added ? saved.plan.find((row) => row.name === item.name)?.current : saved.levels?.[item.name] || 1} maxLevel={item.max} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">{item.name}</span><span className="mt-0.5 block truncate text-[10px] text-neutral-500 dark:text-neutral-400">{item.hero} · {item.rarity} · max {item.max}</span></span><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm ${added ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300'}`}>{added ? '✓' : '+'}</span></button>;
          })}
          {!filteredEquipment.length && <p className="col-span-full py-6 text-center text-sm text-neutral-500">No equipment matches this search.</p>}
        </div>
        <p className="mt-3 text-[10px] text-neutral-400">Equipment images provided by <a href="https://github.com/ClashKingInc/ClashKingAssets" target="_blank" rel="noreferrer" className="underline underline-offset-2">ClashKing Assets</a>.</p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50" aria-labelledby="plan-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-4 dark:border-neutral-800 sm:px-5"><div><h2 id="plan-heading" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Upgrade plan</h2><p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{totalItems} {totalItems === 1 ? 'piece' : 'pieces'} selected</p></div>{totalItems > 0 && <button type="button" onClick={clearPlan} className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">Clear plan</button>}</div>
          {planWithCosts.length ? <div className="divide-y divide-neutral-100 dark:divide-neutral-800">{planWithCosts.map(({ name, current, target, item, cost }) => <article key={name} className="flex flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3.5 sm:px-5"><EquipmentIcon name={name} level={current} maxLevel={item.max} /><div className="min-w-[130px] flex-1"><h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{name}</h3><p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">{item.hero} · {item.rarity}</p></div><div className="flex items-center gap-2"><label className="text-[10px] text-neutral-400">Lv.<CustomDropdown ariaLabel={`${name} current level`} value={current} onChange={(level) => updateItem(name, 'current', level)} className="ml-1 inline-block w-16 align-middle" options={Array.from({ length: item.max }, (_, index) => index + 1).map((level) => ({ value: level, label: String(level) }))} /></label><span className="text-neutral-300 dark:text-neutral-600">→</span><label className="text-[10px] text-neutral-400">Lv.<CustomDropdown ariaLabel={`${name} target level`} value={target} onChange={(level) => updateItem(name, 'target', level)} className="ml-1 inline-block w-16 align-middle" options={Array.from({ length: item.max }, (_, index) => index + 1).map((level) => ({ value: level, label: String(level), disabled: level < current }))} /></label></div><div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 pl-11 text-[10px] sm:w-auto sm:pl-0">{ORES.map((ore) => <span key={ore.id} className={`inline-flex items-center gap-1 ${ore.color}`}><i className={`h-1.5 w-1.5 rounded-full ${ore.dot}`} />{numberFormat.format(cost[ore.id])}</span>)}<button type="button" onClick={() => removeItem(name)} aria-label={`Remove ${name}`} title="Remove from plan" className="ml-auto rounded-md px-1.5 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800 sm:ml-0">×</button></div></article>)}</div> : <div className="px-5 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-xl text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">＋</div><h3 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Your plan is empty</h3><p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">Pick equipment above to add it here. Set a current level and a goal to see the ore needed.</p></div>}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5" aria-labelledby="ore-balance-heading"><div><h2 id="ore-balance-heading" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Ore you have</h2><p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Optional balances show what remains.</p></div><div className="mt-4 grid grid-cols-3 gap-2">{ORES.map((ore) => <OreInput key={ore.id} ore={ore} compact value={saved.ore[ore.id]} onChange={(amount) => setSaved((value) => ({ ...value, ore: { ...value.ore, [ore.id]: amount } }))} />)}</div></section>
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5" aria-labelledby="ore-total-heading"><div className="flex items-start justify-between gap-3"><div><h2 id="ore-total-heading" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Ore needed</h2><p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Cost from your current levels.</p></div><span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">{totalItems} {totalItems === 1 ? 'upgrade' : 'upgrades'}</span></div><div className="mt-4 space-y-3">{ORES.map((ore) => { const needed = totals[ore.id]; const have = saved.ore[ore.id]; const remaining = Math.max(0, needed - have); const covered = needed === 0 ? 100 : Math.min(100, Math.round(have / needed * 100)); return <div key={ore.id}><div className="flex items-baseline justify-between gap-2"><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ore.color}`}><i className={`h-2 w-2 rounded-full ${ore.dot}`} />{ore.name}</span><span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{numberFormat.format(remaining)} <span className="font-normal text-neutral-400">needed</span></span></div><div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400"><span>{numberFormat.format(have)} / {numberFormat.format(needed)} covered</span><span>{covered}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className={`h-full rounded-full transition-all ${ore.dot}`} style={{ width: `${covered}%` }} /></div></div>; })}</div><div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800"><button type="button" onClick={copyPlanLink} disabled={!totalItems} className="h-10 rounded-xl bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">{copied ? 'Link copied' : 'Copy share link'}</button><button type="button" onClick={clearPlan} disabled={!totalItems && !Object.values(saved.ore).some(Boolean)} className="h-10 rounded-xl border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">Reset plan</button></div><p className="mt-3 text-[10px] leading-relaxed text-neutral-400">Your plan and ore balance save automatically in this browser. Share links include this plan and its balances.</p></section>
          <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30"><h2 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">How ore costs work</h2><p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">Glowy Ore is charged on levels 3, 6, 9, and every third level after. Epic equipment also uses Starry Ore at levels 9 and above. A Common piece costs 27,260 Shiny and 1,920 Glowy to reach level 18; an Epic costs 56,060 Shiny, 3,720 Glowy, and 480 Starry to reach level 27.</p><p className="mt-2 text-[10px] text-neutral-400">Totals exclude ore already spent below each current level.</p></section>
        </aside>
      </div>
    </main>
  );
}

function readPlanFromData(data) {
  const plan = data.plan.filter((row) => EQUIPMENT.some((item) => item.name === row.name));
  const levels = Object.fromEntries(Object.entries(data.levels || {}).flatMap(([name, level]) => {
    const item = EQUIPMENT.find((candidate) => candidate.name === name);
    return item ? [[name, Math.min(item.max, Math.max(1, Number(level) || 1))]] : [];
  }));
  plan.forEach((row) => {
    if (!levels[row.name]) levels[row.name] = Math.min(EQUIPMENT.find((item) => item.name === row.name).max, Math.max(1, Number(row.current) || 1));
  });
  return {
    plan: plan.map((row) => ({
      name: row.name,
      current: Math.min(27, Math.max(1, Number(row.current) || 1)),
      target: Math.min(27, Math.max(1, Number(row.target) || 1)),
    })),
    levels,
    ore: Object.fromEntries(ORES.map(({ id }) => [id, Math.max(0, Number(data.ore?.[id]) || 0)])),
  };
}
