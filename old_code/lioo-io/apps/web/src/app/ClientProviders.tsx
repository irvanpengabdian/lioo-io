'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CartProvider } from '@/lib/CartContext';

function ProvidersWithTable({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') ?? '4';
  return <CartProvider tableNumber={tableNumber}>{children}</CartProvider>;
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <ProvidersWithTable>{children}</ProvidersWithTable>
    </Suspense>
  );
}
