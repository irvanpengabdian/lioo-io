import { resolveBySlug } from '@repo/database';
import { notFound } from 'next/navigation';
import OutletHeader from '../../_components/OutletHeader';
import BottomNav from '../../_components/BottomNav';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function TakeawayLayout({ children, params }: Props) {
  const { tenantSlug } = await params;
  const result = await resolveBySlug(tenantSlug);

  if (!result.ok) notFound();

  const { tenantName, logoUrl } = result.data;
  const menuHref = `/o/${tenantSlug}`;
  const cartHref = `${menuHref}?cart=1`;
  const accountHref = `/o/${tenantSlug}/account`;

  return (
    <div className="min-h-screen flex flex-col">
      <OutletHeader
        tenantName={tenantName}
        logoUrl={logoUrl}
        mode="takeaway"
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
