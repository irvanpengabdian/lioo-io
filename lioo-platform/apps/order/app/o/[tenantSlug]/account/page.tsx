import { notFound } from 'next/navigation';
import { resolveBySlug } from '@repo/database';
import AccountPortalClient from '../../../_components/AccountPortalClient';
import {
  getCustomerSession,
  getCustomerOrderHistoryRows,
} from '../../../../lib/customer-session';

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function TakeawayAccountPage({ params }: Props) {
  const { tenantSlug } = await params;
  const result = await resolveBySlug(tenantSlug);
  if (!result.ok) notFound();

  const { tenantId } = result.data;
  const [session, orders] = await Promise.all([
    getCustomerSession(tenantId),
    getCustomerOrderHistoryRows(tenantId),
  ]);

  return (
    <AccountPortalClient
      tenantId={tenantId}
      menuHref={`/o/${tenantSlug}`}
      initialSession={session}
      initialOrders={orders}
    />
  );
}
