import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import WalletClient from "./WalletClient";

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

  const { getUser, isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) redirect("http://localhost:3001");

  const user = await getUser();
  if (!user?.id) redirect("http://localhost:3001");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      tenant: {
        include: {
          walletTransactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (!dbUser?.tenant) redirect("/dashboard");

  const tenant = dbUser.tenant;

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
