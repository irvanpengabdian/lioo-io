import { ROLE_PERMISSIONS, guardAccess } from "@repo/database";
import type { PlanType, Role } from "@prisma/client";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
};

export function buildDashboardNav(role: Role, planType: PlanType): DashboardNavItem[] {
  const allowed = (check: (r: Role) => boolean) =>
    guardAccess(role, planType, check).ok;

  const items: DashboardNavItem[] = [];

  const hasOverview = allowed(ROLE_PERMISSIONS.viewDashboardAnalytics);
  const hasOps = allowed(ROLE_PERMISSIONS.viewOperationalHub);

  if (hasOps && !hasOverview) {
    items.push({ href: "/dashboard/operations", label: "Operasional", icon: "point_of_sale" });
  }
  if (hasOverview) {
    items.push({ href: "/dashboard", label: "Overview", icon: "dashboard" });
  }
  if (hasOps && hasOverview) {
    items.push({ href: "/dashboard/operations", label: "Operasional", icon: "point_of_sale" });
  }

  if (allowed(ROLE_PERMISSIONS.manageStoreProfile)) {
    items.push({ href: "/dashboard/profile", label: "Store Profile", icon: "storefront" });
  }

  if (allowed(ROLE_PERMISSIONS.viewWallet)) {
    items.push({ href: "/dashboard/wallet", label: "Sprout Wallet", icon: "account_balance_wallet" });
  }

  if (allowed(ROLE_PERMISSIONS.manageMenu)) {
    items.push({ href: "/dashboard/menu", label: "Menu Management", icon: "restaurant_menu" });
  }

  if (allowed(ROLE_PERMISSIONS.manageStaff)) {
    items.push({ href: "/dashboard/teams", label: "Tim & Staff", icon: "group" });
  }

  items.push({ href: "/dashboard/settings", label: "Settings", icon: "settings" });

  return items;
}
