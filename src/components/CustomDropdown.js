'use client';

import { useEffect, useRef } from 'react';

export default function CustomDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onChange,
  className = '',
  buttonClassName = '',
}) {
  const wrapperRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) onToggle(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onToggle(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onToggle]);

  return <div ref={wrapperRef} className={`relative ${className}`}>
    <button
      type="button"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={() => onToggle(!isOpen)}
      className={`inline-flex min-w-24 cursor-pointer items-center justify-between gap-3 rounded-lg border border-neutral-200/70 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 dark:border-neutral-700 dark:bg-[#292c33] dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-[#30343c] ${buttonClassName}`}
    >
      <span>{selected?.label || value}</span>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
    </button>
    {isOpen && <div role="listbox" aria-label={label} className="absolute left-0 top-full z-30 mt-2 min-w-full overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-xl shadow-black/10 dark:border-neutral-700 dark:bg-[#292c33] dark:shadow-black/30">
      {options.map((option) => <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={value === option.value}
        onClick={() => { onChange(option.value); onToggle(false); }}
        className={`block w-full cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition ${value === option.value ? 'bg-amber-400/15 font-semibold text-amber-700 dark:text-amber-300' : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700/70'}`}
      >{option.label}</button>)}
    </div>}
  </div>;
}
