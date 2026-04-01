'use client';

import { useState } from 'react';
import type { CartState, CartItem, TableOption, OrderType } from '../../../lib/types';
import { formatRupiah } from '../../../lib/types';

type Totals = {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  itemCount: number;
};

type Props = {
  cart: CartState;
  totals: Totals;
  tables: TableOption[];
  onRemove: (cartKey: string) => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onSetOrderType: (t: OrderType) => void;
  onSetTable: (id: string, label: string) => void;
  onSetDiscount: (v: number) => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
  onClearError: () => void;
};

export default function CartPanel({
  cart,
  totals,
  tables,
  onRemove,
  onUpdateQty,
  onSetOrderType,
  onSetTable,
  onSetDiscount,
  onSubmit,
  isPending,
  error,
  onClearError,
}: Props) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState('0');

  function applyDiscount() {
    const v = Math.min(100, Math.max(0, Number(discountInput) || 0));
    onSetDiscount(v);
    setDiscountInput(String(v));
    setShowDiscount(false);
  }

  const isEmpty = cart.items.length === 0;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-stone-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl tracking-tight text-[#1A1C19]">Pesanan Aktif</h3>
          {!isEmpty && (
            <span className="bg-[#F3F4EF] text-[#43493E] text-[11px] font-bold px-3 py-1 rounded-full">
              {totals.itemCount} item
            </span>
          )}
        </div>

        {/* Order type selector */}
        <div className="flex bg-[#F3F4EF] rounded-full p-1 gap-1">
          {(['DINE_IN', 'TAKEAWAY'] as OrderType[]).map((type) => (
            <button
              key={type}
              onClick={() => onSetOrderType(type)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                cart.orderType === type
                  ? 'bg-white text-[#2C4F1B] shadow-sm'
                  : 'text-[#787868] hover:text-[#43493E]'
              }`}
            >
              {type === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
            </button>
          ))}
        </div>

        {/* Table selector for dine-in */}
        {cart.orderType === 'DINE_IN' && tables.length > 0 && (
          <div className="mt-3">
            <select
              value={cart.tableId ?? ''}
              onChange={(e) => {
                const table = tables.find((t) => t.id === e.target.value);
                if (table) onSetTable(table.id, table.label);
              }}
              className="w-full bg-[#F3F4EF] border-none rounded-full px-5 py-2.5 text-sm font-medium text-[#1A1C19] focus:outline-none focus:ring-2 focus:ring-[#2C4F1B]/20 appearance-none cursor-pointer"
            >
              <option value="">— Pilih meja —</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-50 rounded-[1rem] text-sm text-red-700 font-medium flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={onClearError} className="flex-shrink-0 text-red-400 hover:text-red-700 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* ── Cart items ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar space-y-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <span className="material-symbols-outlined text-5xl text-stone-200 mb-4">shopping_basket</span>
            <p className="text-sm font-semibold text-[#43493E]">Keranjang kosong</p>
            <p className="text-xs text-[#787868] mt-1">Pilih menu di sebelah kiri untuk menambah</p>
          </div>
        ) : (
          cart.items.map((item) => (
            <CartItemRow key={item.cartKey} item={item} onRemove={onRemove} onUpdateQty={onUpdateQty} />
          ))
        )}
      </div>

      {/* ── Summary + checkout ── */}
      {!isEmpty && (
        <div className="px-6 py-5 bg-[#F9FAF5]/50 border-t border-stone-100 space-y-3">

          {/* Row: subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#43493E]">Subtotal</span>
            <span className="font-medium text-[#1A1C19]">{formatRupiah(totals.subtotal)}</span>
          </div>

          {/* Row: discount (toggle) */}
          <div className="flex justify-between items-center text-sm">
            <button
              onClick={() => { setShowDiscount(!showDiscount); setDiscountInput(String(cart.discountPercent)); }}
              className="flex items-center gap-1.5 text-[#43493E] hover:text-[#2C4F1B] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">sell</span>
              <span>Diskon {cart.discountPercent > 0 ? `(${cart.discountPercent}%)` : ''}</span>
              <span className="material-symbols-outlined text-[14px]">{showDiscount ? 'expand_less' : 'expand_more'}</span>
            </button>
            {totals.discountAmount > 0 && (
              <span className="font-medium text-red-600">−{formatRupiah(totals.discountAmount)}</span>
            )}
          </div>

          {showDiscount && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
                placeholder="0"
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm border border-[#C3C9BA]/30 focus:outline-none focus:ring-2 focus:ring-[#2C4F1B]/20"
              />
              <span className="text-sm text-[#787868]">%</span>
              <button
                onClick={applyDiscount}
                className="bg-[#2C4F1B] text-white text-sm px-5 py-2 rounded-full font-semibold hover:bg-[#436831] transition-colors"
              >
                OK
              </button>
            </div>
          )}

          {/* Row: tax */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#43493E]">PPN ({cart.taxPercent}%)</span>
            <span className="font-medium text-[#1A1C19]">{formatRupiah(totals.taxAmount)}</span>
          </div>

          {/* Row: grand total */}
          <div className="flex justify-between items-center pt-2 border-t border-stone-200">
            <span className="font-bold text-lg text-[#1A1C19]">Total</span>
            <span className="font-extrabold text-2xl text-[#2C4F1B]">{formatRupiah(totals.grandTotal)}</span>
          </div>

          {/* CTA button */}
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="w-full sage-gradient text-white py-5 rounded-full font-bold text-lg shadow-lg disabled:opacity-60 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses…
              </>
            ) : (
              <>
                Selesaikan Pembayaran
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </>
            )}
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button className="bg-white border border-[#C3C9BA]/40 py-3 rounded-full text-xs font-bold text-[#43493E] uppercase tracking-wider hover:bg-stone-50 transition-colors">
              Simpan
            </button>
            <button
              onClick={() => {
                if (confirm('Batalkan semua item di keranjang?')) {
                  cart.items.forEach((i) => onRemove(i.cartKey));
                }
              }}
              className="bg-red-50 py-3 rounded-full text-xs font-bold text-red-600 uppercase tracking-wider hover:bg-red-100 transition-colors"
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Cart item row — editorial style
// ─────────────────────────────────────────────

function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: (k: string) => void;
  onUpdateQty: (k: string, d: number) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Name + price */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-bold text-[#1A1C19] leading-snug">{item.productName}</h4>
          <p className="text-xs text-[#43493E] mt-0.5">Qty: {item.quantity}</p>
        </div>
        <span className="font-semibold text-[#1A1C19] flex-shrink-0">{formatRupiah(item.subtotal)}</span>
      </div>

      {/* Modifier chips */}
      {item.selectedModifiers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.selectedModifiers.map((m) => (
            <span
              key={m.name}
              className="px-3 py-1 bg-[#BBEDA6] text-[10px] font-bold text-[#2C4F1B] rounded-full uppercase tracking-tight"
            >
              {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Special instructions */}
      {item.specialInstructions && (
        <p className="text-xs text-[#B35900] italic">"{item.specialInstructions}"</p>
      )}

      {/* Qty controls + delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#F3F4EF] rounded-full p-1">
          <button
            onClick={() => onUpdateQty(item.cartKey, -1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#787868] hover:bg-white hover:text-[#1A1C19] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="w-8 text-center text-sm font-bold text-[#1A1C19]">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.cartKey, 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#2C4F1B] hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-[#787868]">{formatRupiah(item.unitPrice)} / item</p>
          <button
            onClick={() => onRemove(item.cartKey)}
            className="text-[#787868] hover:text-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
