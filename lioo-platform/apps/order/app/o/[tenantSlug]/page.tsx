import { resolveBySlug } from '@repo/database';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchMenu } from '../../../lib/menu';
import { getCustomerSession } from '../../../lib/customer-session';
import MenuPage from '../../_components/MenuPage';

type Props = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TakeawayMenuPage({ params }: Props) {
  const { tenantSlug } = await params;
  const result = await resolveBySlug(tenantSlug);

  if (!result.ok) notFound();

  const { tenantId } = result.data;
  const { categories, products } = await fetchMenu(tenantId);

  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get('lioo_guest_sid')?.value ?? crypto.randomUUID();
  const customerSession = await getCustomerSession(tenantId);

  return (
    <MenuPage
      tenantId={tenantId}
      tenantSlug={tenantSlug}
      mode="takeaway"
      categories={categories}
      products={products}
      guestSessionId={guestSessionId}
      registeredCustomerId={customerSession?.id ?? null}
      accountHref={`/o/${tenantSlug}/account`}
    />
  );
}
