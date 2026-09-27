// src/components/TroopLevels.js
'use client';

import { useState, useMemo } from 'react';
import TroopIcon from './TroopIcon';

const PET_NAMES = new Set([
  'L.A.S.S.I',
  'Mighty Yak',
  'Electro Owl',
  'Unicorn',
  'Phoenix',
  'Poison Lizard',
  'Diggy',
  'Frosty',
  'Spirit Fox',
  'Angry Jelly',
  'Sneezy',
  'Greedy Raven',
]);

const SIEGE_NAMES = new Set([
  'Wall Wrecker',
  'Battle Blimp',
  'Stone Slammer',
  'Siege Barracks',
  'Log Launcher',
  'Flame Flinger',
  'Battle Drill',
  'Troop Launcher',
  'Furnace',
  'Meteor Golem',
  'Sky Wagon',
]);

export default function TroopLevels({ troops = [], spells = [] }) {
  const [activeCategory, setActiveCategory] = useState('troops');
  const [showMaxedOnly, setShowMaxedOnly] = useState(false);

  // Group troops & spells by categories
  const categories = useMemo(() => {
    const homeTroops = (troops || []).filter(
      (t) => t.village === 'home' || (!t.village && t.village !== 'builderBase')
    );
    const builderTroops = (troops || []).filter((t) => t.village === 'builderBase');

    const regularTroops = [];
    const siegeMachines = [];
    const pets = [];
    const superTroops = [];

    for (const t of homeTroops) {
      if (PET_NAMES.has(t.name)) {
        pets.push({ ...t, itemType: 'pet' });
      } else if (SIEGE_NAMES.has(t.name)) {
        siegeMachines.push({ ...t, itemType: 'siege' });
      } else if (
        t.superTroopIsActive !== undefined ||
        t.name.startsWith('Super ') ||
        t.name === 'Sneaky Goblin' ||
        t.name === 'Rocket Balloon' ||
        t.name === 'Inferno Dragon' ||
        t.name === 'Ice Hound'
      ) {
        superTroops.push({
          ...t,
          itemType: 'super',
          isActiveSuperTroop: Boolean(t.superTroopIsActive),
        });
      } else {
        regularTroops.push({ ...t, itemType: 'troop' });
      }
    }

    const spellList = (spells || []).map((s) => ({
      ...s,
      itemType: 'spell',
    }));

    return {
      troops: regularTroops,
      spells: spellList,
      siege: siegeMachines,
      pets,
      super: superTroops,
      builder: builderTroops.map((t) => ({ ...t, itemType: 'builder' })),
    };
  }, [troops, spells]);

  // Available tabs that actually contain items
  const tabs = useMemo(() => {
    const list = [];
    if (categories.troops.length > 0) list.push({ id: 'troops', label: 'Troops', items: categories.troops });
    if (categories.spells.length > 0) list.push({ id: 'spells', label: 'Spells', items: categories.spells });
    if (categories.siege.length > 0) list.push({ id: 'siege', label: 'Siege', items: categories.siege });
    if (categories.pets.length > 0) list.push({ id: 'pets', label: 'Pets', items: categories.pets });
    if (categories.super.length > 0) list.push({ id: 'super', label: 'Super', items: categories.super });
    if (categories.builder.length > 0) list.push({ id: 'builder', label: 'Builder Base', items: categories.builder });
    return list;
  }, [categories]);

  // Current category items
  const currentTab = tabs.find((t) => t.id === activeCategory) || tabs[0];
  const currentItems = useMemo(() => {
    return currentTab?.items || [];
  }, [currentTab]);

  // Filtered by maxed toggle
  const displayedItems = useMemo(() => {
    if (!showMaxedOnly) return currentItems;
    return currentItems.filter((item) => item.maxLevel && item.level >= item.maxLevel);
  }, [currentItems, showMaxedOnly]);

  // Maxed count for active category
  const maxedCount = useMemo(() => {
    return currentItems.filter((item) => item.maxLevel && item.level >= item.maxLevel).length;
  }, [currentItems]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Troop Levels
          </div>
          {currentItems.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              {maxedCount}/{currentItems.length} Maxed
            </span>
          )}
        </div>

        {/* Maxed Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowMaxedOnly((prev) => !prev)}
          className={`self-start sm:self-auto text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
            showMaxedOnly
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium'
              : 'bg-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 border-neutral-200 dark:border-neutral-800'
          }`}
        >
          {showMaxedOnly ? 'Showing Maxed Only' : 'Show Maxed Only'}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {tabs.map((tab) => {
          const isSelected = (currentTab?.id || activeCategory) === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                  : 'bg-neutral-100/70 hover:bg-neutral-200/70 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected
                    ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
                    : 'bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {tab.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Troops Grid */}
      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayedItems.map((item) => (
            <TroopIcon
              key={`${item.itemType}-${item.name}`}
              name={item.name}
              level={item.level}
              maxLevel={item.maxLevel}
              type={item.itemType}
              isActiveSuperTroop={item.isActiveSuperTroop}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-800/50 text-center text-xs text-neutral-400">
          {showMaxedOnly
            ? 'No maxed units in this category yet.'
            : 'No units available in this category.'}
        </div>
      )}
    </div>
  );
}
