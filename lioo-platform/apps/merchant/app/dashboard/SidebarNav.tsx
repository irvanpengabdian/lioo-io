"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import type { DashboardNavItem } from "./nav-config";

export default function SidebarNav({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-[#F3F4EF] flex flex-col py-8 px-4 border-r-0 transition-all duration-300">
      <div className="mb-10 px-4">
        <span className="text-2xl font-extrabold tracking-tighter text-primary">lioo.io Merchant</span>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const className = `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isActive
              ? "text-primary font-bold border-r-4 border-primary bg-white shadow-sm"
              : "hover:text-primary hover:bg-white/50 text-[#43493E]"
          }`;

          return item.external ? (
            <a
              key={item.href + item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              <span className="material-symbols-outlined">open_in_new</span>
              <span className="text-[0.875rem]">{item.label}</span>
            </a>
          ) : (
            <Link key={item.href + item.label} href={item.href} className={className}>
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[0.875rem]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 space-y-1">
        <button className="w-full mb-6 py-4 px-4 bg-primary text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:shadow-lg hover:shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Add New Branch
        </button>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:text-primary hover:bg-white/50 text-[#43493E] font-medium transition-all">
          <span className="material-symbols-outlined">contact_support</span>
          <span className="text-[0.875rem]">Support</span>
        </Link>
        <LogoutLink postLogoutRedirectURL={process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:text-error hover:bg-error-container/50 text-[#43493E] font-medium transition-all w-full text-left">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[0.875rem]">Logout</span>
        </LogoutLink>
      </div>
    </aside>
  );
}
