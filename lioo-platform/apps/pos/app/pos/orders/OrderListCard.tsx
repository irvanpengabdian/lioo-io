'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '../../../lib/types';
import { updatePosOrderCustomerName, updatePosOrderItemLine } from '../../actions/order-edits';
import OrderPayButton from './OrderPayButton';

type BadgeStyle = { label: string; bg: string; text: string };

const STATUS_STYLE: Record<string, BadgeStyle> = {
  PENDING: { label: 'Menunggu', bg: 'bg-[#FFF8E1]', text: 'text-[#B35900]' },
  CONFIRMED: { label: 'Dikonfirmasi', bg: 'bg-[#EEF2FF]', text: 'text-[#4338CA]' },
  PREPARING: { label: 'Diproses', bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]' },
  READY: { label: 'Siap', bg: 'bg-[#E8F5E2]', text: 'text-[#2C6B1A]' },
  SERVED: { label: 'Disajikan', bg: 'bg-[#E8F5E2]', text: 'text-[#2C6B1A]' },
  COMPLETED: { label: 'Selesai', bg: 'bg-[#EDEEE9]', text: 'text-[#43493E]' },
  CANCELLED: { label: 'Dibatalkan', bg: 'bg-[#FDE8E8]', text: 'text-[#B91C1C]' },
};

const PAYMENT_STYLE: Record<string, BadgeStyle> = {
  UNPAID: { label: 'Belum Bayar', bg: 'bg-[#FDE8E8]', text: 'text-[#B91C1C]' },
  PARTIAL: { label: 'Sebagian', bg: 'bg-[#FFF8E1]', text: 'text-[#B35900]' },
  PAID: { label: 'Lunas', bg: 'bg-[#E8F5E2]', text: 'text-[#2C6B1A]' },
};

const DEFAULT_STATUS: BadgeStyle = { label: 'Menunggu', bg: 'bg-[#FFF8E1]', text: 'text-[#B35900]' };
const DEFAULT_PAYMENT: BadgeStyle = { label: 'Belum Bayar', bg: 'bg-[#FDE8E8]', text: 'text-[#B91C1C]' };

export type OrderListCardModifier = { name?: string };
export type OrderListCardItem = {
  id: string;
  productName: string;
  quantity: number;
  subtotal: number;
  unitPrice: number;
  selectedModifiers?: OrderListCardModifier[] | null;
  specialInstructions?: string | null;
};

export type OrderListCardOrder = {
  id: string;
  orderNumber: string;
  orderType: string;
  source: string;
  tableNumber: string | null;
  customerName: string | null;
  publicOrderCode: string | null;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  orderItems: OrderListCardItem[];
};

type Props = { order: OrderListCardOrder };

export default function OrderListCard({ order }: Props) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [customerName, setCustomerName] = useState(order.customerName ?? '');
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setCustomerName(order.customerName ?? '');
  }, [order.customerName]);

  const statusStyle = STATUS_STYLE[order.status] ?? DEFAULT_STATUS;
  const payStyle = PAYMENT_STYLE[order.paymentStatus] ?? DEFAULT_PAYMENT;
  const isCustomer = order.source === 'CUSTOMER_APP';
  const canEdit = order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED';

  function saveCustomer() {
    setMsg(null);
    startTransition(async () => {
      const r = await updatePosOrderCustomerName(order.id, customerName || null);
      if (!r.success) setMsg(r.error);
      else router.refresh();
    });
  }

  function saveLine(itemId: string, quantity: number, note: string) {
    setMsg(null);
    startTransition(async () => {
      const r = await updatePosOrderItemLine({
        orderItemId: itemId,
        orderId: order.id,
        quantity: order.source === 'CASHIER' ? quantity : undefined,
        specialInstructions: note,
      });
      if (!r.success) setMsg(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(44,79,27,0.06)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDEEE9]">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1A1C19] font-mono">{order.orderNumber}</p>
            {isCustomer && (
              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Self-Order
              </span>
            )}
          </div>
          <p className="text-xs text-[#787868] mt-0.5">
            {order.orderType === 'DINE_IN'
              ? `Meja ${order.tableNumber ?? '—'}`
              : 'Takeaway'}
            {order.customerName ? ` · ${order.customerName}` : ''}
            {' · '}
            {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${payStyle.bg} ${payStyle.text}`}>
            {payStyle.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 space-y-2">
        {order.orderItems.map((item) => (
          <OrderItemRow
            key={item.id}
            item={item}
            source={order.source}
            canEdit={canEdit}
            onSaveLine={saveLine}
            pending={pending}
          />
        ))}
      </div>

      {canEdit && (
        <div className="px-4 py-2 border-t border-[#EDEEE9] bg-[#FAFAF8]">
          <button
            type="button"
            onClick={() => setShowEdit((v) => !v)}
            className="text-xs font-bold text-[#2C4F1B] flex items-center gap-1 mb-2"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            {showEdit ? 'Tutup ubahan kasir' : 'Ubah nama & catatan item'}
          </button>
          {showEdit && (
            <div className="space-y-3 pb-2">
              <div>
                <label className="text-[10px] font-bold text-[#787868] uppercase block mb-1">Nama pelanggan</label>
                <div className="flex gap-2">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Opsional"
                    className="flex-1 text-sm border border-[#D5D9CE] rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={saveCustomer}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-[#2C4F1B] text-white shrink-0"
                  >
                    Simpan
                  </button>
                </div>
              </div>
              {msg && <p className="text-xs text-red-600">{msg}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9FAF5] border-t border-[#EDEEE9]">
        <span className="text-xs text-[#787868]">{order.orderItems.length} jenis item</span>
        <div className="flex items-center gap-3">
          {isCustomer && order.publicOrderCode && order.paymentStatus === 'UNPAID' && (
            <span className="font-mono text-xs font-bold bg-[#E8F5E2] text-[#2C4F1B] px-2 py-0.5 rounded-lg">
              {order.publicOrderCode}
            </span>
          )}
          <span className="text-sm font-bold text-[#2C4F1B]">{formatRupiah(order.grandTotal)}</span>
          {order.paymentStatus === 'UNPAID' && (
            <OrderPayButton
              orderId={order.id}
              orderNumber={order.orderNumber}
              grandTotal={order.grandTotal}
              customerName={order.customerName}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OrderItemRow({
  item,
  source,
  canEdit,
  onSaveLine,
  pending,
}: {
  item: OrderListCardItem;
  source: string;
  canEdit: boolean;
  onSaveLine: (itemId: string, qty: number, note: string) => void;
  pending: boolean;
}) {
  const [qty, setQty] = useState(item.quantity);
  const [note, setNote] = useState(item.specialInstructions ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQty(item.quantity);
    setNote(item.specialInstructions ?? '');
  }, [item.quantity, item.subtotal, item.specialInstructions]);

  return (
    <div className="pt-0.5 border-b border-[#F0F1EC] last:border-0 pb-2 last:pb-0">
      <div className="flex justify-between text-xs gap-2">
        <span className="text-[#43493E]">
          {item.quantity}× {item.productName}
        </span>
        <span className="text-[#787868] shrink-0">{formatRupiah(item.subtotal)}</span>
      </div>
      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {item.selectedModifiers.map((m, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="text-[10px] font-bold bg-[#F0F1EC] text-[#2C4F1B] px-1.5 py-0.5 rounded-lg"
            >
              {m.name || 'Custom'}
            </span>
          ))}
        </div>
      )}
      {item.specialInstructions && !open && (
        <p className="text-[10px] text-[#B35900] italic mt-1">&quot;{item.specialInstructions}&quot;</p>
      )}
      {canEdit && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-[10px] font-semibold text-[#2C4F1B]"
          >
            {open ? 'Batal' : 'Edit baris'}
          </button>
          {open && (
            <div className="mt-2 space-y-2 pl-0">
              {source === 'CASHIER' && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#787868] w-12">Qty</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value) || 1)}
                    className="w-16 text-xs border rounded px-2 py-1"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] text-[#787868] block mb-0.5">Catatan dapur / pelanggan</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-[#D5D9CE] rounded-lg px-2 py-1.5 resize-none"
                />
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => onSaveLine(item.id, qty, note)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-[#E8F5E2] text-[#1B5E20]"
              >
                Simpan baris
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
