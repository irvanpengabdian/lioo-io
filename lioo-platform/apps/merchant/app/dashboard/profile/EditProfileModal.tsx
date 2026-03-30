"use client";

import { useState } from "react";
import { updateStoreProfile } from "./actions";

export default function EditProfileModal({ 
  tenant, 
  onClose 
}: { 
  tenant: any; 
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: tenant.name || "",
    merchantCategory: tenant.merchantCategory || "",
    description: tenant.description || "",
    contactNumber: tenant.contactNumber || "",
    address: tenant.address || "",
    selfServiceTheme: tenant.selfServiceTheme || "Minimalist Green",
    logoUrl: tenant.logoUrl || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(tenant.logoUrl || "");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    
    if (!res.ok) throw new Error("Gagal menginisiasi upload R2");
    
    const { presignedUrl, objectKey } = await res.json();
    
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    
    if (!uploadRes.ok) throw new Error("Gagal mengupload file ke Cloudflare");
    
    return process.env.NEXT_PUBLIC_R2_PUBLIC_URL + "/" + objectKey;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalLogoUrl = formData.logoUrl;
      
      if (logoFile) {
        finalLogoUrl = await uploadLogo(logoFile);
      }
      
      await updateStoreProfile({
        ...formData,
        logoUrl: finalLogoUrl,
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-outline-variant/30 px-8 py-6 z-10 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-[#1A1C19]">Edit Profil Toko</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-outline">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 bg-surface-container-low rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-outline-variant relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-outline text-3xl">add_photo_alternate</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white">edit</span>
              </div>
              {/* @ts-ignore */}
              <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A1C19]">Visual Identity (Logo)</h3>
              <p className="text-xs text-outline mb-2">Format JPG, PNG maksimal 2MB. Resolusi disarankan 1:1.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Nama Merchant *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Kategori Bisnis</label>
              <select value={formData.merchantCategory} onChange={e => setFormData({...formData, merchantCategory: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium">
                <option value="">Pilih Kategori...</option>
                <option value="Coffee Shop">Coffee Shop</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Warung Tradisional">Warung Tradisional</option>
                <option value="Bakery & Pastry">Bakery & Pastry</option>
                <option value="Food Truck">Food Truck</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Deskripsi Singkat</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ceritakan sedikit tentang toko Anda..." className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Nomor Kontak (WhatsApp)</label>
              <input type="tel" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="+62 8..." className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Tema Self-Service</label>
              <select value={formData.selfServiceTheme} onChange={e => setFormData({...formData, selfServiceTheme: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium">
                 <option value="Minimalist Green">Minimalist Green</option>
                 <option value="Dark Forest">Dark Forest</option>
                 <option value="Classic Light">Classic Light</option>
                 <option value="Vibrant Orange">Vibrant Orange</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">Alamat Lengkap Cabang</label>
            {/* @ts-ignore */}
            <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Alamat detail..." className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium"></textarea>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30 mt-8">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-full font-bold text-outline hover:bg-surface-container transition-colors text-sm">Batal</button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-full font-bold bg-primary text-white shadow-md hover:opacity-90 active:scale-95 transition-all text-sm flex items-center gap-2">
              {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
