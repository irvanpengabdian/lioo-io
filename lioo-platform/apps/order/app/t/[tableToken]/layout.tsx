import { resolveByTableToken } from '@repo/database';
import { notFound } from 'next/navigation';
import OutletHeader from '../../_components/OutletHeader';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tableToken: string }>;
};

export default async function DineInLayout({ children, params }: Props) {
  const { tableToken } = await params;
  const result = await resolveByTableToken(tableToken);

  if (!result.ok) notFound();

  const { tenantName, logoUrl, tableLabel } = result.data;

  return (
    <div className="min-h-screen flex flex-col">
      <OutletHeader
        tenantName={tenantName}
        logoUrl={logoUrl}
        badge={tableLabel ? `Meja: ${tableLabel}` : undefined}
        mode="dine-in"
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
