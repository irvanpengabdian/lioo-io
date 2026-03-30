"use client";
import React, { useState } from "react";
import { submitMerchantOnboarding } from "./actions/onboarding";
import { useRouter } from "next/navigation";

export default function MerchantOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // State Pemuatan dan Pesan Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Input State Langkah 1
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");

  // Input State Langkah 2
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("local_cafe");

  // Input State Langkah 3
  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuFile, setMenuFile] = useState<File | null>(null);

  const nextStep = () => {
    // Validasi Sederhana sebelum Lanjut
    if (step === 1 && (!storeName || !storeSlug)) return alert("Nama toko dan Username wajib diisi!");
    if (step === 2 && !categoryName) return alert("Nama kategori wajib diisi!");
    setStep((s) => Math.min(s + 1, totalSteps));
  };
  
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Aksi Penyelesaian Akhir yang sesungguhnya (Uploud Foto ke R2 -> Simpan Profil ke Supabase -> Ke Dashboard)
  const handleFinalSubmit = async () => {
    if (!menuName || !menuPrice) return alert("Nama menu dan Harga wajib diisi!");

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let finalImageUrl = undefined;

      // [INTEGRASI CLOUDFLARE R2]
      if (menuFile) {
        // A. Tarik tiket "Pre-Signed URL" dari jalur belakang
        const resUrl = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: menuFile.name, contentType: menuFile.type }),
        });
        const uploadData = await resUrl.json();
        
        if (!resUrl.ok) throw new Error(uploadData.error || "Gagal membuat gerbang tiket Cloudflare");

        // B. Unggah foto ASLI langsung ke satelit Cloudflare R2 tanpa singgah di Vercel
        const uploadResponse = await fetch(uploadData.presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": menuFile.type },
          body: menuFile
        });

        if (!uploadResponse.ok) throw new Error("Cloudflare R2 menolak unggahan Anda");

        // C. Tautan publik Cloudflare R2 sesungguhnya
        finalImageUrl = `https://pub-501143c8a0bb45a783bbe742cd5c6722.r2.dev/${uploadData.objectKey}`; 
      }

      // [INTEGRASI SUPABASE DATABASE]
      // Simpan semua gabungan input (Termasuk URL foto yg baru naik ke awan) melalui prisma.
      const actionResult = await submitMerchantOnboarding({
        storeName,
        storeSlug,
        categoryName,
        categoryIcon,
        menuName,
        menuPrice: parseInt(menuPrice.replace(/[^0-9]/g, "")) || 0,
        menuImageUrl: finalImageUrl
      });

      if (!actionResult.success) {
        throw new Error(actionResult.error);
      }

      // Seluruh Arus Registrasi Sukses 100% - Lompat ke Dashboard Menu!
      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Kegagalan Sistem yang tidak terduga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (step / totalSteps) * 100;
  const stepTitles = ["Atur Profil Toko", "Kategori Menu", "Tambah Menu Pertama"];

  return (
    <main className="pt-20 pb-20 px-6 max-w-4xl mx-auto wizard-container min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full bg-background/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tighter text-primary">lioo.io Merchant</span>
          </div>
        </div>
      </header>
      
      <div className="mb-12 mt-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Langkah {step} dari 3</span>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">{stepTitles[step - 1]}</h1>
          </div>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="progress-bar h-full bg-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        
        {/* Laci Peringatan Error Jika Gagal Menyimpan */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-bold border border-error/20 flex animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined mr-2">error</span>
            {errorMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7 space-y-8 relative overflow-hidden">
          
          {/* LANGKAH 1 */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <section className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-outline-variant/20">
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.75rem] font-bold text-on-surface-variant mb-2 block tracking-wide uppercase">Nama Toko *</label>
                    <input 
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-5 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow" 
                      placeholder="Contoh: Kopi Senja Abadi" 
                      value={storeName} onChange={e => setStoreName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-[0.75rem] font-bold text-on-surface-variant mb-2 block tracking-wide uppercase">Username @lioo.io *</label>
                    <input 
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-5 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow" 
                      placeholder="contoh: kopisenja" 
                      value={storeSlug} onChange={e => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} 
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* LANGKAH 2 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <section className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-outline-variant/20">
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.75rem] font-bold text-on-surface-variant mb-2 block tracking-wide uppercase">Nama Kategori *</label>
                    <input 
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-5 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow" 
                      placeholder="Contoh: Kopi Susu" 
                      value={categoryName} onChange={e => setCategoryName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-[0.75rem] font-bold text-on-surface-variant mb-3 block tracking-wide uppercase">Pilih Ikon Opsional</label>
                    <div className="grid grid-cols-4 gap-3">
                      {['local_cafe', 'restaurant', 'icecream', 'bakery_dining'].map((icon) => (
                         <div key={icon} onClick={() => setCategoryIcon(icon)} className={`p-4 rounded-xl flex items-center justify-center cursor-pointer border transition-all ${categoryIcon === icon ? 'border-primary bg-secondary-container/30 scale-105' : 'border-outline-variant/30 hover:border-primary/50'}`}>
                            <span className="material-symbols-outlined text-primary">{icon}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* LANGKAH 3 */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <section className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-outline-variant/20">
                <div className="space-y-6">
                  {/* Pemilihan File Unggahan yang Tersembunyi tapi Elegan */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-lg py-8 px-6 bg-surface-container-lowest relative overflow-hidden group transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary">add_a_photo</span>
                    </div>
                    <span className="text-sm font-semibold text-primary text-center">
                      {menuFile ? `Sip! [ ${menuFile.name} ] akan naik ke R2.` : "Kirim Foto Menu ke R2 (Opsional)"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[0.75rem] font-bold text-on-surface-variant mb-2 block tracking-wide uppercase">Nama Menu *</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-5 py-4 focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow" 
                        placeholder="Contoh: Kopi Susu Aren" 
                        value={menuName} onChange={e => setMenuName(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-[0.75rem] font-bold text-on-surface-variant mb-2 block tracking-wide uppercase">Harga Jual (Rp) *</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-5 py-4 focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow" 
                        placeholder="18000" type="number" 
                        value={menuPrice} onChange={e => setMenuPrice(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Navigasi Tindakan Super */}
          <div className="flex justify-between items-center pt-4">
            {step > 1 ? (
              <button disabled={isSubmitting} onClick={prevStep} className="px-8 py-4 rounded-full text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50">
                Kembali
              </button>
            ) : <div/>} 
            
            <button 
              disabled={isSubmitting}
              onClick={step === 3 ? handleFinalSubmit : nextStep} 
              className="px-10 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? "Menyimpan ke Awan..." : (step === 3 ? "Simpan ke Supabase" : "Lanjut")}
              {!isSubmitting && <span className="material-symbols-outlined text-sm">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span>}
              {isSubmitting && <span className="material-symbols-outlined text-sm animate-spin">refresh</span>}
            </button>
          </div>
        </div>

        {/* Panel Dekorasi Kanan Penjelasan Sistem */}
        <div className="md:col-span-5 sticky top-32 hidden md:block">
           <div className="bg-surface-container-low rounded-lg p-8">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">auto_awesome</span> Info Sistem Arsitektur
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed tracking-wide">
                Apabila tombol <strong>"Simpan ke Supabase"</strong> ditekan nanti, formulir secara paralel akan 1) Meminta izin upload gambar ke R2 Cloudflare melewati Cloudflare API Token, 2) Data text (Harga, Produk, Kategori) ditembakkan langsung ke Database Supabase melalui Next.js Server Actions bertransaksi atomik.
              </p>
           </div>
        </div>
      </div>
    </main>
  );
}
