export default function MerchantOnboarding() {
  return (
    <main className="pt-20 pb-20 px-6 max-w-4xl mx-auto wizard-container min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full bg-background/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tighter text-primary">lioo.io Merchant</span>
          </div>
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
            <span className="text-sm font-semibold">Keluar</span>
            <span className="material-symbols-outlined text-lg group-active:scale-95 transition-transform">close</span>
          </button>
        </div>
      </header>
      
      <div className="mb-12 mt-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Langkah 1 dari 3</span>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Atur Profil Toko</h1>
          </div>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="progress-bar h-full bg-primary" style={{ width: "33.33%" }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7 space-y-8">
          <section className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-outline-variant/20">
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/50 rounded-lg py-12 px-6 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">Unggah Logo Toko</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[0.75rem] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Nama Toko</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-5 py-4 text-on-surface transition-all outline-none" placeholder="Contoh: Kopi Senja Abadi" type="text" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Username @lioo.io</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-5 py-4 text-on-surface transition-all outline-none" placeholder="kopisenja" type="text" />
                </div>
              </div>
            </div>
          </section>
          <div className="flex justify-between items-center pt-4">
            <button className="px-8 py-4 rounded-full text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors">
              Lewati
            </button>
            <button className="px-10 py-4 rounded-full bg-gradient-to-br from-primary-container to-primary text-white font-bold text-sm shadow-xl shadow-primary/10 flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
              Lanjut ke Dashboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-5 sticky top-32">
          <div className="bg-surface-container-low rounded-lg p-8 relative overflow-hidden group">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              Mengapa Ini Penting?
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Identitas toko Anda adalah hal pertama yang dilihat pelanggan. Dengan profil yang lengkap, tingkat kepercayaan pelanggan meningkat hingga <span className="text-primary font-bold">45%</span> saat melakukan pemesanan digital.
            </p>
            <div className="mt-8 flex items-start gap-4 p-4 rounded-lg bg-white/40 backdrop-blur-sm">
              <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              <div>
                <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-primary mb-1">Keamanan Data</span>
                <p className="text-[0.75rem] text-on-surface-variant leading-tight">Data toko Anda dienkripsi dan aman bersama sistem lioo.io</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
