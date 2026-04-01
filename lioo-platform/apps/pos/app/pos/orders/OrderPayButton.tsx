'use client';

import { useState } from 'react';
import PaymentModal from '../terminal/PaymentModal';

type Props = {
  orderId: string;
  orderNumber: string;
  grandTotal: number;
};

export default function OrderPayButton({ orderId, orderNumber, grandTotal }: Props) {
  const [open, setOpen] = useState(false);
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F5E2] text-[#2C6B1A]">
        Lunas ✓
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white shadow-sm hover:opacity-90 transition-opacity"
      >
        Bayar
      </button>

      {open && (
        <PaymentModal
          order={{ id: orderId, orderNumber, grandTotal }}
          onClose={() => setOpen(false)}
          onPaid={() => {
            setPaid(true);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
