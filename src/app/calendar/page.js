'use client';

import { useEffect, useMemo, useState } from 'react';

const EVENTS = [
  { id: 'gold-pass', name: 'November Gold Pass', start: '2026-11-01', end: '2026-12-01', type: 'Season', color: 'bg-amber-500', detail: 'The November Gold Pass features the Grand Titan (Grand Warden).' },
  { id: 'hammer-jam', name: 'Hammer Jam', start: '2026-11-01', end: '2026-11-16', type: 'Boost', color: 'bg-cyan-500', detail: '50% off upgrade timers and costs, plus a 2× boost to resource collector capacity and production.' },
  { id: 'cwl', name: 'November Clan War League', start: '2026-11-01', end: '2026-11-11', type: 'Clan', color: 'bg-violet-500', detail: 'November Clan War League.' },
  { id: 'titan-foundry', name: 'Titan Foundry Scenery', start: '2026-11-03', end: '2026-12-01', type: 'Shop', color: 'bg-indigo-500', detail: 'Titan Foundry scenery available in the shop.' },
  { id: 'titan-king', name: 'Titan King skin', start: '2026-11-05', end: '2026-12-01', type: 'Hero skin', color: 'bg-rose-500', detail: 'Titan King (Barbarian King) skin arrives in the shop.' },
  { id: 'titan-prince', name: 'Titan Prince skin', start: '2026-11-07', end: '2026-12-01', type: 'Hero skin', color: 'bg-rose-500', detail: 'Titan Prince (Minion Prince) skin arrives in the shop.' },
  { id: 'troop-spotlight', name: 'Troop Spotlight Event', start: '2026-11-10', end: '2026-11-17', type: 'Medal event', color: 'bg-fuchsia-500', detail: 'Collect Ice Cubes with Super Yeti and earn Super Medals.' },
  { id: 'th18-challenge', name: 'Last Town Hall 18 Challenge', start: '2026-11-09', end: '2026-11-16', type: 'Challenge', color: 'bg-amber-500', detail: 'The final Town Hall 18 Challenge.' },
  { id: 'momma', name: 'M.O.M.M.A Mass Troop Event', start: '2026-11-09', end: '2026-11-10', type: 'Event', color: 'bg-emerald-500', detail: 'Use 25 M.O.M.M.As in battle for free at Town Hall 10 and above.' },
  { id: 'titan-champion', name: 'Titan Champion skin', start: '2026-11-09', end: '2026-12-01', type: 'Hero skin', color: 'bg-rose-500', detail: 'Titan Champion (Royal Champion) skin arrives in the shop.' },
  { id: 'titan-queen', name: 'Titan Queen skin', start: '2026-11-11', end: '2026-12-01', type: 'Hero skin', color: 'bg-rose-500', detail: 'Titan Queen (Archer Queen) skin arrives in the shop.' },
  { id: 'titan-duke', name: 'Titan Duke', start: '2026-11-13', end: '2026-12-01', type: 'Hero skin', color: 'bg-rose-500', detail: 'Titan Duke (Dragon Duke) becomes available.' },
  { id: 'treasure-hunt', name: 'Treasure Hunt', start: '2026-11-16', end: '2026-11-24', type: 'Event', color: 'bg-emerald-500', detail: 'Treasure Hunt returns for Town Hall 3 through 17.' },
  { id: 'snackable-troops', name: 'Snackable Troops Event', start: '2026-11-20', end: '2026-11-27', type: 'Event', color: 'bg-sky-500', detail: 'Call in limited backup troops for battles.' },
  { id: 'clan-games', name: 'November Clan Games', start: '2026-11-22', end: '2026-11-29', type: 'Clan', color: 'bg-violet-500', detail: 'November Clan Games, with Backup Troops for the first four days.' },
  { id: 'fully-forged', name: 'Fully Forged Challenge', start: '2026-11-24', end: '2026-12-02', type: 'Challenge', color: 'bg-amber-500', detail: 'Assemble heroes made from Siege Machine parts in the Fully Forged Challenge.' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const displayDate = (value, options = { month: 'short', day: 'numeric' }) => new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...options });
const displayMonth = (date, options) => date.toLocaleDateString('en-US', { timeZone: 'UTC', ...options });

function eventIsOnDate(event, key) {
  return event.start <= key && key < event.end;
}

function eventRange(event) {
  const end = new Date(`${event.end}T12:00:00`);
  end.setDate(end.getDate() - 1);
  return `${displayDate(event.start)} – ${displayDate(dateKey(end))}`;
}

export default function CalendarPage() {
  const [today, setToday] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  useEffect(() => {
    const updateToday = () => {
      const current = new Date();
      setToday(current);
      setMonth((visibleMonth) => visibleMonth.getFullYear() === current.getFullYear() && visibleMonth.getMonth() === current.getMonth()
        ? visibleMonth
        : new Date(current.getFullYear(), current.getMonth(), 1));
      setSelectedDate((selected) => selected === dateKey(today) ? dateKey(current) : selected);
    };
    const interval = setInterval(updateToday, 60_000);
    window.addEventListener('focus', updateToday);
    document.addEventListener('visibilitychange', updateToday);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateToday);
      document.removeEventListener('visibilitychange', updateToday);
    };
  }, [today]);
  const monthId = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const monthEvents = EVENTS.filter((event) => event.start.startsWith(monthId));
  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const total = Math.ceil((offset + count) / 7) * 7;
    return Array.from({ length: total }, (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= count ? new Date(month.getFullYear(), month.getMonth(), day) : null;
    });
  }, [month]);
  const selectedEvents = EVENTS.filter((event) => eventIsOnDate(event, selectedDate));
  const todayKey = dateKey(today);

  const changeMonth = (amount) => {
    const next = new Date(month.getFullYear(), month.getMonth() + amount, 1);
    setMonth(next);
    setSelectedDate(dateKey(next));
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 font-sans antialiased sm:px-6 sm:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Clash of Clans</p><h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Events calendar</h1><p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Keep track of seasonal events, clan activities, and boosts.</p></div>
        <span className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-800">Times shown in your local calendar</span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <section id="calendar-grid" className="scroll-mt-20 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 dark:border-neutral-800 sm:px-5">
            <div><h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{displayMonth(month, { month: 'long', year: 'numeric' })}</h2><p className="mt-0.5 text-xs text-neutral-400">{monthEvents.length} scheduled events</p></div>
            <div className="flex items-center gap-1"><button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">‹</button><button type="button" onClick={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)); }} className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">Today</button><button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">›</button></div>
          </div>
          <div className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-800">{WEEKDAYS.map((day) => <div key={day} className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{day}</div>)}</div>
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="min-h-24 border-b border-r border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/30 sm:min-h-28" />;
              const key = dateKey(date);
              const dayEvents = EVENTS.filter((event) => eventIsOnDate(event, key));
              const selected = selectedDate === key;
              return <button key={key} type="button" onClick={() => setSelectedDate(key)} aria-pressed={selected} className={`min-h-24 border-b border-r border-neutral-100 p-1.5 text-left transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50 sm:min-h-28 sm:p-2 ${selected ? 'bg-neutral-50 dark:bg-neutral-800/40' : 'bg-white dark:bg-neutral-900/20'}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${key === todayKey ? 'bg-neutral-900 font-bold text-white dark:bg-neutral-100 dark:text-neutral-900' : selected ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>{date.getDate()}</span>
                <span className="mt-1.5 flex flex-col gap-1">{dayEvents.slice(0, 2).map((event) => <span key={event.id} className="flex min-w-0 items-center gap-1.5"><i className={`h-1.5 w-1.5 shrink-0 rounded-full ${event.color}`} /><span className="hidden truncate text-[10px] text-neutral-600 dark:text-neutral-300 sm:block">{event.name}</span></span>)}{dayEvents.length > 2 && <span className="pl-3 text-[9px] text-neutral-400">+{dayEvents.length - 2} more</span>}</span>
              </button>;
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 text-[10px] text-neutral-500 dark:text-neutral-400 sm:px-5">{[['bg-violet-500', 'Clan'], ['bg-fuchsia-500', 'Seasonal'], ['bg-cyan-500', 'Boosts'], ['bg-sky-500', 'Special events']].map(([color, label]) => <span key={label} className="inline-flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div>
        </section>

        <aside className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{displayDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">{selectedEvents.length ? 'Events' : 'No events scheduled'}</h2>
          {selectedEvents.length ? <div className="mt-4 space-y-3">{selectedEvents.map((event) => <article key={event.id} className="rounded-xl border border-neutral-100 p-3.5 dark:border-neutral-800"><div className="flex items-start gap-3"><i className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${event.color}`} /><div className="min-w-0"><h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{event.name}</h3><p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400">{event.type} · {eventRange(event)}</p><p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{event.detail}</p></div></div></article>)}</div> : <p className="mt-2 text-sm text-neutral-500">Choose another date or month to see scheduled events.</p>}
          {monthEvents.length === 0 && <p className="mt-5 rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-500 dark:bg-neutral-950">No published event dates are available for this month yet.</p>}
        </aside>
      </div>

      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{displayMonth(month, { month: 'long' })} schedule</h2><p className="mt-1 text-xs text-neutral-500">Published event dates can change. Check the in-game event screen for the latest countdown.</p></div><span className="rounded-lg bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">{monthEvents.length} events</span></div>
        {monthEvents.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{monthEvents.map((event) => <button key={event.id} type="button" onClick={() => { setSelectedDate(event.start); document.getElementById('calendar-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="flex items-center gap-3 rounded-xl border border-neutral-100 px-3 py-3 text-left transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"><i className={`h-2.5 w-2.5 shrink-0 rounded-full ${event.color}`} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{event.name}</span><span className="mt-0.5 block text-[10px] text-neutral-400">{eventRange(event)}</span></span><span className="text-[10px] text-neutral-400">{event.type}</span></button>)}</div> : <p className="mt-4 text-xs text-neutral-500">No event schedule published for this month.</p>}
        <p className="mt-4 border-t border-neutral-100 pt-3 text-[10px] text-neutral-400 dark:border-neutral-800">Source: <a href="https://supercell.com/en/games/clashofclans/blog/news/clash-of-titans-is-hot-off-the-press/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200">Supercell November season schedule</a></p>
      </section>
    </main>
  );
}
