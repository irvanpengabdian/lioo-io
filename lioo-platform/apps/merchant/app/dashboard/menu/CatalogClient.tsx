"use client";
import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { createCategoryAction, updateCategoryAction, createProductAction, updateProductAction, updateProductStatusAction, deleteProductAction } from "./actions";

export default function CatalogClient({ tenantId, categories, originalProducts }: { tenantId: string, categories: any[], originalProducts: any[] }) {
  const [activeFilter, setActiveFilter] = useState("Semua Kategori");
  
  // State Dialog Interaktif UI
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Form State Kategori
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  
  // Form State Produk Menu Asli 
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCatId, setProdCatId] = useState("");
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  // Kustomisasi Modifiers F&B
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);

  // Modifiers Handlers
  const handleAddModifierGroup = () => {
    setModifierGroups([...modifierGroups, { name: "", isRequired: false, minSelect: 0, maxSelect: 1, modifiers: [{ name: "", price: 0 }] }]);
  };
  const removeModifierGroup = (idx: number) => {
    setModifierGroups(modifierGroups.filter((_, i) => i !== idx));
  };
  const updateModifierGroup = (idx: number, field: string, value: any) => {
    const updated = [...modifierGroups];
    updated[idx][field] = value;
    if (field === "isRequired" && value === true && updated[idx].minSelect === 0) {
      updated[idx].minSelect = 1; // if required, min should be at least 1
    }
    setModifierGroups(updated);
  };
  const addModifier = (gIdx: number) => {
    const updated = [...modifierGroups];
    updated[gIdx].modifiers.push({ name: "", price: 0 });
    setModifierGroups(updated);
  };
  const removeModifier = (gIdx: number, mIdx: number) => {
    const updated = [...modifierGroups];
    updated[gIdx].modifiers = updated[gIdx].modifiers.filter((_:any, i:number) => i !== mIdx);
    setModifierGroups(updated);
  };
  const updateModifier = (gIdx: number, mIdx: number, field: string, value: any) => {
    const updated = [...modifierGroups];
    updated[gIdx].modifiers[mIdx][field] = value;
    setModifierGroups(updated);
  };

  const openAddCategory = () => {
    setEditingCatId(null);
    setCatName("");
    setShowCategoryModal(true);
  };

  const openEditCategory = (c: any) => {
    setEditingCatId(c.id);
    setCatName(c.name);
    setShowCategoryModal(true);
  };

  const openAddProduct = () => {
    setEditingProdId(null);
    setProdName(""); setProdPrice(""); setProdCatId(""); setProdFile(null);
    setModifierGroups([]);
    setShowProductModal(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProdId(p.id);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdCatId(p.categoryId);
    setProdFile(null); // Assuming user re-uploads if they want to change image
    // Load existing modifiers if available
    setModifierGroups(p.modifierGroups || []);
    setShowProductModal(true);
  };

  // Manipulasi Tampilan (Derivatif Data) Data Mentah Supabase
  const products = activeFilter === "Semua Kategori" 
    ? originalProducts 
    : originalProducts.filter(p => p.category?.name === activeFilter);

  const availableCount = originalProducts.filter(p => p.isAvailable).length;
  const habisCount = originalProducts.length - availableCount;

  // Aksi Penyimpanan (Mutasi) Kategori
  const handleSaveCategory = async () => {
    if(!catName) return alert("Deskripsikan nama kategorinya terlebih dahulu.");
    setIsSubmittingCat(true);
    const result = editingCatId 
      ? await updateCategoryAction(editingCatId, catName)
      : await createCategoryAction(tenantId, catName);
    
    setIsSubmittingCat(false);
    if(result.success) {
      setShowCategoryModal(false);
      setCatName("");
    } else {
      alert(result.error);
    }
  }

  // Aksi Penyimpanan (Mutasi) Produk Menu + Unggahan Awan
  const handleSaveProduct = async () => {
     if(!prodName || !prodPrice || !prodCatId) return alert("Kesalahan: Input Nama, harga, dan Kategori diwajibkan.");
     setIsSubmittingProd(true);
     let finalImageUrl = undefined;
     
     try {
       // Cloudflare R2 Logic
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
       
       const priceVal = parseInt(prodPrice) || 0;
       
       const result = editingProdId
         ? await updateProductAction(editingProdId, prodCatId, prodName, priceVal, finalImageUrl, null, null, modifierGroups)
         : await createProductAction(tenantId, prodCatId, prodName, priceVal, finalImageUrl, null, null, modifierGroups);

       if(result.success) {
         setShowProductModal(false);
         setProdName(""); setProdPrice(""); setProdFile(null); setModifierGroups([]);
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
          <span className="text-xs font-bold tracking-[0.1em] text-primary uppercase">Kurasi Katalog</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Mahakarya yang Terus Mekar</h2>
          <p className="text-on-surface-variant max-w-md text-[13px] mt-2 leading-relaxed">Kelola Penyajian Mahakarya</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={openAddCategory} icon="new_label">Kategori Baru</Button>
          <Button variant="primary" onClick={openAddProduct} icon="add_box">Sajikan Menu</Button>
        </div>
      </section>

      {/* Tabs Filter Realtime dari Supabase Array Kategoris */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Button variant={activeFilter === "Semua Kategori" ? "primary" : "outline"} size="sm" onClick={() => setActiveFilter("Semua Kategori")} icon="apps">Semua Kategori</Button>
        {categories.map((c: any) => (
           <div key={c.id} className="flex items-center gap-1 group relative">
             <Button variant={activeFilter === c.name ? "primary" : "outline"} size="sm" onClick={() => setActiveFilter(c.name)}>
               {c.name}
             </Button>
             {/* Edit Category Button - Shows inline for active category to allow renaming */}
             {activeFilter === c.name && (
                <button onClick={() => openEditCategory(c)} className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center text-primary shadow-sm hover:scale-105" title="Edit Kategori">
                   <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
             )}
           </div>
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
            <Button variant="primary" onClick={openAddProduct}>Isi Katalog Menu Sekarang</Button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((item: any) => (
            <Card key={item.id} variant={item.isAvailable ? "interactive" : "disabled"} className="group">
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
                
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                    <span className="bg-error text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl skew-x-[-10deg]">Persediaan Kosong</span>
                  </div>
                )}

                {/* Edit Button Overlay */}
                <button onClick={() => openEditProduct(item)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full border border-outline-variant/30 flex items-center justify-center shadow-lg hover:bg-white text-primary transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
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
              
              {/* Badge info Modifiers jika ada */}
              {item.modifierGroups && item.modifierGroups.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.modifierGroups.map((mg: any, mgIdx: number) => (
                    <span key={mgIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                      {mg.name} ({mg.modifiers.length})
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                <span className={`text-[22px] font-black tracking-tighter ${item.isAvailable ? 'text-primary' : 'text-outline/70'}`}>
                   Rp {item.price.toLocaleString('id-ID')}
                </span>
                <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-error bg-error-container/40 hover:bg-error hover:text-white transition-colors active:scale-90 opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL / DIALOG UI: TAMBAH / EDIT KATEGORI */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           {/* Box beranimasi */}
           <div className="bg-surface-container-lowest p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
               <span className="material-symbols-outlined text-[24px]">new_label</span>
             </div>
             <h3 className="text-2xl font-bold mb-2 tracking-tight">{editingCatId ? "Edit Kategori" : "Kategori Baru"}</h3>
             <p className="text-sm text-on-surface-variant mb-6">{editingCatId ? "Ubah nama kategori menu ini." : "Pisahkan menu Anda menjadi kelompok-kelompok elegan."}</p>
             <input className="w-full bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl mb-8 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium" placeholder="Misal: Signature Coffee" value={catName} onChange={e=>setCatName(e.target.value)} />
             <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-6">
               <button onClick={()=>setShowCategoryModal(false)} className="px-6 py-3 font-bold text-sm text-on-surface hover:bg-surface-container-high rounded-full transition-colors">Batal</button>
               <button onClick={handleSaveCategory} disabled={isSubmittingCat} className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-full shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2">
                 {isSubmittingCat ? "Menyimpan ke Supabase..." : "Simpan Kategori"} 
                 <span className="material-symbols-outlined text-[16px]">check_circle</span>
               </button>
             </div>
           </div>
        </div>
      )}

      {/* MODAL / DIALOG UI: TAMBAH / EDIT PRODUK & KUSTOMISASI MODIFIERS */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-surface-container-lowest p-8 rounded-[32px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[95vh] flex flex-col ring-1 ring-white/10">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-2xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
                 {editingProdId ? "Ubah Sajian Menu" : "Pajang Menu Baru"} <span className="material-symbols-outlined text-primary text-[28px]">fastfood</span>
               </h3>
               <button onClick={()=>setShowProductModal(false)} className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-error-container hover:text-error flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
               </button>
             </div>
             
             <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
               {/* Detail Menu Induk */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[11px] font-black text-on-surface-variant mb-2 block uppercase tracking-widest">Wadah Kategori</label>
                    <select value={prodCatId} onChange={e=>setProdCatId(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-bold text-sm">
                       <option value="" disabled>--- Pilih Kategori & Wadah ---</option>
                       {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 
                 <div>
                    <label className="text-[11px] font-black text-on-surface-variant mb-2 block uppercase tracking-widest">Foto Visualisasi (R2)</label>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center overflow-hidden relative">
                         {prodFile ? <img src={URL.createObjectURL(prodFile)} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/50 text-[24px]">image</span>}
                       </div>
                       <input type="file" accept="image/*" onChange={e => setProdFile(e.target.files?.[0] || null)} className="w-full text-xs text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-black file:bg-primary file:text-white hover:file:bg-primary/80 transition-all cursor-pointer border border-dashed border-outline-variant/50 p-2 rounded-2xl" />
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

               {/* Bagian Customisasi (Modifiers F&B) */}
               <div className="pt-6 border-t border-outline-variant/30">
                 <div className="flex justify-between items-center mb-4">
                   <div>
                     <h4 className="font-extrabold text-[#1A1C19]">Opsi Tambahan & Kustomisasi (Add-ons)</h4>
                     <p className="text-xs text-on-surface-variant mt-1">Buat varian menu seperti Ice/Hot, Sugar Level, Extra Topping, dsb.</p>
                   </div>
                   <button onClick={handleAddModifierGroup} className="shrink-0 px-4 py-2 border border-primary/30 text-primary hover:bg-primary-container/20 font-bold text-xs rounded-full flex items-center gap-1 transition-colors">
                     <span className="material-symbols-outlined text-[16px]">add</span> Buat Grup
                   </button>
                 </div>

                 {modifierGroups.length === 0 && (
                   <div className="p-6 text-center bg-surface-container border border-dashed border-outline-variant/30 rounded-2xl">
                     <span className="material-symbols-outlined text-outline/40 mb-2">lists</span>
                     <p className="text-sm font-medium text-on-surface-variant">Belum ada grup kustomisasi untuk menu ini.</p>
                   </div>
                 )}
                 
                 <div className="space-y-4">
                   {modifierGroups.map((group, gIdx) => (
                     <div key={gIdx} className="bg-white border border-outline-variant/30 rounded-2xl p-4 shadow-sm relative group overflow-hidden">
                        <button onClick={() => removeModifierGroup(gIdx)} className="absolute top-4 right-4 text-outline hover:text-error bg-surface-container hover:bg-error-container w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                        
                        <div className="pr-12">
                          <input className="w-full lg:w-3/4 font-extrabold text-lg bg-transparent border-b-2 border-outline-variant/20 focus:border-primary outline-none px-1 py-1 mb-4" placeholder="Nama Grup (Misal: Ice/Hot, Ukuran)" value={group.name} onChange={e => updateModifierGroup(gIdx, 'name', e.target.value)} />
                        </div>
                        
                        <div className="flex flex-wrap gap-6 mb-5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                           <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-outline" checked={group.isRequired} onChange={e => updateModifierGroup(gIdx, 'isRequired', e.target.checked)} />
                             <div className="flex flex-col">
                               <span className="text-sm font-bold text-on-surface">Pilihan Wajib?</span>
                               <span className="text-[10px] text-on-surface-variant">Customer harus memilih ini</span>
                             </div>
                           </label>
                           
                           <div className="h-8 w-px bg-outline-variant/30 hidden sm:block"></div>

                           <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-on-surface-variant">Batas Minimum Pilihan</span>
                               <input type="number" min={group.isRequired ? 1 : 0} className="w-16 px-2 py-1 text-center font-bold text-sm bg-white border border-outline-variant/50 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={group.minSelect} onChange={e => updateModifierGroup(gIdx, 'minSelect', Math.max(group.isRequired ? 1 : 0, parseInt(e.target.value)||0))} />
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-on-surface-variant">Maksimum</span>
                               <input type="number" min={1} className="w-16 px-2 py-1 text-center font-bold text-sm bg-white border border-outline-variant/50 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={group.maxSelect} onChange={e => updateModifierGroup(gIdx, 'maxSelect', Math.max(1, parseInt(e.target.value)||1))} />
                             </div>
                           </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="grid grid-cols-12 gap-2 px-2 pb-1 border-b border-outline-variant/20 mb-2">
                            <div className="col-span-8 text-[10px] font-black uppercase tracking-widest text-outline">Nama Pilihan (Modifier)</div>
                            <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-outline">Harga Tambahan</div>
                          </div>
                          {group.modifiers.map((mod: any, mIdx: number) => (
                            <div key={mIdx} className="grid grid-cols-12 gap-2 items-center group/item hover:bg-surface-container-low p-1.5 rounded-lg transition-colors">
                              <div className="col-span-8 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[14px] text-outline opacity-50">label</span>
                                <input className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-white border border-outline-variant/30 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ice, Normal Sugar, Extra Keju..." value={mod.name} onChange={e => updateModifier(gIdx, mIdx, 'name', e.target.value)} />
                              </div>
                              <div className="col-span-3 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-on-surface-variant">Rp</span>
                                <input type="number" className="w-full pl-6 pr-2 py-2 text-sm font-bold bg-white border border-outline-variant/30 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="0" value={mod.price} onChange={e => updateModifier(gIdx, mIdx, 'price', parseInt(e.target.value)||0)} />
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <button onClick={() => removeModifier(gIdx, mIdx)} className="text-outline hover:text-error w-7 h-7 bg-surface-container shadow border border-outline-variant/20 rounded-full flex items-center justify-center transition-colors">
                                  <span className="material-symbols-outlined text-[14px]">remove</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => addModifier(gIdx)} className="mt-3 px-3 py-1.5 bg-secondary-container/30 text-primary font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-secondary-container/60 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">add_circle</span> Tambah Opsi Lainnya
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             <div className="mt-4 pt-6 border-t border-outline-variant/20 flex gap-4 justify-end shrink-0">
               <button onClick={()=>setShowProductModal(false)} className="px-8 py-4 rounded-full font-bold text-sm text-on-surface hover:bg-surface-container-highest transition-colors">Batalkan</button>
               <button disabled={isSubmittingProd || !prodCatId} onClick={handleSaveProduct} className="min-w-[200px] py-4 rounded-full font-extrabold text-sm text-white bg-primary hover:scale-[1.02] shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2">
                  {isSubmittingProd ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">rocket_launch</span>}
                  {isSubmittingProd ? "Merespon Satelit..." : (editingProdId ? "Berlakukan Perubahan" : "Publikasikan Menu")}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
