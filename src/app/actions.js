// src/app/actions.js
'use server'

function getApiToken(importedToken) {
  return (importedToken || process.env.COC_API_TOKEN || '').trim();
}

function fetchCacheOptions(fresh, revalidate) {
  return fresh ? { cache: 'no-store' } : { next: { revalidate } };
}

export async function getPlayerData(playerTag, fresh = false) {
  const token = getApiToken();
  
  if (!token) {
    throw new Error('API token missing in environment variables');
  }

  // 1. Clean up tag and encode '#' to '%23'
  const formattedTag = decodeURIComponent(playerTag).trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  // 2. Fetch from Clash of Clans API
  const response = await fetch(
    `https://cocproxy.royaleapi.dev/v1/players/${encodedTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      ...fetchCacheOptions(fresh, 300),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: errorData.message || `Error ${response.status}: Failed to fetch player` };
  }

  const data = await response.json();
  return { data };
}

export async function getPlayerBattleHistory(playerTag, fresh = false) {
  if (!playerTag) {
    return { data: [] };
  }

  // Clean up tag and encode '#' to '%23'
  const formattedTag = decodeURIComponent(playerTag).trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  return getOfficialPlayerBattleLog(encodedTag, formattedTag, fresh);
}

async function getOfficialPlayerBattleLog(encodedTag, playerTag, fresh = false) {
  const token = getApiToken();
  if (!token) return { error: 'API token missing in environment variables', data: [] };

  try {
    const response = await fetch(
      `https://cocproxy.royaleapi.dev/v1/players/${encodedTag}/battlelog`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        ...fetchCacheOptions(fresh, 60),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `Error ${response.status}: Failed to fetch battle history`,
        data: [],
      };
    }
    const payload = await response.json();
    const entries = Array.isArray(payload.items) ? payload.items : [];
    return { data: entries.map((entry) => normalizeOfficialBattle(entry, playerTag)).filter(Boolean) };
  } catch (err) {
    return { error: err.message || 'Failed to fetch battle history', data: [] };
  }
}

function getBattleDirection(entry, playerTag) {
  if (typeof entry?.attack === 'boolean') return entry.attack;
  if (typeof entry?.isAttack === 'boolean') return entry.isAttack;
  const battle = entry?.battle || entry;
  if (typeof battle?.attack === 'boolean') return battle.attack;

  const normalize = (tag) => String(tag || '').toUpperCase().replace(/^#/, '');
  const player = normalize(playerTag);
  const attacker = normalize(entry?.attackerTag || battle?.attackerTag || battle?.attacker?.tag);
  const defender = normalize(entry?.defenderTag || battle?.defenderTag || battle?.defender?.tag);
  if (player && attacker === player) return true;
  if (player && defender === player) return false;
  return null;
}

function normalizeOfficialBattle(entry, playerTag) {
  if (!entry || typeof entry !== 'object') return null;
  const battle = entry.battle || entry;
  const loot = battle.lootedResources || battle.loot || entry.lootedResources;
  const lootedResources = Array.isArray(loot)
    ? Object.fromEntries(loot.map((resource) => {
      const normalizedName = String(resource.name || '').toLowerCase().replace(/[^a-z]/g, '');
      const key = normalizedName === 'darkelixir' ? 'darkElixir' : normalizedName;
      return [key, Number(resource.amount) || 0];
    }))
    : loot;

  return {
    battleMode: entry.battleMode || entry.battleType || battle.type || battle.mode || 'Attack',
    isAttack: getBattleDirection(entry, playerTag),
    opponentName: entry.opponent?.name || battle.opponent?.name || '',
    opponentTag: entry.opponent?.tag || battle.opponent?.tag || '',
    trophyChange: entry.trophyChange ?? battle.trophyChange ?? null,
    battleTime: entry.battleTimestamp || entry.timestamp || (typeof entry.battleTime === 'string' ? entry.battleTime : '') || battle.battleTimestamp || (typeof battle.battleTime === 'string' ? battle.battleTime : ''),
    stars: entry.stars ?? battle.stars ?? battle.attacker?.stars ?? 0,
    destructionPercentage: entry.destructionPercentage ?? battle.destructionPercentage ?? battle.attacker?.destructionPercentage ?? 0,
    duration: entry.duration ?? battle.duration ?? (typeof battle.battleTime === 'number' ? battle.battleTime : typeof entry.battleTime === 'number' ? entry.battleTime : 0),
    lootedResources,
    shareCode: entry.shareCode || entry.armyShareCode || '',
    familyId: entry.familyId || '',
  };
}

export async function getPlayerCwlHistory(playerTag, fresh = false) {
  if (!playerTag) {
    return { data: [] };
  }

  // Clean up tag and encode '#' to '%23'
  const formattedTag = decodeURIComponent(playerTag).trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  try {
    const response = await fetch(
      `https://api.clashk.ing/v2/player/${encodedTag}/cwl/history`,
      {
        headers: {
          Accept: 'application/json',
        },
        ...fetchCacheOptions(fresh, 300),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `Error ${response.status}: Failed to fetch CWL history`,
        data: [],
      };
    }

    const data = await response.json();
    return { data: Array.isArray(data.items) ? data.items : [] };
  } catch (err) {
    return {
      error: err.message || 'Failed to fetch CWL history',
      data: [],
    };
  }
}

export async function getClanData(clanTag) {
  const token = getApiToken();

  if (!token) {
    throw new Error('API token missing in environment variables');
  }

  if (!clanTag) {
    return { error: 'Clan tag is required' };
  }

  const formattedTag = decodeURIComponent(clanTag).trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  try {
    const response = await fetch(
      `https://cocproxy.royaleapi.dev/v1/clans/${encodedTag}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        // Revalidate clan data every 5 minutes (300s)
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || `Error ${response.status}: Failed to fetch clan` };
    }

    const data = await response.json();
    return { data };
  } catch (err) {
    return { error: err.message || 'Failed to fetch clan details' };
  }
}

export async function getClanMembers(clanTag) {
  const token = getApiToken();

  if (!token) {
    throw new Error('API token missing in environment variables');
  }

  if (!clanTag) {
    return { data: [], error: 'Clan tag is required' };
  }

  const formattedTag = decodeURIComponent(clanTag).trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  try {
    const response = await fetch(
      `https://cocproxy.royaleapi.dev/v1/clans/${encodedTag}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        // Revalidate clan members every 2 minutes (120s)
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `Error ${response.status}: Failed to fetch clan members`,
        data: [],
      };
    }

    const data = await response.json();
    return { data: Array.isArray(data.items) ? data.items : [] };
  } catch (err) {
    return {
      error: err.message || 'Failed to fetch clan members',
      data: [],
    };
  }
}

export async function getCurrentClanWar(clanTag, fresh = false) {
  const token = getApiToken();
  if (!token) return { error: 'API token missing in environment variables' };
  if (!clanTag) return { error: 'Clan tag is required' };

  const formattedTag = decodeURIComponent(clanTag).trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  try {
    const response = await fetch(
      `https://cocproxy.royaleapi.dev/v1/clans/${encodedTag}/currentwar`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        ...fetchCacheOptions(fresh, 60),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || `Error ${response.status}: Failed to fetch current war` };
    }

    return { data: await response.json() };
  } catch (err) {
    return { error: err.message || 'Failed to fetch current war' };
  }
}

export async function enrichWarMemberTownHalls(war, fresh = false) {
  if (!war) return war;
  const teams = [war.clan, war.opponent].filter(Boolean);
  const members = teams.flatMap((team) => team.members || []);
  const needsLookup = members.filter((member) => member.tag && !member.townhallLevel && !member.townHallLevel);
  const levels = new Map();

  await Promise.all(needsLookup.map(async (member) => {
    try {
      const tag = decodeURIComponent(String(member.tag)).trim().replace(/^%23/i, '').replace(/^#/, '').toUpperCase();
      const result = await getPlayerData(tag, fresh);
      const level = result.data?.townHallLevel ?? result.data?.townhallLevel;
      if (level) levels.set(tag.replace(/^#/, ''), level);
    } catch {
      // Keep the roster available even if an individual profile lookup fails.
    }
  }));

  return {
    ...war,
    clan: war.clan ? { ...war.clan, members: (war.clan.members || []).map((member) => ({ ...member, townHallLevel: member.townhallLevel || member.townHallLevel || levels.get(String(member.tag || '').toUpperCase().replace(/^#/, '')) })) } : war.clan,
    opponent: war.opponent ? { ...war.opponent, members: (war.opponent.members || []).map((member) => ({ ...member, townHallLevel: member.townhallLevel || member.townHallLevel || levels.get(String(member.tag || '').toUpperCase().replace(/^#/, '')) })) } : war.opponent,
  };
}
