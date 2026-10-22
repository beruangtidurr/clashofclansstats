// src/app/clan/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SavedClans, { useSavedClans, normalizeClanTag } from '@/components/SavedClans';

export default function ClanSearchPage() {
  const [tag, setTag] = useState('');
  const { savedClans, isClanSaved, toggleSavedClan, clearSavedClans } = useSavedClans();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.trim();
      if (hash.length > 1) {
        router.replace(`/clan/${encodeURIComponent(hash)}`);
      }
    }
  }, [router]);

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = tag.trim().toUpperCase().replace(/^#/, '');
    if (!clean) return;
    router.push(`/clan/${encodeURIComponent(`#${clean}`)}`);
  };

  return (
    <main className="max-w-2xl w-full mx-auto py-10 px-4 sm:px-6 font-sans antialiased">
      <div className="mb-6 mt-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Find Clan
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Search clan members, war performance & details
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 focus-within:border-neutral-400 dark:focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-neutral-900/5 dark:focus-within:ring-neutral-100/5 transition-all">
          <div className="pl-2.5 text-neutral-400 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Enter clan tag (e.g. #2J8Q9YCGV)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full bg-transparent px-1 py-1 text-sm font-sans uppercase text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-sans focus:outline-none"
          />
          {tag.trim() && (
            <button
              type="button"
              onClick={() => toggleSavedClan({ tag: normalizeClanTag(tag) })}
              title={isClanSaved(tag) ? 'Remove clan bookmark' : 'Bookmark this clan'}
              aria-label={isClanSaved(tag) ? 'Remove clan bookmark' : 'Bookmark this clan'}
              className={`rounded-lg p-1 transition-colors ${isClanSaved(tag) ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500'}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" /></svg>
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>
      </form>
      <SavedClans savedClans={savedClans} onClear={clearSavedClans} />
    </main>
  );
}
