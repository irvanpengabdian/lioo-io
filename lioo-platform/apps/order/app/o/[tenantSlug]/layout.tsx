import { resolveBySlug } from '@repo/database';
import { notFound } from 'next/navigation';
import OutletHeader from '../../_components/OutletHeader';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function TakeawayLayout({ children, params }: Props) {
  const { tenantSlug } = await params;
  const result = await resolveBySlug(tenantSlug);

  if (!result.ok) notFound();

  const { tenantName, logoUrl } = result.data;

  return (
    <div className="min-h-screen flex flex-col">
      <OutletHeader
        tenantName={tenantName}
        logoUrl={logoUrl}
        mode="takeaway"
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
