import Link from 'next/link';
import PlayerWarView from '@/components/PlayerWarView';
import { getCurrentClanWar, enrichWarMemberTownHalls } from '@/app/actions';

export async function generateMetadata({ params }) {
  const { clanTag } = await params;
  return { title: `Current Clan War (${decodeURIComponent(clanTag)}) - Clash of Stats` };
}

export default async function CurrentWarPage({ params }) {
  const { clanTag } = await params;
  const result = await getCurrentClanWar(clanTag);
  const activeWar = result.data && ['preparation', 'inWar'].includes(result.data.state) ? result.data : null;
  const war = activeWar ? await enrichWarMemberTownHalls(activeWar) : null;
  const displayTag = decodeURIComponent(clanTag).trim();

  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] w-full max-w-none bg-[#1a1b20] px-4 py-8 font-sans antialiased text-neutral-100 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
      <Link href={`/clan/${encodeURIComponent(displayTag)}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white">
        <span aria-hidden="true">←</span> Clan details
      </Link>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50">Clan War</h1>
        <p className="mt-1 text-sm text-neutral-400">{war ? `${war.clan?.name || displayTag} vs ${war.opponent?.name || 'Opponent'}` : displayTag}</p>
      </header>
      {result.error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-600 dark:text-red-400">{result.error}</div>
      ) : war ? (
        <PlayerWarView war={war} playerTag={null} loading={false} error={null} onRefresh={undefined} />
      ) : (
        <div className="rounded-2xl border border-[#303438] bg-[#1a1b20] p-8 text-center">
          <p className="font-semibold text-neutral-100">No active regular war</p>
          <p className="mt-1 text-sm text-neutral-500">This clan is not currently in preparation or battle day.</p>
        </div>
      )}
      </div>
    </main>
  );
}
