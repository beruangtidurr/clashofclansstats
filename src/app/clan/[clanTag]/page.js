// src/app/clan/[clanTag]/page.js
import ClanView from './ClanView';
import { getClanData, getClanMembers } from '@/app/actions';

export async function generateMetadata({ params }) {
  const { clanTag } = await params;
  if (!clanTag) {
    return { title: 'Clan Details - Clash of Clans' };
  }

  const clanResult = await getClanData(clanTag);
  if (clanResult.data?.name) {
    return {
      title: `${clanResult.data.name} (${clanResult.data.tag}) - Clash of Clans`,
      description:
        clanResult.data.description ||
        `View clan stats, information and members for ${clanResult.data.name}`,
    };
  }

  const cleanDisplay = decodeURIComponent(clanTag).trim();
  return {
    title: `Clan ${cleanDisplay} - Clash of Clans`,
  };
}

export default async function ClanPage({ params }) {
  const { clanTag } = await params;

  const [clanResult, membersResult] = await Promise.all([
    getClanData(clanTag),
    getClanMembers(clanTag),
  ]);

  const members =
    membersResult.data?.length > 0
      ? membersResult.data
      : clanResult.data?.memberList || [];

  return (
    <ClanView
      key={clanTag}
      clanTag={clanTag}
      initialClan={clanResult.data || null}
      initialClanError={clanResult.error || null}
      initialMembers={members}
      initialMembersError={membersResult.error || null}
    />
  );
}
