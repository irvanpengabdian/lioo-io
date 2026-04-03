"use client";

export default function KdsSetupModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kds-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8EBE3]">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-[#EDEEE9] px-6 py-4 flex justify-between items-center">
          <h2 id="kds-modal-title" className="text-lg font-bold text-[#1A1C19]">
            Hubungkan layar dapur (KDS)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-[#F3F4EF] flex items-center justify-center text-outline"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5 text-sm text-[#43493E]">
          <p className="text-[#787868]">
            Kitchen Display System menampilkan pesanan ke dapur secara realtime. Ikuti langkah berikut untuk
            mengaktifkan tautan dari dashboard ini.
          </p>
          <ol className="list-decimal pl-5 space-y-3 font-medium">
            <li>
              Deploy aplikasi KDS (roadmap) dan catat URL publiknya, misalnya{" "}
              <code className="text-xs bg-[#F3F4EF] px-1.5 py-0.5 rounded">https://kds.outlet-anda.com</code>
            </li>
            <li>
              Di environment deployment <strong>merchant</strong> (Vercel / server), set variabel{" "}
              <code className="text-xs bg-[#F3F4EF] px-1.5 py-0.5 rounded">NEXT_PUBLIC_KDS_URL</code> ke URL
              tersebut tanpa slash di akhir.
            </li>
            <li>Redeploy merchant dashboard, lalu buka kembali halaman Operasional — tombol &quot;Buka KDS&quot; akan aktif.</li>
          </ol>
          <p className="text-xs text-[#787868]">
            Butuh bantuan deployment? Hubungi tim support lioo.io dari menu Support.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:opacity-95"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
