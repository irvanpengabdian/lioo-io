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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-[#EDEEE9]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1A1C19]">Keranjang</h2>
          {!isEmpty && (
            <span className="text-xs text-[#787868]">{totals.itemCount} item</span>
          )}
        </div>

        {/* Order type selector */}
        <div className="flex bg-[#F3F4EF] rounded-2xl p-1 gap-1">
          {(['DINE_IN', 'TAKEAWAY'] as OrderType[]).map((type) => (
            <button
              key={type}
              onClick={() => onSetOrderType(type)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                cart.orderType === type
                  ? 'bg-white text-[#2C4F1B] shadow-sm'
                  : 'text-[#787868] hover:text-[#43493E]'
              }`}
            >
              {type === 'DINE_IN' ? '🪑 Dine-in' : '🛍️ Takeaway'}
            </button>
          ))}
        </div>

        {/* Table selector for dine-in */}
        {cart.orderType === 'DINE_IN' && tables.length > 0 && (
          <div className="mt-2">
            <select
              value={cart.tableId ?? ''}
              onChange={(e) => {
                const table = tables.find((t) => t.id === e.target.value);
                if (table) onSetTable(table.id, table.label);
              }}
              className="w-full bg-[#F3F4EF] rounded-xl px-3 py-2 text-xs font-medium text-[#1A1C19] focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/30"
            >
              <option value="">— Pilih meja —</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 bg-[#FDE8E8] rounded-2xl text-xs text-[#B91C1C] font-medium flex items-start gap-2">
          <span className="flex-1">{error}</span>
          <button onClick={onClearError} className="flex-shrink-0 text-[#B91C1C]/60 hover:text-[#B91C1C]">✕</button>
        </div>
      )}

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <p className="text-4xl mb-3">🧺</p>
            <p className="text-sm font-semibold text-[#43493E]">Keranjang kosong</p>
            <p className="text-xs text-[#787868] mt-1">Tap menu di sebelah kiri untuk menambah</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.cartKey}
                item={item}
                onRemove={onRemove}
                onUpdateQty={onUpdateQty}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary + checkout */}
      {!isEmpty && (
        <div className="border-t border-[#EDEEE9] px-4 py-3 space-y-1.5">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-[#787868]">
            <span>Subtotal</span>
            <span className="font-medium text-[#43493E]">{formatRupiah(totals.subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="flex justify-between items-center text-xs text-[#787868]">
            <button
              onClick={() => { setShowDiscount(!showDiscount); setDiscountInput(String(cart.discountPercent)); }}
              className="flex items-center gap-1 hover:text-[#2C4F1B] transition-colors"
            >
              <span>Diskon {cart.discountPercent > 0 ? `(${cart.discountPercent}%)` : ''}</span>
              <span className="text-[10px]">{showDiscount ? '▲' : '▼'}</span>
            </button>
            {totals.discountAmount > 0 && (
              <span className="font-medium text-[#B91C1C]">−{formatRupiah(totals.discountAmount)}</span>
            )}
          </div>

          {showDiscount && (
            <div className="flex items-center gap-2 py-1">
              <input
                type="number"
                min={0}
                max={100}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
                placeholder="0"
                className="flex-1 bg-[#F3F4EF] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/30"
              />
              <span className="text-xs text-[#787868]">%</span>
              <button
                onClick={applyDiscount}
                className="bg-[#2C4F1B] text-white text-xs px-3 py-1.5 rounded-xl font-semibold"
              >
                OK
              </button>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between text-xs text-[#787868]">
            <span>PPN ({cart.taxPercent}%)</span>
            <span className="font-medium text-[#43493E]">{formatRupiah(totals.taxAmount)}</span>
          </div>

          {/* Grand total */}
          <div className="flex justify-between items-center pt-1 border-t border-[#EDEEE9] mt-1">
            <span className="text-sm font-bold text-[#1A1C19]">Total</span>
            <span className="text-lg font-bold text-[#2C4F1B]">{formatRupiah(totals.grandTotal)}</span>
          </div>

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="w-full mt-2 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white py-3.5 rounded-full font-bold text-sm shadow-md disabled:opacity-60 active:scale-98 transition-all"
          >
            {isPending ? 'Memproses...' : `Buat Pesanan · ${formatRupiah(totals.grandTotal)}`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Cart item row
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
    <div className="bg-[#F9FAF5] rounded-2xl px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#1A1C19] truncate">{item.productName}</p>
          {item.selectedModifiers.length > 0 && (
            <p className="text-[10px] text-[#787868] leading-tight mt-0.5 truncate">
              {item.selectedModifiers.map((m) => m.name).join(', ')}
            </p>
          )}
          {item.specialInstructions && (
            <p className="text-[10px] text-[#B35900] italic leading-tight mt-0.5 truncate">
              "{item.specialInstructions}"
            </p>
          )}
        </div>
        <p className="text-xs font-bold text-[#2C4F1B] flex-shrink-0">{formatRupiah(item.subtotal)}</p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 bg-white rounded-xl p-0.5 shadow-sm">
          <button
            onClick={() => onUpdateQty(item.cartKey, -1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-[#787868] hover:bg-[#F3F4EF] transition-colors"
          >
            −
          </button>
          <span className="w-6 text-center text-xs font-bold text-[#1A1C19]">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.cartKey, 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-[#2C4F1B] hover:bg-[#E8F5E2] transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-[10px] text-[#787868]">{formatRupiah(item.unitPrice)} / item</p>
        <button
          onClick={() => onRemove(item.cartKey)}
          className="text-[#787868] hover:text-[#B91C1C] transition-colors p-1"
        >
          <span className="text-sm">🗑</span>
        </button>
      </div>
    </div>
  );
}
