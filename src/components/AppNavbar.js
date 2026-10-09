'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Players', icon: 'players' },
  { href: '/clan', label: 'Clans', icon: 'clans' },
  { href: '/track', label: 'Village tracker', icon: 'tracker' },
];

function NavIcon({ type }) {
  if (type === 'players') return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.2 0-7 2.1-7 4.5 0 .8.7 1.5 1.5 1.5h11c.8 0 1.5-.7 1.5-1.5 0-2.4-2.8-4.5-7-4.5ZM18.5 5.5a3 3 0 0 1 0 6c-.5 0-1-.1-1.4-.3a5.8 5.8 0 0 0 0-5.4c.4-.2.9-.3 1.4-.3ZM19 13.2c1.3.9 2 2 2 3.3 0 .8-.7 1.5-1.5 1.5h-.6c0-1.8-.7-3.4-2-4.6.7-.2 1.4-.2 2.1-.2Z" /></svg>;
  if (type === 'clans') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="m12 3 8 4v5c0 4.5-3.3 7.5-8 9-4.7-1.5-8-4.5-8-9V7l8-4Z" /><path d="m9 12 2 2 4-4" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><circle cx="5" cy="5" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="19" cy="19" r="2" /></svg>;
}

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="sticky top-0 z-[60] border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex h-14 w-full items-center gap-2 px-2 sm:px-3">
        <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="app-navigation" className="relative z-[70] grid h-10 w-10 shrink-0 place-items-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Clash of Stats</Link>
      </div>
      <button type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)} aria-hidden={!open} tabIndex={open ? 0 : -1} className={`fixed inset-x-0 bottom-0 top-14 z-40 bg-black/50 transition-opacity duration-300 ease-out ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} />
      <nav id="app-navigation" aria-label="Main navigation" aria-hidden={!open} className={`fixed bottom-0 left-0 top-14 z-50 flex w-64 flex-col border-r border-neutral-800 bg-black px-3 pb-5 pt-5 text-white shadow-xl shadow-black/30 transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col gap-1">
          {LINKS.map(({ href, label, icon }) => {
            const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined} tabIndex={open ? 0 : -1} className={`flex h-12 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition ${active ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"><NavIcon type={icon} /></span><span>{label}</span></Link>;
          })}
          </div>
      </nav>
    </header>
  );
}
