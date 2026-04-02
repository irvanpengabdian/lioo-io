'use client';

import { useState } from 'react';
import type { CartState, CartItem, TableOption, OrderType } from '../../../lib/types';
import { formatRupiah } from '../../../lib/types';
import PaymentFlow, { type PaymentOrderSummary } from './PaymentFlow';

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
  onCustomerNameChange: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
  onClearError: () => void;
  /** Pembayaran inline di sidebar (setelah kirim pesanan online) */
  paymentOrder: PaymentOrderSummary | null;
  onPaymentClose: () => void;
  onPaymentDone: () => void;
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
  onCustomerNameChange,
  onSubmit,
  isPending,
  error,
  onClearError,
  paymentOrder,
  onPaymentClose,
  onPaymentDone,
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
    <div className="pos-cart">
      <div className="pos-cart-header">
        <div className="pos-cart-header-top">
          <h3 className="pos-cart-title">Active Order</h3>
          {!isEmpty && <span className="pos-cart-count">{totals.itemCount} item</span>}
        </div>

        <div className="pos-order-type">
          {(['DINE_IN', 'TAKEAWAY'] as OrderType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSetOrderType(type)}
              className={`pos-order-type-btn ${
                cart.orderType === type ? 'pos-order-type-btn--active' : 'pos-order-type-btn--inactive'
              }`}
            >
              {type === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
            </button>
          ))}
        </div>

        {cart.orderType === 'DINE_IN' && tables.length > 0 && (
          <select
            value={cart.tableId ?? ''}
            onChange={(e) => {
              const table = tables.find((t) => t.id === e.target.value);
              if (table) onSetTable(table.id, table.label);
            }}
            className="pos-table-select"
          >
            <option value="">— Pilih meja —</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        )}

        {!paymentOrder && (
          <div className="mt-2">
            <label className="text-[10px] font-bold text-[#787868] uppercase tracking-wide block mb-1">
              Nama pelanggan <span className="font-normal normal-case text-[#A8A89A]">(opsional)</span>
            </label>
            <input
              type="text"
              value={cart.customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Contoh: Budi"
              className="w-full text-sm rounded-xl px-3 py-2 border border-[#D5D9CE] bg-white focus:outline-none focus:border-[#2C4F1B]"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="pos-error-banner">
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', flexShrink: 0, marginTop: '0.0625rem' }}>
            error
          </span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={onClearError}
            style={{ flexShrink: 0, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              close
            </span>
          </button>
        </div>
      )}

      <div className="pos-cart-items no-scrollbar">
        {isEmpty && !paymentOrder ? (
          <div className="pos-cart-empty">
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-surface-highest)', marginBottom: '1rem' }}>
              shopping_basket
            </span>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', margin: 0 }}>Keranjang kosong</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', marginTop: '0.25rem' }}>Pilih menu di sebelah kiri</p>
          </div>
        ) : isEmpty && paymentOrder ? (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <span className="material-symbols-outlined text-3xl text-[#2C4F1B] mb-2">payments</span>
            <p className="text-xs font-semibold text-[#43493E] m-0">Selesaikan pembayaran di bawah</p>
            <p className="text-[11px] text-[#787868] m-0 mt-1">{paymentOrder.orderNumber}</p>
          </div>
        ) : (
          cart.items.map((item) => (
            <CartItemRow key={item.cartKey} item={item} onRemove={onRemove} onUpdateQty={onUpdateQty} />
          ))
        )}
      </div>

      {paymentOrder && (
        <div className="pos-cart-payment-embed no-scrollbar border-t border-[#E0E4DA] bg-[#FAFAF8] p-3 flex flex-col min-h-0 max-h-[55vh] overflow-y-auto shrink-0">
          <PaymentFlow
            key={paymentOrder.id}
            order={paymentOrder}
            onClose={onPaymentClose}
            onPaid={() => onPaymentDone()}
            variant="sidebar"
          />
        </div>
      )}

      {!isEmpty && !paymentOrder && (
        <div className="pos-cart-summary">
          <div className="pos-summary-row">
            <span>Subtotal</span>
            <span style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>{formatRupiah(totals.subtotal)}</span>
          </div>

          <div className="pos-summary-row">
            <button
              type="button"
              onClick={() => {
                setShowDiscount(!showDiscount);
                setDiscountInput(String(cart.discountPercent));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--color-on-surface-variant)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                transition: 'color 150ms ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                sell
              </span>
              <span>Diskon {cart.discountPercent > 0 ? `(${cart.discountPercent}%)` : ''}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                {showDiscount ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {totals.discountAmount > 0 && (
              <span style={{ fontWeight: 500, color: '#DC2626' }}>−{formatRupiah(totals.discountAmount)}</span>
            )}
          </div>

          {showDiscount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min={0}
                max={100}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
                placeholder="0"
                style={{
                  flex: 1,
                  background: 'var(--color-surface-white)',
                  borderRadius: '9999px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(195,201,186,0.4)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-outline)' }}>%</span>
              <button
                type="button"
                onClick={applyDiscount}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                OK
              </button>
            </div>
          )}

          <div className="pos-summary-row">
            <span>PPN ({cart.taxPercent}%)</span>
            <span style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>{formatRupiah(totals.taxAmount)}</span>
          </div>

          <div className="pos-summary-total-row">
            <span className="pos-summary-total-label">Total</span>
            <span className="pos-summary-total-value">{formatRupiah(totals.grandTotal)}</span>
          </div>

          <button type="button" onClick={onSubmit} disabled={isPending} className="pos-cta-btn sage-gradient">
            {isPending ? (
              <>
                <div
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '9999px',
                  }}
                  className="animate-spin"
                />
                Memproses…
              </>
            ) : (
              <>
                Kirim pesanan
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                  send
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Batalkan semua item di keranjang?')) {
                cart.items.forEach((i) => onRemove(i.cartKey));
              }
            }}
            className="pos-secondary-btn pos-secondary-btn--void"
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            Kosongkan keranjang
          </button>
        </div>
      )}
    </div>
  );
}

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
    <div className="pos-cart-item">
      <div className="pos-cart-item-top">
        <div>
          <h4 style={{ fontWeight: 700, color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.35 }}>{item.productName}</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.125rem' }}>Qty: {item.quantity}</p>
        </div>
        <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', flexShrink: 0 }}>{formatRupiah(item.subtotal)}</span>
      </div>

      {item.selectedModifiers.length > 0 && (
        <div className="pos-cart-modifier-chips">
          {item.selectedModifiers.map((m) => (
            <span key={m.name} className="pos-modifier-chip">
              {m.name}
            </span>
          ))}
        </div>
      )}

      {item.specialInstructions && (
        <p style={{ fontSize: '0.75rem', color: '#B35900', fontStyle: 'italic' }}>&quot;{item.specialInstructions}&quot;</p>
      )}

      <div className="pos-cart-controls">
        <div className="pos-qty-stepper">
          <button type="button" onClick={() => onUpdateQty(item.cartKey, -1)} className="pos-qty-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              remove
            </span>
          </button>
          <span className="pos-qty-value">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQty(item.cartKey, 1)}
            className="pos-qty-btn"
            style={{ color: 'var(--color-primary)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              add
            </span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-outline)' }}>{formatRupiah(item.unitPrice)} / item</p>
          <button
            type="button"
            onClick={() => onRemove(item.cartKey)}
            style={{
              color: 'var(--color-outline)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-outline)')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
