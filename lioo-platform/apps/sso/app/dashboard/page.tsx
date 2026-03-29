import { getKindeServerSession, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";

export default async function DashboardPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("/");
  }

  const user = await getUser();
  
  if (!user || (!user.id)) {
    redirect("/");
  }

  // Sinkronisasi: Pastikan Database Postgres sinkron dengan Kinde Token.
  // Bila user ini belum teregistrasi di DB kita, buat entitasnya berikut Merchant Dummy.
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true }
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
        tenant: {
          create: {
            name: `${user.given_name || 'Lioo'} Merchant`,
            slug: `merchant-${user.id.substring(0, 5)}`,
            planType: "SEED",
            walletBalance: 0
          }
        }
      },
      include: { tenant: true }
    });
  }

  return (
    <div className="min-h-screen bg-[#F9FAF5] font-sans text-[#1A1C19] p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[#EAE8DF]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Lioo.io</h1>
            <p className="text-[#787868] mt-2">Selamat datang kembali, {user?.given_name || "Merchant"}!</p>
          </div>
          <LogoutLink className="bg-white border-2 border-[#EAE8DF] hover:bg-black hover:text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm">
            Keluar Aplikasi
          </LogoutLink>
        </header>

        <div className="bg-white border border-[#EAE8DF] rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Status Profil Kinde Auth</h2>
          <div className="flex flex-col gap-4 text-sm bg-[#F9FAF5] p-6 rounded-xl border border-[#EAE8DF]">
            <div className="flex justify-between border-b border-[#EAE8DF] pb-2">
              <span className="font-semibold text-[#787868]">ID Kinde</span>
              <span className="font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#EAE8DF] pb-2">
              <span className="font-semibold text-[#787868]">Email Utama</span>
              <span>{user?.email}</span>
            </div>
             <div className="flex justify-between">
              <span className="font-semibold text-[#787868]">Nama Identitas</span>
              <span>{user?.given_name} {user?.family_name}</span>
            </div>
          </div>
          <p className="mt-8 text-sm text-[#787868]">
            Catatan System: Autentikasi telah sukses berjalan. Di sesi berikutnya, kita akan membuat Hook (Webhook/API Post-Login callback) untuk otomatis membuat/sinkronisasi profil database "Tenant" Anda menggunakan parameter ini.
          </p>
        </div>
      </div>
    </div>
  );
}
