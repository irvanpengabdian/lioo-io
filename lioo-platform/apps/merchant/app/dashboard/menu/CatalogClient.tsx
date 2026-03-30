"use client";
import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { createCategoryAction, createProductAction, updateProductStatusAction, deleteProductAction } from "./actions";

export default function CatalogClient({ tenantId, categories, originalProducts }: { tenantId: string, categories: any[], originalProducts: any[] }) {
  const [activeFilter, setActiveFilter] = useState("Semua Kategori");
  
  // State Dialog Interaktif UI
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Form State Kategori
  const [catName, setCatName] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  
  // Form State Produk Menu Asli 
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCatId, setProdCatId] = useState("");
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  // Manipulasi Tampilan (Derivatif Data) Data Mentah Supabase
  const products = activeFilter === "Semua Kategori" 
    ? originalProducts 
    : originalProducts.filter(p => p.category?.name === activeFilter);

  const availableCount = originalProducts.filter(p => p.isAvailable).length;
  const habisCount = originalProducts.length - availableCount;

  // Aksi Penyimpanan (Mutasi) Kategori
  const handleCreateCategory = async () => {
    if(!catName) return alert("Deskripsikan nama kategorinya terlebih dahulu.");
    setIsSubmittingCat(true);
    const result = await createCategoryAction(tenantId, catName);
    setIsSubmittingCat(false);
    if(result.success) {
      setShowCategoryModal(false);
      setCatName("");
      // Halaman akan Refresh Otomatis tanpa reload lewat `revalidatePath` di Next.js Cache
    } else {
      alert(result.error);
    }
  }

  // Aksi Penyimpanan (Mutasi) Produk Menu + Unggahan Awan
  const handleCreateProduct = async () => {
     if(!prodName || !prodPrice || !prodCatId) return alert("Kesalahan: Input Nama, harga, dan Kategori diwajibkan.");
     setIsSubmittingProd(true);
     let finalImageUrl = undefined;
     
     try {
       // Cloudflare R2 Logic (Sama seperti halaman Onboarding yang sukses kemarin)
       if (prodFile) {
         const res = await fetch("/api/upload", {
           method: "POST",
           body: JSON.stringify({ filename: prodFile.name, contentType: prodFile.type })
         });
         const uploadData = await res.json();
         if (!res.ok) throw new Error(uploadData.error);
         
         await fetch(uploadData.presignedUrl, {
           method: "PUT",
           headers: { "Content-Type": prodFile.type },
           body: prodFile
         });
         const pubUrl = "https://pub-501143c8a0bb45a783bbe742cd5c6722.r2.dev";
         finalImageUrl = `${pubUrl}/${uploadData.objectKey}`;
       }
       
       const result = await createProductAction(tenantId, prodCatId, prodName, parseInt(prodPrice) || 0, finalImageUrl);
       if(result.success) {
         setShowProductModal(false);
         setProdName(""); setProdPrice(""); setProdFile(null);
       } else {
         alert(result.error);
       }
     } catch(e) {
       console.error(e);
       alert("Network Error. Gagal menyelaraskan gambar dengan R2 Cloudflare.");
     } finally {
       setIsSubmittingProd(false);
     }
  }

  // Update Cepat Mode Interaktif "Tersedia" menjadi "Habis"
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
     await updateProductStatusAction(id, !currentStatus);
  }

  // Aksi Penghapusan Destruktif
  const handleDelete = async (id: string) => {
     if(confirm("AWAS: Menu ini dan seluruh informasinya akan dihapus selamanya secara destruktif dari tabel Data Produksi. Anda yakin?")) {
        await deleteProductAction(id);
     }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Elegan */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-[0.1em] text-primary uppercase">Catalog Explorer - Supabase Integration</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Menu Terdinamis Anda</h2>
          <p className="text-on-surface-variant max-w-md text-[13px] mt-2 leading-relaxed">Kelola penyajian hidangan dengan data asli dari satelit Prisma PostgreSQL.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowCategoryModal(true)} icon="new_label">Kategori Baru</Button>
          <Button variant="primary" onClick={() => setShowProductModal(true)} icon="add_box">Sajikan Menu</Button>
        </div>
      </section>

      {/* Tabs Filter Realtime dari Supabase Array Kategoris */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Button variant={activeFilter === "Semua Kategori" ? "primary" : "outline"} size="sm" onClick={() => setActiveFilter("Semua Kategori")} icon="apps">Semua Kategori</Button>
        {categories.map((c: any) => (
           <Button key={c.id} variant={activeFilter === c.name ? "primary" : "outline"} size="sm" onClick={() => setActiveFilter(c.name)}>
             {c.name}
           </Button>
        ))}
        
        {/* Info Stats (Auto Computed) */}
        <div className="ml-auto flex items-center gap-4 text-on-surface-variant border border-outline-variant/20 px-4 py-2 rounded-full bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs font-bold text-on-surface">{availableCount} Tampil</span>
          </div>
          <div className="w-px h-3 bg-outline-variant"></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="text-xs font-bold text-on-surface text-error">{habisCount} Habis Terjual</span>
          </div>
        </div>
      </div>

      {/* RENDER DATA AKTUAL (Bento Grid Lioo.io System) */}
      {products.length === 0 ? (
         <div className="py-24 text-center border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface-container-lowest animate-in zoom-in-95">
            <span className="material-symbols-outlined text-[64px] text-outline/40 mb-2 block">database_off</span>
            <h3 className="text-xl font-extrabold text-on-surface tracking-tight">Katalog Masih Kosong</h3>
            <p className="text-on-surface-variant text-sm mt-1 mb-8 max-w-sm mx-auto">Tabel Product di Supabase tidak mendeteksi kemunculan menu untuk kategori ini.</p>
            <Button variant="primary" onClick={() => setShowProductModal(true)}>Isi Katalog Menu Sekarang</Button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((item: any) => (
            <Card key={item.id} variant={item.isAvailable ? "interactive" : "disabled"}>
              {/* Gambar Image Overlay */}
              <div className={`relative mb-4 aspect-square rounded-2xl overflow-hidden ${!item.isAvailable ? 'grayscale opacity-75' : ''} bg-surface-container-highest shadow-inner`}>
                {item.imageUrl ? (
                   <img src={item.imageUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                     <span className="material-symbols-outlined text-[64px] text-primary/30">{item.category?.icon || 'restaurant'}</span>
                   </div>
                )}
                
                {/* Chip Kategori di pojok gambar */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md shadow-sm rounded-full border border-white/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{item.category?.name || "Kategori"}</span>
                </div>
                
                {/* Layar "Habis" apabila tombol toggle dimatikan */}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                    <span className="bg-error text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl skew-x-[-10deg]">Persediaan Kosong</span>
                  </div>
                )}
              </div>
              
              {/* Grup Teks Judul dan Switcher Ketersediaan Cepat */}
              <div className="flex justify-between items-start mb-2 mt-4 space-x-2">
                <h3 className="font-bold text-lg text-on-surface leading-tight font-sans tracking-tight line-clamp-2">{item.name}</h3>
                
                <button 
                  onClick={() => handleToggleStatus(item.id, item.isAvailable)}
                  className={`cursor-pointer text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-md border font-extrabold flex-shrink-0 transition-all ${item.isAvailable ? 'bg-secondary-container/50 text-secondary border-secondary/20 hover:bg-secondary hover:text-white shadow-sm' : 'bg-error-container text-on-error-container border-error/20 hover:bg-error hover:text-white shadow-sm'}`}>
                  {item.isAvailable ? "Tersedia" : "Tandai Habis"}
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-6">
                <span className={`text-[22px] font-black tracking-tighter ${item.isAvailable ? 'text-primary' : 'text-outline/70'}`}>
                   Rp {item.price.toLocaleString('id-ID')}
                </span>
                <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-error bg-error-container/40 hover:bg-error hover:text-white transition-colors active:scale-90">
                  <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL / DIALOG UI: TAMBAH KATEGORI */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           {/* Box beranimasi */}
           <div className="bg-surface-container-lowest p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
               <span className="material-symbols-outlined text-[24px]">new_label</span>
             </div>
             <h3 className="text-2xl font-bold mb-2 tracking-tight">Kategori Baru</h3>
             <p className="text-sm text-on-surface-variant mb-6">Pisahkan menu Anda menjadi kelompok-kelompok elegan.</p>
             <input className="w-full bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl mb-8 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium" placeholder="Misal: Signature Coffee" value={catName} onChange={e=>setCatName(e.target.value)} />
             <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-6">
               <button onClick={()=>setShowCategoryModal(false)} className="px-6 py-3 font-bold text-sm text-on-surface hover:bg-surface-container-high rounded-full transition-colors">Batal</button>
               <button onClick={handleCreateCategory} disabled={isSubmittingCat} className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-full shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2">
                 {isSubmittingCat ? "Menyimpan ke Supabase..." : "Simpan Kategori"} 
                 <span className="material-symbols-outlined text-[16px]">check_circle</span>
               </button>
             </div>
           </div>
        </div>
      )}

      {/* MODAL / DIALOG UI: TAMBAH PRODUK/MENU MENUJU CLOUDFLARE R2 */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-surface-container-lowest p-8 rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col ring-1 ring-white/10">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
                 Pajang Menu Baru <span className="material-symbols-outlined text-primary text-[28px]">fastfood</span>
               </h3>
               <button onClick={()=>setShowProductModal(false)} className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-error-container hover:text-error flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
               </button>
             </div>
             
             <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
               <div>
                  <label className="text-[11px] font-black text-on-surface-variant mb-2 block uppercase tracking-widest">Wadah Kategori</label>
                  <select value={prodCatId} onChange={e=>setProdCatId(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-bold text-sm">
                     <option value="" disabled>--- Pilih Kategori Dahulu ---</option>
                     {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               
               <div>
                  <label className="text-[11px] font-black text-on-surface-variant mb-2 block uppercase tracking-widest">Foto Visualisasi (Terkoneksi ke R2)</label>
                  <div className="flex items-center gap-4">
                     {/* Preview Box Placeholder */}
                     <div className="w-20 h-20 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center overflow-hidden relative">
                       {prodFile ? <img src={URL.createObjectURL(prodFile)} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/50 text-[32px]">image</span>}
                     </div>
                     <input type="file" accept="image/*" onChange={e => setProdFile(e.target.files?.[0] || null)} className="w-full text-xs text-on-surface file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary file:text-white hover:file:bg-primary/80 transition-all cursor-pointer border border-dashed border-outline-variant/50 p-3 rounded-2xl" />
                  </div>
               </div>

               <div>
                 <label className="text-[11px] font-black text-on-surface-variant mb-2 block uppercase tracking-widest">Nama Hidangan</label>
                 <input className="w-full bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-sm" placeholder="Contoh: Triple Shot Expresso" value={prodName} onChange={e=>setProdName(e.target.value)} />
               </div>
               
               <div>
                 <label className="text-[11px] font-black text-on-surface-variant mb-2 block uppercase tracking-widest">Harga Dasar (Rupiah)</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">Rp</span>
                    <input type="number" className="w-full bg-surface-container-low border border-outline-variant/30 py-4 pl-12 pr-4 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-sm" placeholder="25000" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} />
                 </div>
               </div>
             </div>

             <div className="mt-6 pt-6 border-t border-outline-variant/20 flex gap-3 justify-end shrink-0">
               <button disabled={isSubmittingProd || !prodCatId} onClick={handleCreateProduct} className="w-full py-4 rounded-full font-extrabold text-sm text-white bg-primary hover:scale-[1.02] shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2">
                  {isSubmittingProd ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">rocket_launch</span>}
                  {isSubmittingProd ? "Merespon Satelit Database..." : "Publish Menu Secara Live"}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
