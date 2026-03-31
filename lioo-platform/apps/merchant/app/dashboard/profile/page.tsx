import { prisma } from "@repo/database";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StoreProfileClient from "./StoreProfileClient";
import UpgradePlanButton from "./UpgradePlanButton";

export const dynamic = 'force-dynamic';

export default async function StoreProfilePage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user || (!user.id)) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true }
  });

  const tenant = dbUser?.tenant;

  if (!tenant) {
    redirect("/"); // Harus melewati Onboarding
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1C19]">Store Profile</h1>
          <p className="text-[#73796D] mt-2 font-medium">Manajemen identitas dan operasional utama cabang Anda.</p>
        </div>
        <StoreProfileClient tenant={tenant} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (General Info & Address) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Information Card */}
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
              <h2 className="text-xl font-bold text-[#1A1C19]">Informasi Umum</h2>
            </div>
            
            <div className="flex gap-8 mb-8">
              {/* Visual Identity Logo */}
              <div className="w-24 h-24 shrink-0 bg-surface-container-low rounded-2xl flex items-center justify-center border-2 border-dashed border-outline-variant">
                {tenant.logoUrl ? (
                  <img src={tenant.logoUrl} alt="Store Logo" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="material-symbols-outlined text-outline text-3xl">add_photo_alternate</span>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">Nama Merchant</label>
                  <div className="font-semibold text-[#1A1C19] text-base">{tenant.name}</div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">Kategori Bisnis</label>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/50 text-primary font-bold text-xs rounded-lg">
                    {tenant.merchantCategory || "Belum dipilih"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">Deskripsi Singkat</label>
                <p className="text-sm font-medium text-[#43493E]">
                  {tenant.description || <span className="text-outline italic">Belum ada deskripsi...</span>}
                </p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">Nomor Kontak (WhatsApp)</label>
                <div className="font-semibold text-[#1A1C19] text-sm">
                  {tenant.contactNumber || <span className="text-outline italic">-</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Operational & Addressing Card */}
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">map</span>
              <h2 className="text-xl font-bold text-[#1A1C19]">Alamat & Operasional</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">Alamat Lengkap</label>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-sm font-medium text-[#43493E]">
                  {tenant.address || "Jl. Contoh Alamat No. 123, Kelurahan, Kecamatan, Kota."}
                </div>
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Tema Self-Service Menu</label>
                <div className="flex items-center justify-between p-3 border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-[#1A1C19]">{tenant.selfServiceTheme || "Minimalist Green"}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">palette</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Status Operasional</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-[#BBEDA6]/30 text-[#2C4F1B] rounded-xl text-xs font-bold w-max">
                  <div className="w-2 h-2 rounded-full bg-[#2C4F1B] animate-pulse" />
                  Buka & Siap Terima Pesanan
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column (Subscription) */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <div className="bg-[#1A1C19] rounded-3xl p-8 shadow-xl relative overflow-hidden group border border-[#43493E]">
            {/* Decors */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-[#A8D390] font-bold block mb-2">Current Plan</span>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl text-[#BBEDA6]">
                  {tenant.planType === "SEED" ? "🌱" : tenant.planType === "SPROUT" ? "🌿" : "🌸"}
                </span>
                <h2 className="text-3xl font-extrabold text-white">{tenant.planType}</h2>
              </div>
              
              <div className="mb-6 pb-6 border-b border-[#43493E]">
                <div className="text-3xl font-black text-white">
                  {tenant.planType === "SEED" ? "Gratis" : tenant.planType === "SPROUT" ? "Rp 200/tx" : "Rp 899k/bln"}
                </div>
                <div className="text-xs text-white/50 mt-1">Status: Aktif Membina Dasar Bisnis</div>
              </div>

              <div className="text-xs font-bold text-[#A8D390] mb-3 uppercase tracking-wider">Plan Benefits</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Kasir Digital Offline-Capable",
                  "QR Digital Menu", 
                  "Maksimal 5 Produk F&B",
                  "Support Komunitas"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/80 text-sm font-medium">
                    <span className="material-symbols-outlined text-[#BBEDA6] text-[18px] shrink-0">check_circle</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <UpgradePlanButton targetPlan="SPROUT" disabled={tenant.planType !== "SEED"} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
