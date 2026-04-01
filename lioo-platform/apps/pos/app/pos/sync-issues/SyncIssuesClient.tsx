'use client';

import { useState, useEffect } from 'react';
import { getPOSDb, updateOrderStatus, type OfflineOrder } from '../../../lib/db';
import { formatRupiah } from '../../../lib/types';
import Link from 'next/link';

export default function SyncIssuesClient({ tenantId }: { tenantId: string }) {
  const [orders, setOrders] = useState<OfflineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const db = getPOSDb();
      const all = await db.orders
        .where('tenantId')
        .equals(tenantId)
        .filter((o) => o.status === 'CONFLICT' || o.status === 'FAILED')
        .toArray();
      // Urutkan dari terbaru
      all.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tenantId]);

  async function handleDiscard(offlineId: string) {
    if (!confirm('Hapus pesanan ini dari antrian lokal? Pesanan tidak akan dikirim ke server.')) return;
    await updateOrderStatus(offlineId, { status: 'FAILED', errorMessage: 'Dihapus manual oleh kasir' });
    // Hapus permanen dari Dexie
    const db = getPOSDb();
    await db.orders.where('offlineId').equals(offlineId).delete();
    await load();
  }

  async function handleRetry(offlineId: string) {
    await updateOrderStatus(offlineId, {
      status: 'PENDING',
      errorMessage: undefined,
      syncAttempts: 0,
    });
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-[#2C4F1B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-semibold text-[#1A1C19]">Tidak ada pesanan bermasalah</p>
        <p className="text-xs text-[#787868] mt-1">Semua pesanan sudah tersinkronkan ke server.</p>
        <Link
          href="/pos"
          className="inline-block mt-5 px-5 py-2.5 bg-[#2C4F1B] text-white text-sm font-bold rounded-full"
        >
          Kembali ke Kasir
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.offlineId}
          className={`bg-white rounded-2xl overflow-hidden shadow-sm border-l-4 ${
            order.status === 'CONFLICT' ? 'border-red-500' : 'border-orange-400'
          }`}
        >
          <div className="px-4 py-3 border-b border-[#EDEEE9] flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'CONFLICT'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {order.status === 'CONFLICT' ? 'KONFLIK' : 'GAGAL'}
                </span>
                <span className="text-xs text-[#787868]">
                  {new Date(order.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <p className="text-xs text-[#787868] mt-1.5 bg-red-50 rounded-lg px-3 py-1.5 border border-red-100">
                {order.errorMessage ?? 'Tidak ada keterangan error'}
              </p>
            </div>
            <span className="text-sm font-bold text-[#2C4F1B] flex-shrink-0">
              {formatRupiah(order.grandTotal)}
            </span>
          </div>

          {/* Items */}
          <div className="px-4 py-2 space-y-0.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-[#43493E]">{item.quantity}× {item.productName}</span>
                <span className="text-[#787868]">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-4 py-2.5 bg-[#F9FAF5] border-t border-[#EDEEE9] flex gap-2 justify-end">
            <button
              onClick={() => handleDiscard(order.offlineId)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D5D9CE] text-[#787868] hover:border-red-400 hover:text-red-600 transition-colors"
            >
              Hapus
            </button>
            {order.status === 'FAILED' && (
              <button
                onClick={() => handleRetry(order.offlineId)}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#2C4F1B] text-white hover:opacity-90 transition-opacity"
              >
                Coba Ulang
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
