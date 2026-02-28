'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export default function CustomSelect({ value, onChange, options, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        <span>{selected?.label ?? value}</span>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden py-1">
          {options.map(opt => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${
                opt.value === value
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              {opt.value === value && (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className={opt.value === value ? '' : 'ml-5'}>{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
