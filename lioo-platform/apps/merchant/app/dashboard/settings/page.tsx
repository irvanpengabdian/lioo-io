import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import { buildDashboardNav } from "../nav-config";

export const metadata = { title: "Pengaturan | lioo.io Merchant" };

const META: Record<string, { desc: string }> = {
  "/dashboard/profile": { desc: "Nama, logo, kontak, dan tema" },
  "/dashboard/wallet": { desc: "Saldo dan top-up" },
  "/dashboard/teams": { desc: "Undangan, role, dan kuota kursi" },
  "/dashboard/menu": { desc: "Kategori dan produk" },
  "/dashboard/operations": { desc: "POS, portal order, KDS" },
  "/dashboard": { desc: "Ringkasan analitik" },
};

export default async function SettingsPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  const user = await getUser();
  if (!user?.id) redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });
  if (!dbUser?.tenant) redirect("/");

  const navItems = buildDashboardNav(dbUser.role, dbUser.tenant.planType);

  const links = navItems
    .filter((i) => i.href !== "/dashboard/settings")
    .map((i) => ({
      href: i.href,
      label: i.label,
      icon: i.icon,
      desc: META[i.href]?.desc ?? "Bagian dashboard",
    }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#1A1C19] mb-2">Pengaturan</h1>
      <p className="text-sm text-[#787868] mb-8">
        Pintasan sesuai role Anda. Halaman yang tidak terdaftar di sidebar tidak ditampilkan di sini.
      </p>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-[0_4px_24px_rgba(44,79,27,0.06)] border border-transparent hover:border-[#7C8B6F]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[#2C4F1B] mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-[#1A1C19]">{item.label}</p>
                <p className="text-xs text-[#787868] mt-0.5">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-[#AAAAA0] ml-auto text-sm">chevron_right</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
