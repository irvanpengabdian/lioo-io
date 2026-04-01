'use client';

import { useState } from 'react';
import type { CartItem, OrderMode } from '../../lib/types';
import { formatRupiah } from '../../lib/types';

type Totals = { subtotal: number; tax: number; grandTotal: number };
type DeliveryType = 'TAKEAWAY' | 'DELIVERY';

type CheckoutPayload = {
  orderMode: OrderMode;
  customerName?: string;
  customerPhone?: string;
  deliveryType?: DeliveryType;
  deliveryAddress?: string;
};

type Props = {
  cart: CartItem[];
  totals: Totals;
  mode: 'dine-in' | 'takeaway';
  tableLabel?: string;
  onUpdateQty: (key: string, delta: number) => void;
  onClose: () => void;
  onSubmit: (payload: CheckoutPayload) => Promise<void>;
  isPending: boolean;
  error: string | null;
};

export default function CartDrawer({
  cart, totals, mode, tableLabel, onUpdateQty, onClose, onSubmit, isPending, error,
}: Props) {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Form fields
  const [customerName, setCustomerName]     = useState('');
  const [customerPhone, setCustomerPhone]   = useState('');
  const [deliveryType, setDeliveryType]     = useState<DeliveryType>('TAKEAWAY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [formError, setFormError]           = useState<string | null>(null);

  const isTakeaway = mode === 'takeaway';

  function validate(): string | null {
    if (isTakeaway && !customerPhone.trim()) return 'Nomor HP wajib diisi agar kami bisa menghubungimu.';
    if (isTakeaway && deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      return 'Alamat pengiriman wajib diisi.';
    }
    return null;
  }

  async function handleSubmit(orderMode: OrderMode) {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError(null);
    await onSubmit({
      orderMode,
      customerName: customerName.trim() || undefined,
      customerPhone: isTakeaway ? customerPhone.trim() : undefined,
      deliveryType: isTakeaway ? deliveryType : undefined,
      deliveryAddress: (isTakeaway && deliveryType === 'DELIVERY') ? deliveryAddress.trim() : undefined,
    });
  }

  // ── CHECKOUT STEP ──────────────────────────────────────────────────────────
  if (step === 'checkout') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-xl">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-[#D5D9CE] rounded-full" />
          </div>

          <div className="overflow-y-auto flex-1 px-5 pb-4">
            {/* Back + Title */}
            <div className="flex items-center gap-3 py-3 mb-4">
              <button onClick={() => setStep('cart')} className="p-1.5 rounded-full hover:bg-[#F3F4EF]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#43493E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h3 className="text-base font-bold text-[#1A1C19]">Konfirmasi Pesanan</h3>
            </div>

            {/* Context badge */}
            {mode === 'dine-in' ? (
              <div className="bg-[#F3F4EF] rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                <span className="text-2xl">🪑</span>
                <div>
                  <p className="text-xs text-[#787868] font-semibold uppercase tracking-wide">Dine In</p>
                  {tableLabel && <p className="text-sm font-bold text-[#1A1C19]">Meja: {tableLabel}</p>}
                </div>
              </div>
            ) : (
              /* Takeaway: pilih tipe pesanan */
              <div className="mb-4">
                <p className="text-xs font-bold text-[#43493E] uppercase tracking-wider mb-2">Tipe Pesanan</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryType('TAKEAWAY')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      deliveryType === 'TAKEAWAY'
                        ? 'border-[#2C4F1B] bg-[#F7F9F5]'
                        : 'border-[#E8EBE4] hover:border-[#B5C4AD]'
                    }`}
                  >
                    <span className="text-xl">🛍️</span>
                    <span className="text-xs font-bold text-[#1A1C19]">Ambil Sendiri</span>
                    <span className="text-[10px] text-[#787868]">Pickup di toko</span>
                  </button>
                  <button
                    onClick={() => setDeliveryType('DELIVERY')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      deliveryType === 'DELIVERY'
                        ? 'border-[#2C4F1B] bg-[#F7F9F5]'
                        : 'border-[#E8EBE4] hover:border-[#B5C4AD]'
                    }`}
                  >
                    <span className="text-xl">🛵</span>
                    <span className="text-xs font-bold text-[#1A1C19]">Diantar</span>
                    <span className="text-[10px] text-[#787868]">Ke alamatmu</span>
                  </button>
                </div>
              </div>
            )}

            {/* Customer info */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#43493E] mb-1.5">
                  Nama {mode === 'dine-in' ? '(opsional)' : '(opsional — untuk panggilan)'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Mis: Budi"
                  className="w-full px-3 py-2.5 border border-[#D5D9CE] rounded-xl text-sm focus:outline-none focus:border-[#2C4F1B]"
                />
              </div>

              {isTakeaway && (
                <div>
                  <label className="block text-xs font-semibold text-[#43493E] mb-1.5">
                    Nomor HP <span className="text-red-500">*</span>
                    <span className="font-normal text-[#787868] ml-1">— untuk notifikasi pesanan</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={customerPhone}
                    onChange={(e) => { setCustomerPhone(e.target.value); setFormError(null); }}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2.5 border border-[#D5D9CE] rounded-xl text-sm focus:outline-none focus:border-[#2C4F1B]"
                  />
                </div>
              )}

              {isTakeaway && deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-xs font-semibold text-[#43493E] mb-1.5">
                    Alamat Pengiriman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => { setDeliveryAddress(e.target.value); setFormError(null); }}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kota…"
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D5D9CE] rounded-xl text-sm resize-none focus:outline-none focus:border-[#2C4F1B]"
                  />
                  <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5">🛵</span>
                    <p className="text-[10px] text-amber-700">
                      Layanan pengiriman via Grab/Gojek akan segera aktif. Saat ini pesananmu akan dikonfirmasi
                      oleh merchant dan dihubungi via nomor HP untuk koordinasi pengiriman.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border border-[#E8EBE4] rounded-2xl divide-y divide-[#E8EBE4] text-sm mb-4">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-[#787868]">Subtotal</span>
                <span>{formatRupiah(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-[#787868]">PPN 11%</span>
                <span>{formatRupiah(totals.tax)}</span>
              </div>
              {isTakeaway && deliveryType === 'DELIVERY' && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-[#787868]">Ongkos kirim</span>
                  <span className="text-[#787868] italic text-xs">dikonfirmasi merchant</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 font-bold">
                <span className="text-[#1A1C19]">Total</span>
                <span className="text-[#2C4F1B] text-base">{formatRupiah(totals.grandTotal)}</span>
              </div>
            </div>

            {(formError || error) && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-3">
                {formError || error}
              </p>
            )}

            {/* Payment mode buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSubmit('PAY_NOW')}
                disabled={isPending}
                className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-2xl p-4 flex items-center gap-3 disabled:opacity-50 text-left"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
                    <rect x="13" y="3" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
                    <rect x="3" y="13" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
                    <path d="M13 17h2m2 0h2M13 13h2m4 0v2m0 2v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm">Bayar Sekarang (QRIS)</p>
                  <p className="text-xs opacity-80">Scan QR lalu bayar via e-wallet / m-banking</p>
                </div>
              </button>

              <button
                onClick={() => handleSubmit('PAY_AT_COUNTER')}
                disabled={isPending}
                className="w-full border-2 border-[#D5D9CE] bg-white rounded-2xl p-4 flex items-center gap-3 disabled:opacity-50 text-left hover:border-[#2C4F1B] transition-colors"
              >
                <div className="w-10 h-10 bg-[#F3F4EF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="6" width="20" height="13" rx="2" stroke="#2C4F1B" strokeWidth="2" />
                    <path d="M12 10v5M10 12h4" stroke="#2C4F1B" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1A1C19]">
                    {mode === 'dine-in' ? 'Bayar di Kasir' : 'Konfirmasi ke Kasir'}
                  </p>
                  <p className="text-xs text-[#787868]">
                    {mode === 'dine-in'
                      ? 'Tunjukkan kode ke kasir saat membayar'
                      : 'Kasir akan proses dan konfirmasi pesananmu'}
                  </p>
                </div>
              </button>
            </div>

            {isPending && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#787868]">
                <div className="w-4 h-4 border-2 border-[#2C4F1B] border-t-transparent rounded-full animate-spin" />
                Memproses pesanan…
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── CART VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D5D9CE] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EDEEE9]">
          <h3 className="text-base font-bold text-[#1A1C19]">Keranjang</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F3F4EF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#43493E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
          {cart.map((item) => (
            <div key={item.cartKey} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1C19] truncate">{item.productName}</p>
                {item.selectedModifiers.length > 0 && (
                  <p className="text-xs text-[#787868] truncate">
                    {item.selectedModifiers.map((m) => m.name).join(', ')}
                  </p>
                )}
                <p className="text-xs font-bold text-[#2C4F1B]">{formatRupiah(item.subtotal)}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F3F4EF] rounded-full px-1.5 py-0.5">
                <button
                  onClick={() => onUpdateQty(item.cartKey, -1)}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#2C4F1B] font-bold shadow-sm text-sm"
                >
                  −
                </button>
                <span className="w-4 text-center text-sm font-bold text-[#1A1C19]">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.cartKey, 1)}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#2C4F1B] font-bold shadow-sm text-sm"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-[#EDEEE9]">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-[#787868]">Total ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
            <span className="font-bold text-[#2C4F1B] text-base">{formatRupiah(totals.grandTotal)}</span>
          </div>
          <button
            onClick={() => setStep('checkout')}
            className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full py-3.5 font-bold text-sm shadow-md"
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
