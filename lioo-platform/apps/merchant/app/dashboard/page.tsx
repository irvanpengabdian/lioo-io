import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import Image from "next/image";
import DashboardFilters from "./DashboardFilters";

export default async function DashboardOverviewPage(props: { searchParams?: Promise<{ filter?: string }> }) {
  const searchParams = typeof props.searchParams === 'object' && props.searchParams !== null ? await props.searchParams : {};
  const filterParam = searchParams.filter || 'today';

  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("http://localhost:3001");
  }

  const user = await getUser();
  if (!user || !user.id) redirect("http://localhost:3001");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });

  if (!dbUser?.tenant) {
    redirect("/"); // Arahkan ke onboarding jika belum punya tenant/toko
  }

  const tenantId = dbUser.tenant.id;

  // Dapatkan statistik hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let gte = today;
  let lte: Date | undefined = undefined;
  
  let prevGte = new Date(today);
  let prevLte = new Date(today);

  if (filterParam === 'yesterday') {
    gte = new Date(today);
    gte.setDate(gte.getDate() - 1);
    lte = new Date(today);
    
    prevGte = new Date(gte);
    prevGte.setDate(prevGte.getDate() - 1);
    prevLte = new Date(gte);
  } else if (filterParam === '7days') {
    gte = new Date(today);
    gte.setDate(gte.getDate() - 7);
    
    prevGte = new Date(gte);
    prevGte.setDate(prevGte.getDate() - 7);
    prevLte = new Date(gte);
  } else if (filterParam === '30days') {
    gte = new Date(today);
    gte.setDate(gte.getDate() - 30);
    
    prevGte = new Date(gte);
    prevGte.setDate(prevGte.getDate() - 30);
    prevLte = new Date(gte);
  } else if (filterParam === 'range') {
    // Sebagai placeholder: Range 3 bulan terakhir
    gte = new Date(today);
    gte.setMonth(gte.getMonth() - 3);
    
    prevGte = new Date(gte);
    prevGte.setMonth(prevGte.getMonth() - 3);
    prevLte = new Date(gte);
  } else {
    // today is default
    prevGte = new Date(today);
    prevGte.setDate(prevGte.getDate() - 1);
    prevLte = new Date(today);
  }

  const [totalProducts, totalCategories, walletBalance, currentOrders, prevOrders, topItemsRaw] = await Promise.all([
    prisma.product.count({ where: { tenantId } }),
    prisma.category.count({ where: { tenantId } }),
    dbUser.tenant.walletBalance || 0,
    prisma.order.findMany({
      where: { 
        tenantId,
        createdAt: { gte, ...(lte ? { lt: lte } : {}) },
        status: { in: ['COMPLETED', 'SERVED', 'READY'] }
      },
      select: { grandTotal: true, id: true }
    }),
    prisma.order.findMany({
      where: { 
        tenantId,
        createdAt: { gte: prevGte, lt: prevLte },
        status: { in: ['COMPLETED', 'SERVED', 'READY'] }
      },
      select: { grandTotal: true, id: true }
    }),
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: { order: { tenantId, createdAt: { gte, ...(lte ? { lt: lte } : {}) }, status: { in: ['COMPLETED', 'SERVED', 'READY'] } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 3
    })
  ]);

  const dailyRevenue = currentOrders.reduce((sum: number, order: any) => sum + order.grandTotal, 0);
  const transactionCount = currentOrders.length;
  const aov = transactionCount > 0 ? Math.round(dailyRevenue / transactionCount) : 0;

  const prevRevenue = prevOrders.reduce((sum: number, order: any) => sum + order.grandTotal, 0);
  const prevTransactionCount = prevOrders.length;
  const prevAov = prevTransactionCount > 0 ? Math.round(prevRevenue / prevTransactionCount) : 0;

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const dashboardStats: {
    dailyRevenue: number;
    transactionCount: number;
    aov: number;
    revenueGrowth: number;
    transactionGrowth: number;
    aovGrowth: number;
  } = { 
    dailyRevenue, 
    transactionCount, 
    aov,
    revenueGrowth: calculateGrowth(dailyRevenue, prevRevenue),
    transactionGrowth: calculateGrowth(transactionCount, prevTransactionCount),
    aovGrowth: calculateGrowth(aov, prevAov)
  };

  // Pemrosesan Data Top Products untuk mendapat gambar & kategori
  let topProductsDisplay: Array<{rank: number; name: string; category: string; quantity: number; revenue: number; imageUrl: string}> = [];
  
  if (topItemsRaw.length > 0) {
    const productIds = topItemsRaw.map((t: any) => t.productId).filter(Boolean) as string[];
    const productsInfo = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true }
    });
    
    topProductsDisplay = topItemsRaw.map((item: any, index: number) => {
      const prod = productsInfo.find(p => p.id === item.productId);
      return {
        rank: index + 1,
        name: item.productName || prod?.name || 'Unknown',
        category: prod?.category?.name || 'Uncategorized',
        quantity: item._sum.quantity || 0,
        revenue: item._sum.subtotal || 0,
        imageUrl: prod?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnRlHlyFxVTtYENJZ1mauRvNXdbhMnqZoR9BDpSLJPEbHnLD-dXs7aPL7y41Rw_e2Ue1_pUheg_1YriuBgmX081b_89Vmr_auyIts0n3bVSQrWpVZnVoROmi1s69rGDJfJyc7Lp6OD3lIManAT8qaf-qYqWFNvzVmqY3jsYo1bhHs9jxbZGWEZuL18r297I3W9WHOTGL-cczM7xwLuNYdgZB0b2vJwEpnOOsVgLrCdvxOyewoJWfWXztp9TibcJllgG7YDjAbf5Fg' // Fallback image layout
      };
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section with Filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[3.5rem] leading-none font-extrabold tracking-[-0.02em] text-on-surface mb-2">
            Dashboard / Overview
          </h2>
          <p className="text-on-surface-variant flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(44,79,27,0.5)]"></span>
            Status: Live updating from your branches
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DashboardFilters />
          <button className="flex items-center gap-2 bg-surface-container-low px-6 py-3 rounded-full text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer border border-outline-variant/20">
            <span className="material-symbols-outlined text-sm">store</span>
            {dbUser.tenant.name} (Pusat)
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </section>

      {/* Snapshot Cards (Bento Grid Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Main Metric: Omzet Harian */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)] flex flex-col justify-between relative overflow-hidden group hover:shadow-[0px_32px_64px_rgba(44,79,27,0.12)] transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-[100%] transition-transform duration-700 group-hover:scale-110"></div>
          <div className="relative z-10">
            <p className="text-sm uppercase tracking-[0.05em] text-on-surface-variant font-bold mb-4">
              Omzet Harian
            </p>
            <h3 className="text-5xl lg:text-6xl font-extrabold tracking-tighter text-on-surface mb-3">
              Rp {(dashboardStats.dailyRevenue).toLocaleString('id-ID')}
            </h3>
            <div className={`flex items-center gap-2 font-bold ${dashboardStats.revenueGrowth >= 0 ? 'text-primary' : 'text-error'}`}>
              <span className={`material-symbols-outlined text-sm p-1 rounded-full ${dashboardStats.revenueGrowth >= 0 ? 'bg-primary/10' : 'bg-error/10'}`}>
                {dashboardStats.revenueGrowth >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span>{dashboardStats.revenueGrowth > 0 ? '+' : ''}{dashboardStats.revenueGrowth.toFixed(1)}% vs Sebelumnya</span>
            </div>
          </div>
          <div className="mt-8 flex gap-2 h-16 items-end relative z-10">
            <div className="flex-1 bg-surface-container rounded-t-lg h-[40%] hover:bg-primary-container/20 transition-colors"></div>
            <div className="flex-1 bg-surface-container rounded-t-lg h-[60%] hover:bg-primary-container/20 transition-colors"></div>
            <div className="flex-1 bg-surface-container rounded-t-lg h-[30%] hover:bg-primary-container/20 transition-colors"></div>
            <div className="flex-1 bg-surface-container rounded-t-lg h-[80%] hover:bg-primary-container/20 transition-colors"></div>
            <div className="flex-1 bg-gradient-to-t from-primary to-primary-container rounded-t-lg h-full shadow-[0_4px_12px_rgba(44,79,27,0.4)]"></div>
          </div>
        </div>

        {/* Jumlah Transaksi */}
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div>
            <p className="text-sm uppercase tracking-[0.05em] text-on-surface-variant font-bold mb-3">
              Jumlah Transaksi
            </p>
            <h3 className="text-4xl font-extrabold tracking-tight text-on-surface">
              {dashboardStats.transactionCount.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className={`flex items-center gap-2 font-bold text-sm mt-6 ${dashboardStats.transactionGrowth >= 0 ? 'text-primary' : 'text-error'}`}>
            <span className={`material-symbols-outlined text-xs p-1 rounded-full ${dashboardStats.transactionGrowth >= 0 ? 'bg-primary/10' : 'bg-error/10'}`}>
              {dashboardStats.transactionGrowth >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span>{dashboardStats.transactionGrowth > 0 ? '+' : ''}{dashboardStats.transactionGrowth.toFixed(1)}%</span>
          </div>
        </div>

        {/* AOV */}
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div>
            <p className="text-sm uppercase tracking-[0.05em] text-on-surface-variant font-bold mb-3">
              Avg Order Value
            </p>
            <h3 className="text-4xl font-extrabold tracking-tight text-on-surface">
              Rp {dashboardStats.aov.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className={`flex items-center gap-2 font-bold text-sm mt-6 ${dashboardStats.aovGrowth >= 0 ? 'text-primary' : 'text-error'}`}>
            <span className={`material-symbols-outlined text-xs p-1 rounded-full ${dashboardStats.aovGrowth >= 0 ? 'bg-primary/10' : 'bg-error/10'}`}>
              {dashboardStats.aovGrowth >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span>{dashboardStats.aovGrowth > 0 ? '+' : ''}{dashboardStats.aovGrowth.toFixed(1)}%</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Trends & Best Sellers) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Trend Chart Card */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-2xl font-bold text-on-surface">Daily Transaction Trend</h4>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Revenue performance across 24 hours</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary-container/10 px-3 py-1.5 rounded-full border border-primary/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Realtime
              </div>
            </div>
            
            {/* Visual Representation of a Line Chart */}
            <div className="h-64 relative flex items-end gap-1">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#436831" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#436831" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,180 Q100,140 200,160 T400,100 T600,130 T800,40 T1000,80" fill="none" stroke="#2C4F1B" strokeLinecap="round" strokeWidth="4"></path>
                <path d="M0,180 Q100,140 200,160 T400,100 T600,130 T800,40 T1000,80 V260 H0 Z" fill="url(#chartGradient)"></path>
              </svg>
              {/* x-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest pt-4 border-t border-outline-variant/20">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </div>
          </div>

          {/* Performa Produk (Best Sellers) */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)]">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-bold text-on-surface">Top Products</h4>
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                View All Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm text-on-surface-variant border-b-2 border-surface-container-low uppercase tracking-[0.05em]">
                    <th className="pb-4 font-bold px-2">Rank</th>
                    <th className="pb-4 font-bold px-2">Product</th>
                    <th className="pb-4 font-bold px-2">Sold</th>
                    <th className="pb-4 font-bold text-right px-2">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {topProductsDisplay.length > 0 ? (
                    topProductsDisplay.map((item) => (
                      <tr key={item.name} className="group hover:bg-surface-container whitespace-nowrap transition-colors">
                        <td className="py-5 font-bold text-on-surface-variant px-2">#{item.rank}</td>
                        <td className="py-5 px-2">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden shadow-sm">
                              <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl}/>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{item.name}</p>
                              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Category: {item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-on-surface font-semibold px-2">{item.quantity} units</td>
                        <td className="py-5 text-right font-extrabold text-on-surface px-2">Rp {item.revenue.toLocaleString('id-ID')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant font-medium">
                        Belum ada penjualan untuk hari ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Alerts & Activity) */}
        <div className="space-y-8">
          
          {/* Database Real Stats (Wallet, Menus) */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)]">
            <h4 className="text-xl font-bold text-on-surface mb-6">Database Stats</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline">inventory_2</span>
                  <span className="text-sm font-semibold text-on-surface">Total Products</span>
                </div>
                <span className="text-lg font-bold text-primary">{totalProducts}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline">category</span>
                  <span className="text-sm font-semibold text-on-surface">Total Categories</span>
                </div>
                <span className="text-lg font-bold text-primary">{totalCategories}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  <span className="text-sm font-semibold text-on-surface">Sprout Wallet</span>
                </div>
                <span className="text-lg font-bold text-primary">Rp {walletBalance.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)]">
            <h4 className="text-xl font-bold text-on-surface mb-6">Payment Summary</h4>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full border-[20px] border-surface-container mb-8 flex items-center justify-center shadow-inner">
                <div className="absolute inset-[-20px] rounded-full border-[20px] border-primary border-t-transparent border-l-transparent transform rotate-45 transition-transform duration-1000"></div>
                <div className="text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-black text-on-surface mt-1">100%</p>
                </div>
              </div>
              
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-primary shadow-sm"></span>
                    <span className="text-sm font-semibold text-on-surface">QRIS / Digital</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-secondary-fixed shadow-sm"></span>
                    <span className="text-sm font-semibold text-on-surface">Debit/Credit Card</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-outline-variant shadow-sm"></span>
                    <span className="text-sm font-semibold text-on-surface">Cash</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_24px_48px_rgba(44,79,27,0.06)] border border-error/10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-error">warning</span>
              <h4 className="text-xl font-bold text-on-surface">Low Stock Alerts</h4>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Whole Bean - Arabica</p>
                  <p className="text-xs text-error font-semibold mt-1">2.5kg remaining (Min 5kg)</p>
                </div>
                <button className="px-4 py-2 bg-surface-container rounded-full text-xs font-bold text-primary hover:bg-primary-container/20 transition-colors">
                  Reorder
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-container to-primary rounded-full shadow-[0_8px_32px_rgba(44,79,27,0.4)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

    </div>
  );
}
