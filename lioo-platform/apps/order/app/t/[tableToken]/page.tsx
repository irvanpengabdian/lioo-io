import { resolveByTableToken } from '@repo/database';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchMenu } from '../../../lib/menu';
import { getCustomerSession } from '../../../lib/customer-session';
import MenuPage from '../../_components/MenuPage';

type Props = {
  params: Promise<{ tableToken: string }>;
};

export default async function DineInMenuPage({ params }: Props) {
  const { tableToken } = await params;
  const result = await resolveByTableToken(tableToken);

  if (!result.ok) notFound();

  const { tenantId, tenantSlug, tableId, tableLabel } = result.data;
  const { categories, products } = await fetchMenu(tenantId);

  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get('lioo_guest_sid')?.value ?? crypto.randomUUID();
  const customerSession = await getCustomerSession(tenantId);

  return (
    <MenuPage
      tenantId={tenantId}
      tenantSlug={tenantSlug}
      tableId={tableId}
      tableLabel={tableLabel}
      mode="dine-in"
      categories={categories}
      products={products}
      guestSessionId={guestSessionId}
      registeredCustomerId={customerSession?.id ?? null}
      accountHref={`/t/${tableToken}/account`}
    />
  );
}
