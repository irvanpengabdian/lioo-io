'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOrderTracking } from '../actions/tracking';

type TrackingStep = {
  key: string;
  label: string;
  sublabel: string;
  icon: string;   // material-symbols name
};

const STEPS: TrackingStep[] = [
  {
    key: 'RECEIVED',
    label: 'Pesanan Diterima',
    sublabel: 'Pesananmu telah masuk ke sistem',
    icon: 'receipt_long',
  },
  {
    key: 'PREPARING',
    label: 'Sedang Diproses',
    sublabel: 'Dapur sedang menyiapkan pesananmu',
    icon: 'skillet',
  },
  {
    key: 'DONE',
    label: 'Selesai',
    sublabel: 'Pesananmu siap disajikan / diambil',
    icon: 'check_circle',
  },
];

/**
 * Map DB OrderStatus → tracking step index (0-based).
 * -1 means no step is active yet (shouldn't happen after submit).
 */
function statusToStepIndex(status: string): number {
  switch (status) {
    case 'PENDING':
    case 'CONFIRMED':
      return 0; // Diterima
    case 'PREPARING':
      return 1; // Sedang diproses
    case 'READY':
    case 'SERVED':
    case 'COMPLETED':
      return 2; // Selesai
    case 'CANCELLED':
      return -1;
    default:
      return 0;
  }
}

type Props = {
  orderId: string;
  initialStatus?: string;
};

export default function OrderTracker({ orderId, initialStatus }: Props) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus ?? 'PENDING');
  const [cancelled, setCancelled] = useState(false);

  const poll = useCallback(async () => {
    try {
      const result = await getOrderTracking(orderId);
      if (result.status) {
        setCurrentStatus(result.status);
        if (result.status === 'CANCELLED') setCancelled(true);
      }
    } catch {
      // silent
    }
  }, [orderId]);

  // Poll every 5 seconds until completion
  useEffect(() => {
    const terminal = ['COMPLETED', 'SERVED', 'CANCELLED'];
    if (terminal.includes(currentStatus)) return;

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [currentStatus, poll]);

  const activeStep = statusToStepIndex(currentStatus);

  if (cancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-center">
        <span
          className="material-symbols-outlined text-red-500 mb-1"
          style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 1" }}
        >
          cancel
        </span>
        <p className="text-sm font-bold text-red-700">Pesanan Dibatalkan</p>
        <p className="text-xs text-red-600 mt-0.5">Hubungi kasir untuk informasi lebih lanjut.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8EBE4] p-5">
      <h3 className="text-xs font-bold text-[#43493E] uppercase tracking-wider mb-4">
        Status Pesanan
      </h3>

      <div className="flex flex-col gap-0">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeStep;
          const isActive = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <div key={step.key} className="flex items-stretch gap-3">
              {/* Vertical line + circle */}
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isDone
                      ? 'bg-[#2C4F1B] text-white'
                      : isActive
                        ? 'bg-[#2C4F1B] text-white tracker-pulse shadow-[0_0_16px_rgba(44,79,27,0.35)]'
                        : 'bg-[#E8EBE4] text-[#B5B5A5]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '1.125rem',
                      fontVariationSettings: isDone || isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                    }}
                  >
                    {isDone ? 'check' : step.icon}
                  </span>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[1.5rem] transition-colors duration-500 ${
                      isDone ? 'bg-[#2C4F1B]' : 'bg-[#E8EBE4]'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className={`pb-5 pt-1 ${idx === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <p
                  className={`text-sm font-bold leading-tight transition-colors duration-300 ${
                    isDone || isActive ? 'text-[#1A1C19]' : 'text-[#B5B5A5]'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-xs mt-0.5 transition-colors duration-300 ${
                    isDone || isActive ? 'text-[#787868]' : 'text-[#D0D0C5]'
                  }`}
                >
                  {step.sublabel}
                </p>
                {isActive && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full animate-pulse" />
                    <span className="text-[10px] font-semibold text-[#4CAF50] uppercase tracking-wider">
                      Sedang berlangsung
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
