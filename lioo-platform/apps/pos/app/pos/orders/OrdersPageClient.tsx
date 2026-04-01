'use client';

import { useState, Children } from 'react';
import ScanCodeModal from './ScanCodeModal';

type Props = {
  children: React.ReactNode; // [0]=kasirTab, [1]=customerTab
  unpaidCustomerCount: number;
};

export default function OrdersPageClient({ children, unpaidCustomerCount }: Props) {
  const [activeTab, setActiveTab] = useState<'kasir' | 'customer'>('kasir');
  const [scanOpen, setScanOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = Children.toArray(children);
  const kasirContent   = tabs[0];
  const customerContent = tabs[1];

  return (
    <div className="h-full overflow-y-auto bg-[#F9FAF5] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1A1C19]">Pesanan Hari Ini</h2>
          {/* Scan kode button — hanya relevan di tab customer */}
          {activeTab === 'customer' && (
            <button
              onClick={() => setScanOpen(true)}
              className="flex items-center gap-1.5 bg-[#2C4F1B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
                <path d="M13 17h2m2 0h2M13 13h2m4 0v2m0 2v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Scan Kode
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-[#F0F1EC] rounded-full p-1 mb-4">
          <button
            onClick={() => setActiveTab('kasir')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeTab === 'kasir'
                ? 'bg-white text-[#2C4F1B] shadow-sm'
                : 'text-[#787868]'
            }`}
          >
            Dari Kasir
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all relative ${
              activeTab === 'customer'
                ? 'bg-white text-[#2C4F1B] shadow-sm'
                : 'text-[#787868]'
            }`}
          >
            Self-Order
            {unpaidCustomerCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unpaidCustomerCount > 9 ? '9+' : unpaidCustomerCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div key={refreshKey}>
          {activeTab === 'kasir'    ? kasirContent   : customerContent}
        </div>
      </div>

      {/* Scan code modal */}
      {scanOpen && (
        <ScanCodeModal
          onClose={() => setScanOpen(false)}
          onPaid={() => {
            setScanOpen(false);
            setRefreshKey((k) => k + 1); // trigger re-render
          }}
        />
      )}
    </div>
  );
}
