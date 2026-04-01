import { notFound } from 'next/navigation';
import { resolveByTableToken } from '@repo/database';
import AccountPortalClient from '../../../_components/AccountPortalClient';
import {
  getCustomerSession,
  getCustomerOrderHistoryRows,
} from '../../../../lib/customer-session';

type Props = { params: Promise<{ tableToken: string }> };

export default async function DineInAccountPage({ params }: Props) {
  const { tableToken } = await params;
  const result = await resolveByTableToken(tableToken);
  if (!result.ok) notFound();

  const { tenantId } = result.data;
  const [session, orders] = await Promise.all([
    getCustomerSession(tenantId),
    getCustomerOrderHistoryRows(tenantId),
  ]);

  return (
    <AccountPortalClient
      tenantId={tenantId}
      menuHref={`/t/${tableToken}`}
      initialSession={session}
      initialOrders={orders}
    />
  );
}
