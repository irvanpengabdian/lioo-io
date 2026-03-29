'use client';

import React, { useEffect, useState } from 'react';
import { fetchActiveOrders, getSocket, updateOrderStatus, fetchKdsMetrics, fetchInventoryAlerts } from '../lib/api';
import { Bell, Search, LayoutDashboard, Clock, Box, Settings, CheckCircle2, AlertTriangle, ChevronRight, TrendingUp } from 'lucide-react';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [activeTab, setActiveTab] = useState<'live'|'history'|'inventory'|'settings'>('live');
  const [metrics, setMetrics] = useState<any>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);

  // Ticking clock
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sound effects for new orders
  const playAlert = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play blocked'));
    } catch(e) {}
  };

  const loadData = async () => {
    const data = await fetchActiveOrders();
    data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    socket.on('connect', () => console.log('KDS Connected to backend WebSocket'));

    socket.on('orderCreated', (newOrder) => {
      if (newOrder.status === 'PAID') {
         playAlert();
         setOrders(prev => [...prev, newOrder].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      }
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => {
        // Find existing to know if we need to remove it or update it
        const exists = prev.find(o => o.id === updatedOrder.id);
        
        // Remove from UI if cancelled or completed
        if (updatedOrder.status === 'CANCELLED' || updatedOrder.status === 'COMPLETED') {
           // Also, if tab is history we might want to refresh history, but for simplicity let users switch tabs to refresh
           return prev.filter(o => o.id !== updatedOrder.id);
        }

        if (exists) {
           return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        } else {
           if (updatedOrder.status === 'PAID') playAlert();
           const newArr = [...prev, updatedOrder];
           return newArr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
      });
    });

    return () => {
      socket.off('orderCreated');
      socket.off('orderStatusUpdated');
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Optimistic update to UI
      if (newStatus === 'COMPLETED') {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
     if (activeTab === 'history') {
        fetchKdsMetrics().then(setMetrics).catch(console.log);
     } else if (activeTab === 'inventory') {
        fetchInventoryAlerts().then(setInventoryAlerts).catch(console.log);
     }
  }, [activeTab]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-white">
        <div className="animate-spin text-emerald-500 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'PAID');
  const preparingOrders = orders.filter(o => o.status === 'COOKING');
  const readyOrders = orders.filter(o => o.status === 'SERVED');

  return (
    <div className="h-screen flex bg-[#0A0F1C] font-sans text-slate-200 overflow-hidden selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#0A0F1C] border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-[#0A0F1C] font-bold font-jakarta shadow-[0_0_12px_rgba(5,150,105,0.4)]">K</div>
             <div>
                <h1 className="text-lg font-bold text-white leading-none tracking-tight">Lioo.io</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-[0.15em] uppercase mt-1">Studio Dapur</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
           <NavItem tab="live" icon={<LayoutDashboard size={18} />} label="Live Orders" badge={pendingOrders.length + preparingOrders.length} activeTab={activeTab} onClick={setActiveTab} />
           <NavItem tab="history" icon={<Clock size={18} />} label="History" activeTab={activeTab} onClick={setActiveTab} />
           <NavItem tab="inventory" icon={<Box size={18} />} label="Inventory" activeTab={activeTab} onClick={setActiveTab} />
        </nav>

        <div className="p-4 border-t border-slate-800/80">
           <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#151B2B] flex items-center justify-center border border-slate-700/80">
                 <span className="text-sm font-bold text-slate-300">JD</span>
              </div>
              <div>
                 <p className="font-bold text-sm text-white leading-tight">Chef John Doe</p>
                 <p className="text-[11px] text-slate-500 mt-0.5">Kitchen Admin</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0F1423] min-w-0">
        
        {/* Topbar */}
        <header className="h-[76px] px-8 border-b border-slate-800/80 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-12">
              <div>
                 <h2 className="text-base font-bold text-white tracking-tight uppercase">
                    {activeTab === 'live' ? 'Station: Main Grills' : activeTab === 'history' ? 'Performance History' : 'Inventory Alerts'}
                 </h2>
                 <p className="text-slate-400 text-[13px] font-mono mt-0.5 tracking-wide" suppressHydrationWarning>
                   {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                 </p>
              </div>
              {activeTab === 'live' && (
                <div className="flex items-center gap-8 border-l border-slate-800/80 pl-8">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Active</span>
                      <span className="text-xl font-bold text-white leading-none">{pendingOrders.length + preparingOrders.length}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Avg Prep</span>
                      <span className="text-xl font-bold text-emerald-400 leading-none font-mono tracking-tight">12:40</span>
                   </div>
                </div>
              )}
           </div>

           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input 
                   type="text" 
                   placeholder={activeTab === 'live' ? 'Search orders...' : 'Search...'} 
                   className="bg-[#151B2B] border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 w-72 transition-all"
                 />
              </div>
              <button className="w-10 h-10 bg-[#151B2B] border border-slate-700/80 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                 <Bell size={18} />
              </button>
           </div>
        </header>

        {/* Content Body */}
        {activeTab === 'live' && (
          <div className="flex-1 p-6 overflow-hidden flex gap-6">
             <Column title="PENDING" dotColor="bg-slate-500" orderCount={pendingOrders.length}>
                {pendingOrders.map(order => 
                   <Ticket key={order.id} order={order} type="PENDING" onAction={() => handleUpdateStatus(order.id, 'COOKING')} currentTime={currentTime} />
                )}
             </Column>
             <Column title="PREPARING" dotColor="bg-blue-500" orderCount={preparingOrders.length}>
                {preparingOrders.map(order => 
                   <Ticket key={order.id} order={order} type="PREPARING" onAction={() => handleUpdateStatus(order.id, 'SERVED')} currentTime={currentTime} />
                )}
             </Column>
             <Column title="READY FOR PICKUP" dotColor="bg-emerald-500" orderCount={readyOrders.length}>
                {readyOrders.map(order => 
                   <Ticket key={order.id} order={order} type="READY" onAction={() => handleUpdateStatus(order.id, 'COMPLETED')} currentTime={currentTime} />
                )}
             </Column>
          </div>
        )}

        {activeTab === 'history' && metrics && (
           <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1200px] mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Performance History</h2>
                    <p className="text-slate-400 text-sm">Review KDS efficiency and order metrics.</p>
                 </div>
                 <div className="flex gap-4">
                    <button className="bg-[#151B2B] border border-slate-700/80 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition">
                       <Clock size={16} /> {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </button>
                    <button className="bg-white text-[#0A0F1C] px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition">
                       Download Report
                    </button>
                 </div>
              </div>

              {/* Top Metrics Row */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                 <div className="bg-[#1A2133] p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                    <Clock size={80} className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-800/50" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">AVG CUST. WAIT TIME</span>
                    <div className="flex items-end gap-3 z-10">
                       <p className="text-4xl font-bold font-mono text-emerald-400">{metrics.avg_wait_time_formatted}</p>
                       <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md mb-1.5">-2.4% vs yest</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 z-10">Payment &rarr; Ready for Pickup</p>
                 </div>
                 <div className="bg-[#1A2133] p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                    <CheckCircle2 size={80} className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-800/50" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">TOTAL ORDERS COMPLETED</span>
                    <div className="flex items-end gap-3 z-10">
                       <p className="text-4xl font-bold font-mono text-white">{metrics.total_completed_today}</p>
                       <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md mb-1.5">+12 vs yest</span>
                    </div>
                 </div>
                 <div className="bg-[#1A2133] p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                    <AlertTriangle size={80} className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-800/50" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">RUSH HOUR PEAK</span>
                    <div className="flex items-end gap-3 z-10">
                       <p className="text-4xl font-bold font-mono text-amber-400">12:30 PM</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 z-10">1:45 PM window</p>
                 </div>
              </div>

              {/* Chart & Alert Row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                 <div className="col-span-2 bg-[#1A2133] rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h3 className="font-bold text-white text-lg">Order Volume Throughout Day</h3>
                       </div>
                       <div className="flex gap-4 text-xs font-medium text-slate-400">
                          <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Target Perf.</span>
                          <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-500 rounded-sm" /> Peak Bottlenecks</span>
                       </div>
                    </div>
                    <div className="flex-1 border-b border-slate-700/80 relative flex items-end justify-between px-2 pb-2 mt-8 min-h-[120px]">
                       {/* Mock Chart */}
                       <div className="absolute bottom-0 w-32 h-1 bg-rose-500 rounded-full left-[35%]" />
                       <div className="absolute bottom-0 w-24 h-1 bg-amber-500 rounded-full left-[68%]" />
                       {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(t => (
                          <span key={t} className="text-[10px] text-slate-500 translate-y-6">{t}</span>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#1A2133] rounded-2xl p-6 flex flex-col border border-rose-900/40">
                    <div className="flex gap-3 mb-4 items-center">
                       <div className="bg-rose-500/20 text-rose-500 p-2 rounded-lg">
                          <AlertTriangle size={20} />
                       </div>
                       <h3 className="font-bold text-white">Critical Bottleneck</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                       Wait times peaked at <strong className="text-rose-400">22m</strong> during the 12:00-13:00 rush. Main cause: <strong>Wagyu Steak</strong> Station saturation.
                    </p>
                    <div className="mt-auto bg-[#0A0F1C] rounded-xl p-4 border border-slate-800">
                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">KDS TIP</p>
                       <p className="text-xs text-slate-300">Increase steak prep staff by 1 at 11:45 AM to avoid future delays.</p>
                    </div>
                 </div>
              </div>

              {/* Table List */}
              <div className="bg-[#1A2133] rounded-2xl flex flex-col overflow-hidden">
                 <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-[#151B2B]">
                    <h3 className="text-lg font-bold text-white">Daily Order Rekap</h3>
                    <div className="flex gap-4">
                       <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input type="text" placeholder="Search Order ID..." className="bg-[#0A0F1C] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white" />
                       </div>
                       <button className="bg-[#0A0F1C] border border-slate-700/80 text-white px-4 py-2 rounded-lg text-xs font-medium">
                          All Performance
                       </button>
                    </div>
                 </div>
                 <table className="w-full text-left">
                    <thead className="border-b border-slate-700/50 text-[#8E9BB0] bg-[#1A2133]">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Order ID & Source</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Items Ordered</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Prep Time</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Total Wait Time</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Efficiency</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-[#1A2133]">
                       {metrics.history.map((o: any, i: number) => {
                          const isWarning = i === 2;
                          const isOverdue = i === 0;
                          
                          const wMs = new Date(o.updated_at).getTime() - new Date(o.created_at).getTime();
                          const wFormatted = `${Math.floor(wMs/60000)}:${Math.floor((wMs%60000)/1000).toString().padStart(2, '0')}`;
                          const prepTime = `${Math.floor(wMs/60000)}:${Math.floor(Math.random()*60).toString().padStart(2, '0')}`;

                          return (
                            <tr key={o.id} className="hover:bg-slate-800/40">
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                     <div className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                     <div>
                                        <p className="text-[11px] font-mono text-slate-400 mb-0.5">#{o.id.split('-').pop()}</p>
                                        <p className="font-bold text-white text-sm">{o.table?.table_number ? `Table ${o.table.table_number}` : 'Takeaway'}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px]">
                                  {(o.items || o.order_items || []).slice(0, 2).map((item: any, idx: number) => (
                                     <p key={idx}><span className="font-bold text-slate-300">{item.quantity}x</span> {item.product?.name}</p>
                                  ))}
                               </td>
                               <td className="px-6 py-4">
                                  <p className="font-bold font-mono text-white text-sm">{prepTime}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Dapur A</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className={`font-bold font-mono text-sm ${isOverdue ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>{wFormatted}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Pay-to-Ready</p>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <span className={`inline-block px-3 py-1 rounded border text-[10px] uppercase font-bold tracking-widest ${
                                     isOverdue ? 'text-rose-500 border-rose-900/50 bg-rose-500/10' :
                                     isWarning ? 'text-amber-500 border-amber-900/50 bg-amber-500/10' :
                                     'text-emerald-500 border-emerald-900/50 bg-emerald-500/10'
                                  }`}>
                                     {isOverdue ? 'OVERDUE' : isWarning ? 'WARNING' : 'EFFICIENT'}
                                  </span>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'inventory' && (
           <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1200px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Inventory Management</h2>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="bg-rose-500/10 border border-rose-900/50 text-rose-500 text-[11px] font-bold px-3 py-1 rounded-full">3 Items Critical</span>
                       <span className="text-slate-400 text-sm flex items-center gap-1.5">Smart Prediction: <span className="text-amber-400 font-bold">Stock Replenishment Suggested</span></span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="bg-[#151B2B] border border-slate-700/80 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition">
                       Export Report
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2">
                       + Add Item
                    </button>
                 </div>
              </div>

              <div className="bg-[#151B2B] rounded-2xl border border-slate-800 overflow-hidden mb-6">
                 <table className="w-full text-left">
                    <thead className="border-b border-slate-700/50 bg-[#1A2133] text-[#8E9BB0]">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Ingredient</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Current Stock</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Avg. Daily Usage</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Usage Trend (7D)</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Predicted Depletion</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                       {inventoryAlerts.map((item: any) => {
                          const isCritical = item.status === 'CRITICAL';
                          const isWarning = item.status === 'WARNING';
                          
                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40">
                               <td className="px-6 py-5">
                                  <p className="font-bold text-white text-sm mb-0.5">{item.name}</p>
                                  <p className="text-[11px] text-slate-500">Pantry / Chiller</p>
                               </td>
                               <td className="px-6 py-5">
                                  <p className={`font-mono text-sm ${isCritical ? 'text-rose-500 font-bold' : 'text-slate-300'}`}>
                                     {item.current_stock} <span className="text-xs">{item.unit}</span>
                                  </p>
                               </td>
                               <td className="px-6 py-5">
                                  <p className="text-slate-400 text-sm">{(Number(item.current_stock)/(item.days_left||1)).toFixed(1)} {item.unit} / day</p>
                               </td>
                               <td className="px-6 py-5">
                                  {/* Mock sparkline using simple SVG */}
                                  <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
                                     <path d={isCritical ? "M0 5 L15 10 L30 18 L45 20 L60 22 L80 28" : "M0 15 L20 10 L40 18 L60 5 L80 10"} stroke={isCritical ? "#f43f5e" : isWarning ? "#f59e0b" : "#10b981"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                               </td>
                               <td className="px-6 py-5">
                                  <p className={`font-bold text-sm ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                                     {item.days_left === 999 ? 'Stable' : item.days_left <= 0 ? 'Out of Stock' : `~ ${item.days_left} Days`}
                                  </p>
                                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">{isCritical&&item.days_left<=0?'ML ALERT: DEPLETED':'BASED ON 7D AVG'}</p>
                               </td>
                               <td className="px-6 py-5 text-right">
                                  <span className={`inline-block px-3 py-1 rounded-full border text-[10px] uppercase font-bold tracking-widest ${
                                     isCritical ? 'text-rose-500 border-rose-900/50 bg-rose-500/10' :
                                     isWarning ? 'text-amber-500 border-amber-900/50 bg-amber-500/10' :
                                     'text-emerald-500 border-emerald-900/50 bg-emerald-500/10'
                                  }`}>
                                     {isCritical ? 'CRITICAL' : isWarning ? 'MONITOR' : 'HEALTHY'}
                                  </span>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-[#0A0F1C] border border-slate-800 rounded-2xl p-6 flex gap-4 items-start">
                    <div className="bg-blue-500/20 text-blue-500 p-3 rounded-xl shrink-0">
                       <TrendingUp size={20} />
                    </div>
                    <div>
                       <h3 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">SMART FORECAST INSIGHT</h3>
                       <p className="text-xs text-slate-400 leading-relaxed">Based on current sales trends and upcoming local events, general consumption is expected to spike by <strong className="text-blue-400">+18%</strong> this weekend. Predictions account for recipe-level breakdown and 7-day average usage spikes.</p>
                    </div>
                 </div>
                 <div className="bg-[#0A0F1C] border border-slate-800 rounded-2xl p-6 flex gap-4 items-start">
                    <div className="bg-rose-500/20 text-rose-500 p-3 rounded-xl shrink-0">
                       <AlertTriangle size={20} />
                    </div>
                    <div>
                       <h3 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">SUPPLY CHAIN ALERT</h3>
                       <p className="text-xs text-slate-400 leading-relaxed">Meat supplier 'Premium Cuts Ltd' reports a delayed shipment. Estimated arrival in 48 hours. Consider temporary menu item modification to prevent deep freezer depletion.</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}

// ----------------------------------------------------
// Sub-components
// ----------------------------------------------------

function NavItem({ tab, icon, label, badge, activeTab, onClick }: any) {
  const active = activeTab === tab;
  return (
    <div 
      onClick={() => onClick(tab)}
      className={`px-4 py-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer relative overflow-hidden transition-all ${active ? 'bg-[#151B2B] text-white border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'}`}
    >
       {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
       <div className="flex items-center gap-3">
          <div className={active ? 'text-emerald-400' : ''}>{icon}</div>
          <span className="font-medium text-sm">{label}</span>
       </div>
       {badge !== undefined && badge > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {badge}
          </span>
       )}
    </div>
  );
}

function Column({ title, dotColor, orderCount, children }: { title: string, dotColor: string, orderCount: number, children: React.ReactNode }) {
  return (
    <div className="flex-[1] flex flex-col min-w-[320px]">
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${dotColor} shadow-[0_0_8px_currentColor]`} />
            <h3 className="font-bold text-sm tracking-widest text-white uppercase">{title}</h3>
         </div>
         <span className="bg-[#1A2133] border border-slate-700/50 text-slate-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
            {orderCount} Orders
         </span>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
         {children}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}

function Ticket({ order, type, onAction, currentTime }: { order: any, type: 'PENDING' | 'PREPARING' | 'READY', onAction: () => void, currentTime: Date }) {
  const elapsedSeconds = Math.max(0, Math.floor((currentTime.getTime() - new Date(order.created_at).getTime()) / 1000));
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

  const isTakeaway = order.table?.table_number === 'TAKEAWAY' || !order.table_id;
  const tableText = isTakeaway ? 'TAKEAWAY' : `Table ${order.table?.table_number || order.table_number || '--'}`;

  // Fake statuses for checklist UI
  const getBadgeForIndex = (idx: number) => {
    if (type !== 'PREPARING') return null;
    if (idx === 0) return { label: 'Done', color: 'text-slate-500 font-normal', checked: true };
    if (idx === 1) return { label: 'COOKING', color: 'text-blue-400 font-bold', checked: false };
    return { label: null, color: '', checked: false };
  };

  return (
    <div className="bg-[#151B2B] rounded-xl border border-slate-800 shadow-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
       
       {/* Ticket Header */}
       <div className="px-5 py-4 flex justify-between items-start border-b border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-500 font-mono mb-1.5">#{order.id.split('-').pop()}</p>
            <h4 className="text-xl font-bold text-white leading-none tracking-tight">{tableText}</h4>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
              {type === 'PENDING' ? 'Waiting' : type === 'PREPARING' ? 'Elapsed' : 'Completed'}
            </p>
            {type === 'READY' ? (
              <span className="text-[11px] text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded">in 05:22</span> /* Mock ready time */
            ) : (
              <p className={`text-[19px] font-bold font-mono leading-none tracking-tight ${type === 'PENDING' ? 'text-orange-400' : 'text-blue-400'}`}>
                {timeStr}
              </p>
            )}
          </div>
       </div>

       {/* Items List */}
       <div className="px-5 py-4 flex-1">
          {type === 'READY' ? (
            <div className="py-2 flex justify-between items-center gap-2">
               {/* Ready items count mockup */}
               <div className="flex flex-col gap-2">
                 {(order.items || order.order_items || []).map((item: any, i: number) => (
                    <span key={i} className="text-slate-400 text-sm">{item.quantity}x {item.product?.name}</span>
                 ))}
               </div>
               <div className="flex flex-col items-center justify-center -mt-8">
                 <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)] mb-2">
                   <CheckCircle2 className="text-[#151B2B]" size={16} strokeWidth={3} />
                 </div>
                 <p className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Pick Up</p>
               </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {(order.items || order.order_items || []).map((item: any, i: number) => {
                 const badge = getBadgeForIndex(i);
                 return (
                  <li key={i} className="flex flex-col gap-1.5">
                     <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                           {type === 'PREPARING' && (
                             <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${badge?.checked ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-[#0F1423] border-slate-600'}`}>
                               {badge?.checked && <CheckCircle2 size={12} />}
                             </div>
                           )}
                           <span className={`text-[14px] leading-snug ${badge?.checked ? 'text-slate-500 line-through decoration-slate-600' : 'text-[#E2E8F0]'}`}>
                             <span className={badge?.checked ? "mr-2 opacity-50" : "font-bold mr-2 text-slate-300"}>
                               {item.quantity}x
                             </span>
                             {item.product?.name || 'Unknown Item'}
                           </span>
                        </div>
                        
                        {badge?.label && !badge.checked && (
                           <span className={`text-[10px] uppercase tracking-widest ml-3 mt-1 ${badge.color}`}>{badge.label}</span>
                        )}
                        {badge?.label && badge.checked && (
                           <span className={`text-[10px] ml-3 mt-1 ${badge.color}`}>{badge.label}</span>
                        )}
                     </div>
                     
                     {item.notes && (
                       <p className={`text-[12px] italic ${type === 'PREPARING' ? 'ml-7 text-slate-500' : 'text-slate-500'}`}>
                         {item.notes}
                       </p>
                     )}
                  </li>
                 )
              })}
            </ul>
          )}
       </div>

       {/* Action Button */}
       <div className="px-5 pb-5 pt-2">
          {type === 'PENDING' && (
             <button onClick={onAction} className="w-full py-3 bg-[#1E2538] hover:bg-[#2A334C] text-slate-200 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors border border-slate-700">
               Start
             </button>
          )}
          {type === 'PREPARING' && (
             <button onClick={onAction} className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-emerald-400 hover:text-white text-xs font-bold tracking-widest uppercase rounded-lg transition-colors border border-emerald-800 hover:border-emerald-600">
               Mark as Ready
             </button>
          )}
          {type === 'READY' && (
             <button onClick={onAction} className="w-full py-3 bg-[#1E2538] hover:bg-[#2A334C] text-slate-400 hover:text-slate-200 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors border border-slate-700/80">
               Dismiss
             </button>
          )}
       </div>

    </div>
  );
}
