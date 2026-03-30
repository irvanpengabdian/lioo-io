import SidebarNav from "./SidebarNav";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("http://localhost:3001");
  }

  return (
    <div className="flex bg-surface text-on-surface min-h-screen relative">
      {/* Side Navigation */}
      <SidebarNav />

      {/* Top Header bar */}
      <header className="fixed top-0 right-0 w-full z-40 bg-[#F9FAF5]/70 backdrop-blur-xl flex justify-between items-center h-16 px-8 border-b border-outline-variant/10 pl-[280px]">
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
            <input type="text" placeholder="Quick search menu items..." className="w-full pl-12 pr-4 py-2 bg-surface-container-low border border-transparent outline-none rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </button>
          <div className="h-8 w-px bg-outline-variant/30 mx-2"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-primary tracking-wide">Green Bean Roastery</p>
              <p className="text-[10px] text-on-surface-variant font-medium">Central Jakarta Branch</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container/50 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
              GB
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog View Container */}
      <main className="pl-[280px] pt-24 pb-12 px-8 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}
