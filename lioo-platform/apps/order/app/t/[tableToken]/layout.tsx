import { resolveByTableToken } from '@repo/database';
import { notFound } from 'next/navigation';
import OutletHeader from '../../_components/OutletHeader';
import BottomNav from '../../_components/BottomNav';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tableToken: string }>;
};

export default async function DineInLayout({ children, params }: Props) {
  const { tableToken } = await params;
  const result = await resolveByTableToken(tableToken);

  if (!result.ok) notFound();

  const { tenantName, logoUrl, tableLabel } = result.data;
  const menuHref = `/t/${tableToken}`;
  const cartHref = `${menuHref}?cart=1`;
  const accountHref = `/t/${tableToken}/account`;

  return (
    <div className="min-h-screen flex flex-col">
      <OutletHeader
        tenantName={tenantName}
        logoUrl={logoUrl}
        badge={tableLabel ? `Meja: ${tableLabel}` : undefined}
        mode="dine-in"
        accountHref={accountHref}
      />
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav
        menuHref={menuHref}
        cartHref={cartHref}
        ordersHref={accountHref}
        profileHref={accountHref}
      />
    </div>
  );
}
