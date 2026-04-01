'use client';

import type { SyncState } from '../../lib/use-sync';

type Props = {
  syncState: SyncState;
  onSyncNow: () => void;
};

export default function SyncStatusBar({ syncState, onSyncNow }: Props) {
  const { isSyncing, pendingCount, failedCount, conflictCount, lastSyncAt, lastError } = syncState;

  const totalIssues = pendingCount + failedCount + conflictCount;
  if (totalIssues === 0 && !isSyncing) return null;

  return (
    <div
      className={`px-4 py-2 flex items-center justify-between gap-2 text-xs border-b ${
        conflictCount > 0
          ? 'bg-red-50 border-red-200 text-red-700'
          : failedCount > 0
          ? 'bg-orange-50 border-orange-200 text-orange-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isSyncing ? (
          <>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span>Menyinkronkan {pendingCount} pesanan ke server…</span>
          </>
        ) : conflictCount > 0 ? (
          <>
            <span className="text-base flex-shrink-0">⚠️</span>
            <span>
              {conflictCount} pesanan memiliki konflik data.{' '}
              <a href="/pos/sync-issues" className="underline font-semibold">
                Lihat detail
              </a>
            </span>
          </>
        ) : failedCount > 0 ? (
          <>
            <span className="text-base flex-shrink-0">⚠️</span>
            <span>{failedCount} pesanan gagal dikirim</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <span className="text-base flex-shrink-0">🕐</span>
            <span>{pendingCount} pesanan menunggu koneksi</span>
          </>
        ) : null}

        {lastError && !isSyncing && (
          <span className="text-[10px] opacity-70 truncate hidden sm:block">— {lastError}</span>
        )}
      </div>

      {!isSyncing && (failedCount > 0 || pendingCount > 0) && syncState.isOnline && (
        <button
          onClick={onSyncNow}
          className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border border-current hover:bg-current hover:bg-opacity-10 transition-colors"
        >
          Coba lagi
        </button>
      )}

      {lastSyncAt && !isSyncing && pendingCount === 0 && failedCount === 0 && (
        <span className="flex-shrink-0 text-[10px] opacity-60">
          Tersinkron{' '}
          {new Date(lastSyncAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
}
