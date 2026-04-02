import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { formatRupiah } from '../../../lib/types';
import OrderPayButton from './OrderPayButton';
import OrdersPageClient from './OrdersPageClient';

export const dynamic = 'force-dynamic';

type BadgeStyle = { label: string; bg: string; text: string };

const STATUS_STYLE: Record<string, BadgeStyle> = {
  PENDING:   { label: 'Menunggu',     bg: 'bg-[#FFF8E1]', text: 'text-[#B35900]' },
  CONFIRMED: { label: 'Dikonfirmasi', bg: 'bg-[#EEF2FF]', text: 'text-[#4338CA]' },
  PREPARING: { label: 'Diproses',     bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]' },
  READY:     { label: 'Siap',         bg: 'bg-[#E8F5E2]', text: 'text-[#2C6B1A]' },
  SERVED:    { label: 'Disajikan',    bg: 'bg-[#E8F5E2]', text: 'text-[#2C6B1A]' },
  COMPLETED: { label: 'Selesai',      bg: 'bg-[#EDEEE9]', text: 'text-[#43493E]' },
  CANCELLED: { label: 'Dibatalkan',   bg: 'bg-[#FDE8E8]', text: 'text-[#B91C1C]' },
};

const PAYMENT_STYLE: Record<string, BadgeStyle> = {
  UNPAID:  { label: 'Belum Bayar', bg: 'bg-[#FDE8E8]', text: 'text-[#B91C1C]' },
  PARTIAL: { label: 'Sebagian',    bg: 'bg-[#FFF8E1]',  text: 'text-[#B35900]' },
  PAID:    { label: 'Lunas',       bg: 'bg-[#E8F5E2]',  text: 'text-[#2C6B1A]' },
};

const DEFAULT_STATUS: BadgeStyle  = { label: 'Menunggu',   bg: 'bg-[#FFF8E1]', text: 'text-[#B35900]' };
const DEFAULT_PAYMENT: BadgeStyle = { label: 'Belum Bayar', bg: 'bg-[#FDE8E8]', text: 'text-[#B91C1C]' };

// ─── Order Card component (shared) ──────────────────────────────────────────
function OrderCard({ order }: {
  order: {
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
    createdAt: Date;
    orderItems: {
      productName: string;
      quantity: number;
      subtotal: number;
      selectedModifiers?: { name?: string }[] | null;
      specialInstructions?: string | null;
    }[];
  };
}) {
  const statusStyle  = STATUS_STYLE[order.status]        ?? DEFAULT_STATUS;
  const payStyle     = PAYMENT_STYLE[order.paymentStatus] ?? DEFAULT_PAYMENT;
  const isCustomer   = order.source === 'CUSTOMER_APP';

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
              ? `🪑 ${order.tableNumber ?? 'Dine-in'}`
              : '🛍️ Takeaway'}
            {order.customerName ? ` · ${order.customerName}` : ''}
            {' · '}
            {new Date(order.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit', minute: '2-digit',
            })}
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

      {/* Items */}
      <div className="px-4 py-2 space-y-1">
        {order.orderItems.map((item, idx) => (
          <div key={idx} className="pt-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#43493E]">{item.quantity}× {item.productName}</span>
              <span className="text-[#787868]">{formatRupiah(item.subtotal)}</span>
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

            {item.specialInstructions && (
              <p className="text-[10px] text-[#B35900] italic mt-1">"{item.specialInstructions}"</p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
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

// ─── Page ──────────────────────────────────────────────────────────────────
export default async function OrdersPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });
  if (!dbUser?.tenantId) redirect('/');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      tenantId: dbUser.tenantId,
      createdAt: { gte: today },
      status: { not: 'CANCELLED' },
    },
    include: {
      orderItems: {
        select: { productName: true, quantity: true, subtotal: true, selectedModifiers: true, specialInstructions: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const kasirOrders    = orders.filter((o) => o.source !== 'CUSTOMER_APP');
  const customerOrders = orders.filter((o) => o.source === 'CUSTOMER_APP');
  const unpaidCustomer = customerOrders.filter((o) => o.paymentStatus === 'UNPAID').length;

  return (
    <OrdersPageClient unpaidCustomerCount={unpaidCustomer}>
      {/* Tab: Kasir */}
      <div data-tab="kasir" className="space-y-3">
        {kasirOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_4px_24px_rgba(44,79,27,0.06)]">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-semibold text-[#1A1C19]">Belum ada pesanan kasir hari ini</p>
          </div>
        ) : (
          kasirOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      {/* Tab: Customer */}
      <div data-tab="customer" className="space-y-3">
        {customerOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_4px_24px_rgba(44,79,27,0.06)]">
            <p className="text-5xl mb-3">📱</p>
            <p className="font-semibold text-[#1A1C19]">Belum ada pesanan self-order hari ini</p>
            <p className="text-xs text-[#787868] mt-1 max-w-xs mx-auto">
              Pesanan dari portal pelanggan (QR meja / takeaway) akan muncul di sini.
            </p>
          </div>
        ) : (
          customerOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </OrdersPageClient>
  );
}
