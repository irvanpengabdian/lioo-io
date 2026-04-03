import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import { redirect } from "next/navigation";
import WalletClient from "./WalletClient";
import { requireMerchantUser } from "../require-merchant-user";

export const metadata = {
  title: "Sprout Wallet | lioo.io Merchant",
  description: "Kelola kredit transaksi dan isi ulang kredit untuk memproses pesanan.",
};

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const params = await searchParams;
  const paymentStatus = params.payment ?? null;

  const sessionUser = await requireMerchantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: sessionUser.tenant.id },
    include: {
      walletTransactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!tenant) redirect("/dashboard");

  const walletGuard = guardAccess(
    sessionUser.role,
    tenant.planType,
    ROLE_PERMISSIONS.viewWallet
  );
  if (!walletGuard.ok) {
    redirect("/dashboard/operations");
  }

  const canTopUp = guardAccess(
    sessionUser.role,
    tenant.planType,
    ROLE_PERMISSIONS.manageBilling
  ).ok;

  // Hitung total kredit (CREDIT = top-up masuk, DEBIT = transaksi keluar)
  const totalCredit = tenant.walletTransactions
    .filter((t) => t.type === "CREDIT" && t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = tenant.walletTransactions
    .filter((t) => t.type === "DEBIT" && t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  // walletBalance dari database (source of truth)
  const currentBalance = tenant.walletBalance;

  return (
    <WalletClient
      tenantName={tenant.name}
      tenantId={tenant.id}
      canTopUp={canTopUp}
      walletBalance={currentBalance}
      totalCredit={totalCredit}
      totalDebit={totalDebit}
      paymentStatus={paymentStatus}
      transactions={tenant.walletTransactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description ?? "",
        status: t.status,
        xenditId: t.xenditId ?? null,
        createdAt: t.createdAt.toISOString(),
      }))}
    />
  );
}
