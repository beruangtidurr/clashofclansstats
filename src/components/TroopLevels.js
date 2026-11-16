// src/components/TroopLevels.js
'use client';

import { useState, useMemo } from 'react';
import TroopIcon, { getTroopImageUrl } from './TroopIcon';
import TOWNHALL_MAX_LEVELS from '@/app/track/townhall-max-levels.json';

const PET_ROSTER = [
  { name: 'L.A.S.S.I', maxLevel: 15, unlockTownHall: 14 },
  { name: 'Electro Owl', maxLevel: 15, unlockTownHall: 14 },
  { name: 'Mighty Yak', maxLevel: 15, unlockTownHall: 14 },
  { name: 'Unicorn', maxLevel: 15, unlockTownHall: 14 },
  { name: 'Frosty', maxLevel: 15, unlockTownHall: 15 },
  { name: 'Diggy', maxLevel: 15, unlockTownHall: 15 },
  { name: 'Poison Lizard', maxLevel: 15, unlockTownHall: 15 },
  { name: 'Phoenix', maxLevel: 10, unlockTownHall: 15 },
  { name: 'Spirit Fox', maxLevel: 10, unlockTownHall: 16 },
  { name: 'Angry Jelly', maxLevel: 10, unlockTownHall: 16 },
  { name: 'Sneezy', maxLevel: 10, unlockTownHall: 17 },
  { name: 'Greedy Raven', maxLevel: 10, unlockTownHall: 18 },
];
const PET_NAMES = new Set(PET_ROSTER.map((pet) => pet.name));

const TROOP_ROSTER = [
  'Barbarian', 'Archer', 'Goblin', 'Giant', 'Wall Breaker', 'Balloon', 'Wizard', 'Healer',
  'Dragon', 'P.E.K.K.A', 'Baby Dragon', 'Miner', 'Electro Dragon', 'Yeti', 'Dragon Rider',
  'Electro Titan', 'Root Rider', 'Druid', 'Thrower', 'Ruin Witch', 'Meteor Golem',
  'Minion', 'Hog Rider', 'Valkyrie', 'Golem', 'Witch', 'Lava Hound', 'Bowler', 'Ice Golem',
  'Headhunter', 'Apprentice Warden', 'Furnace',
];

const SPELL_ROSTER = [
  'Lightning Spell', 'Healing Spell', 'Rage Spell', 'Jump Spell', 'Freeze Spell', 'Clone Spell',
  'Invisibility Spell', 'Recall Spell', 'Overgrowth Spell', 'Revive Spell', 'Earthquake Spell',
  'Poison Spell', 'Haste Spell', 'Skeleton Spell', 'Bat Spell', 'Angry Spell', 'Heroic Spell',
  'Ice Block Spell', 'Totem Spell',
];

const SIEGE_NAMES = new Set([
  'Wall Wrecker',
  'Battle Blimp',
  'Stone Slammer',
  'Siege Barracks',
  'Log Launcher',
  'Flame Flinger',
  'Battle Drill',
  'Troop Launcher',
  'Sky Wagon',
]);

const SQUAD_ROSTER = [
  { name: 'Barch Squad', imageName: 'barch_squad', unlockTownHall: 8, composition: [['Barbarian', 15], ['Archer', 15]], ability: 'Splash Resistance' },
  { name: 'Giant Wizard Squad', imageName: 'giant_wizard_squad', unlockTownHall: 9, composition: [['Giant', 3], ['Wizard', 5]], ability: 'Splash Resistance' },
  { name: 'Wall Breaker Squad', imageName: 'wall_breaker_squad', unlockTownHall: 10, composition: [['Wall Breaker', 5]], ability: 'Stealthy Start' },
  { name: 'Minion Squad', imageName: 'minion_squad', unlockTownHall: 11, composition: [['Minion', 8]], ability: 'Splash Resistance' },
  { name: 'Balloon Squad', imageName: 'balloon_squad', unlockTownHall: 12, composition: [['Balloon', 4]], ability: 'Trap Sense' },
  { name: 'Golem Witch Squad', imageName: 'golem_witch_squad', unlockTownHall: 13, composition: [['Golem', 1], ['Witch', 4]], ability: 'Splash Resistance' },
  { name: 'Hog Rider Squad', imageName: 'hog_rider_squad', unlockTownHall: 14, composition: [['Hog Rider', 12]], ability: 'Trap Sense' },
  { name: 'Miner Squad', imageName: 'miner_squad', unlockTownHall: 15, composition: [['Miner', 10]], ability: 'Trap Sense' },
  { name: 'Healer Squad', imageName: 'healer_squad', unlockTownHall: 16, composition: [['Balloon', 1], ['Healer', 5]], ability: 'Shielded Start' },
  { name: 'P.E.K.K.A Titan Squad', imageName: 'pekka_titan_squad', unlockTownHall: 17, composition: [['P.E.K.K.A', 1], ['Electro Titan', 1]], ability: 'Focus Attack' },
  { name: 'Dragons Squad', imageName: 'dragons_squad', unlockTownHall: 18, composition: [['Dragon', 2], ['Dragon Rider', 2]], ability: 'Shielded Start' },
  { name: 'Baby Dragon Squad', imageName: 'baby_dragon_squad', unlockTownHall: 19, composition: [['Baby Dragon', 3]], ability: 'Tantrum' },
];

const HOME_UNIT_NAME_IDS = {
  'L.A.S.S.I': 73000000, 'Mighty Yak': 73000001, 'Electro Owl': 73000002,
  Unicorn: 73000003, Phoenix: 73000004, 'Poison Lizard': 73000007,
  Diggy: 73000008, Frosty: 73000009, 'Spirit Fox': 73000010,
  'Angry Jelly': 73000011, Sneezy: 73000016, 'Greedy Raven': 73000017,
  Barbarian: 4000000, Archer: 4000001, Goblin: 4000002, Giant: 4000003,
  'Wall Breaker': 4000004, Balloon: 4000005, Wizard: 4000006, Healer: 4000007,
  Dragon: 4000008, 'P.E.K.K.A': 4000009, Minion: 4000010, 'Hog Rider': 4000011,
  Valkyrie: 4000012, Golem: 4000013, Witch: 4000015, 'Lava Hound': 4000017,
  'Baby Dragon': 4000023, Miner: 4000024, Bowler: 4000022,
  'Electro Dragon': 4000059, Yeti: 4000053, 'Ice Golem': 4000058,
  'Dragon Rider': 4000065, Headhunter: 4000082, 'Apprentice Warden': 4000097,
  'Electro Titan': 4000095, 'Root Rider': 4000110, Druid: 4000123,
  Thrower: 4000132, 'Ruin Witch': 4000109, 'Meteor Golem': 4000177, Furnace: 4000150,
  'Lightning Spell': 26000000, 'Healing Spell': 26000001, 'Rage Spell': 26000002,
  'Jump Spell': 26000003, 'Freeze Spell': 26000005, 'Clone Spell': 26000016,
  'Invisibility Spell': 26000035, 'Recall Spell': 26000053, 'Overgrowth Spell': 26000070,
  'Revive Spell': 26000098, 'Earthquake Spell': 26000010, 'Poison Spell': 26000009,
  'Haste Spell': 26000011, 'Skeleton Spell': 26000017, 'Bat Spell': 26000028,
  'Angry Spell': 26000123, 'Ice Block Spell': 26000109, 'Totem Spell': 26000120,
  'Heroic Spell': 26000151,
};

export default function TroopLevels({ troops = [], spells = [], squads = [], townHallLevel = 0 }) {
  const troopLevels = useMemo(() => new Map(
    (troops || []).filter((troop) => troop.village === 'home' || !troop.village)
      .map((troop) => [troop.name, Number(troop.level) || 0])
  ), [troops]);
  const maxLevelAtTownHall = (item) => {
    if (!townHallLevel) return null;
    const dataId = Number(item.dataId || item.item?.id || HOME_UNIT_NAME_IDS[item.name]);
    if (!dataId) return null;
    const caps = TOWNHALL_MAX_LEVELS[`home:${dataId}`];
    return caps?.[Math.min(18, Math.max(0, Number(townHallLevel) - 1))] || null;
  };
  const overallMaxLevel = (item) => {
    if (item.maxLevel) return item.maxLevel;
    const dataId = Number(item.dataId || item.item?.id || HOME_UNIT_NAME_IDS[item.name]);
    const caps = dataId ? TOWNHALL_MAX_LEVELS[`home:${dataId}`] : null;
    return caps?.[caps.length - 1] || null;
  };
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
        regularTroops.push({ ...t, dataId: t.dataId || t.item?.id, itemType: 'troop' });
      }
    }

    const spellList = (spells || []).map((s) => ({
      ...s,
      dataId: s.dataId || s.item?.id,
      itemType: 'spell',
    }));

    const withLockedEntries = (items, roster, itemType) => {
      const present = new Set(items.map((item) => item.name));
      return [
        ...items,
        ...roster
          .filter((name) => !present.has(name))
          .map((name) => ({ name, level: 0, itemType, isLocked: true })),
      ];
    };

    const petsByName = new Map(pets.map((pet) => [pet.name, pet]));
    const completePetRoster = PET_ROSTER.map(({ name, maxLevel, unlockTownHall }, order) => {
      const pet = petsByName.get(name);
      return pet
        ? { ...pet, maxLevel: pet.maxLevel || maxLevel, unlockTownHall, unlocked: Number(pet.level) > 0, order }
        : { name, level: 0, maxLevel, unlockTownHall, itemType: 'pet', unlocked: false, order };
    }).sort((a, b) => {
      const aAvailable = townHallLevel >= a.unlockTownHall;
      const bAvailable = townHallLevel >= b.unlockTownHall;
      if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;
      return a.order - b.order;
    });

    return {
      troops: withLockedEntries(regularTroops, TROOP_ROSTER, 'troop'),
      spells: withLockedEntries(spellList, SPELL_ROSTER, 'spell'),
      siege: withLockedEntries(siegeMachines, [...SIEGE_NAMES], 'siege'),
      pets: completePetRoster,
      super: superTroops,
      builder: builderTroops.map((t) => ({ ...t, itemType: 'builder' })),
    };
  }, [troops, spells]);

  const sections = [
    { id: 'troops', label: 'Troops', items: categories.troops },
    { id: 'spells', label: 'Spells', items: categories.spells },
    { id: 'siege', label: 'Siege Machines', items: categories.siege },
  ].filter((section) => section.items.length > 0);

  if (sections.length === 0 && categories.pets.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
      {categories.pets.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Pets</h3>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {categories.pets.map((pet) => (
              <TroopIcon
                key={`pet-${pet.name}`}
                name={pet.name}
                level={pet.level}
                maxLevel={overallMaxLevel(pet)}
                townHallMaxLevel={maxLevelAtTownHall(pet)}
                townHallLevel={townHallLevel}
                type="pet"
              />
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4">
        {sections.map((section) => {
          const items = section.items;

          return (
            <div key={section.id}>
              <section>
                <div className="mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {section.label}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {items.map((item) => (
                    <TroopIcon
                      key={`${item.itemType}-${item.name}`}
                      name={item.name}
                      level={item.level}
                      maxLevel={overallMaxLevel(item)}
                      townHallMaxLevel={maxLevelAtTownHall(item)}
                      townHallLevel={townHallLevel}
                      type={item.itemType}
                      isActiveSuperTroop={item.isActiveSuperTroop}
                      isLocked={item.isLocked}
                    />
                  ))}
                </div>
              </section>
              {section.id === 'troops' && (
                <section className="mt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Squads</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {SQUAD_ROSTER.map((squad) => {
                      const unlocked = Number(townHallLevel) >= squad.unlockTownHall;
                      const [leadTroop] = squad.composition[0];
                      const composition = squad.composition.map(([name, count]) => `${name} ×${count}`).join(' · ');
                      const squadData = (squads || []).find((entry) =>
                        entry.name?.toLowerCase() === squad.name.toLowerCase()
                        || entry.id === squad.imageName
                        || entry.dataId === squad.imageName
                      );
                      const squadLevel = Number(squadData?.level) || (unlocked && Number(townHallLevel) < 19 ? 1 : null);
                      return (
                        <TroopIcon
                          key={squad.name}
                          name={squad.name}
                          level={squadLevel || 0}
                          maxLevel={3}
                          showMaxLevel
                          levelDisplay={squadLevel || (unlocked ? '?' : undefined)}
                          levelIsKnown={Boolean(squadLevel)}
                          type="troop"
                          imageUrl={getTroopImageUrl(squad.imageName, 'troop')}
                          isLocked={!unlocked}
                          tooltipTitle={squad.name}
                          tooltipLevelLabel={squadLevel ? `Squad level ${squadLevel}` : 'Squad level unavailable'}
                          tooltipDetails={[
                            unlocked ? `Unlocks at Town Hall ${squad.unlockTownHall}` : `Locked until Town Hall ${squad.unlockTownHall}`,
                            composition,
                            `Lead troop: ${leadTroop} level ${troopLevels.get(leadTroop) || 1}`,
                            `Level 2 ability: ${squad.ability}`,
                          ]}
                        />
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
