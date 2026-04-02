'use client';

import PaymentFlow, { type PaymentOrderSummary, type ReceiptData } from './PaymentFlow';

type Props = {
  order: PaymentOrderSummary;
  onClose: () => void;
  onPaid: (receipt: ReceiptData) => void;
};

export default function PaymentModal({ order, onClose, onPaid }: Props) {
  return (
    <div className="pos-modal-backdrop">
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} aria-hidden />
      <div className="pos-modal-card">
        <PaymentFlow order={order} onClose={onClose} onPaid={onPaid} variant="modal" />
      </div>
    </div>
  );
}

export type { PaymentOrderSummary, ReceiptData };
