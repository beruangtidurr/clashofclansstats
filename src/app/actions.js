// src/app/actions.js
'use server'

export async function getPlayerData(playerTag) {
  const token = process.env.COC_API_TOKEN;
  
  if (!token) {
    throw new Error('API token missing in environment variables');
  }

  // 1. Clean up tag and encode '#' to '%23'
  const formattedTag = playerTag.trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  // 2. Fetch from Clash of Clans API
  const response = await fetch(
    `https://api.clashofclans.com/v1/players/${encodedTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      // Revalidate data every 5 minutes (300s)
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: errorData.message || `Error ${response.status}: Failed to fetch player` };
  }

  const data = await response.json();
  return { data };
}

export async function getPlayerBattleHistory(playerTag) {
  if (!playerTag) {
    return { data: [] };
  }

  // Clean up tag and encode '#' to '%23'
  const formattedTag = playerTag.trim().toUpperCase().replace(/^#/, '');
  const encodedTag = `%23${formattedTag}`;

  try {
    const response = await fetch(
      `https://api.clashk.ing/v2/player/${encodedTag}/battlelog/history`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Revalidate battle history every 2 minutes (120s)
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `Error ${response.status}: Failed to fetch battle history`,
        data: [],
      };
    }

    const data = await response.json();
    return { data: Array.isArray(data.items) ? data.items : [] };
  } catch (err) {
    return {
      error: err.message || 'Failed to fetch battle history',
      data: [],
    };
  }
}
