'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'today';

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', value);
    router.push(`?${params.toString()}`);
  };

  const getBtnClass = (value: string) => {
    return currentFilter === value
      ? "px-5 py-2 text-sm font-semibold rounded-full bg-surface-container-lowest text-primary shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      : "px-5 py-2 text-sm font-semibold rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer";
  };

  return (
    <div className="flex bg-surface-container-low p-1.5 rounded-full border border-outline-variant/20 shadow-sm overflow-x-auto no-scrollbar">
      <button onClick={() => setFilter('today')} className={getBtnClass('today')}>
        Today
      </button>
      <button onClick={() => setFilter('yesterday')} className={getBtnClass('yesterday')}>
        Yesterday
      </button>
      <button onClick={() => setFilter('7days')} className={getBtnClass('7days')}>
        Last 7 Days
      </button>
      <button onClick={() => setFilter('30days')} className={getBtnClass('30days')}>
        1 Bulan
      </button>
      {/* Date Range Place holder */}
      <button onClick={() => setFilter('range')} className={getBtnClass('range')}>
        Range Tanggal
      </button>
    </div>
  );
}
