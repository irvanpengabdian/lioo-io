import SidebarNav from "./SidebarNav";
import DashboardHeader from "./DashboardHeader";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ROLE_PERMISSIONS, guardAccess } from "@repo/database";
import { requireMerchantUser, merchantShellDisplay } from "./require-merchant-user";
import { buildDashboardNav } from "./nav-config";

/** Cegah cache statis: setiap request butuh sesi Kinde + Prisma segar (hindari RSC error di production). */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dbUser = await requireMerchantUser();

  const { getUser } = getKindeServerSession();
  const kinde = await getUser();

  const shell = merchantShellDisplay(dbUser, kinde?.email ?? null);
  const navItems = buildDashboardNav(shell.role, shell.planType);
  const showMenuSearch = guardAccess(shell.role, shell.planType, ROLE_PERMISSIONS.manageMenu).ok;

  return (
    <div className="flex bg-surface text-on-surface min-h-screen relative">
      <SidebarNav items={navItems} />

      <DashboardHeader
        storeName={shell.storeName}
        subtitle={shell.subtitle}
        userDisplayName={shell.userDisplayName}
        initials={shell.initials}
        showMenuSearch={showMenuSearch}
      />

      <main className="pl-[280px] pt-24 pb-12 px-8 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}
