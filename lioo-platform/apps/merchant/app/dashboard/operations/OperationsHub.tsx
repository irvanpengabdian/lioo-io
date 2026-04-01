"use client";

/**
 * Tautan POS (`posLoginUrl`, `posTerminalUrl`) dibangun di `page.tsx` mengikuti kontrak
 * dokumentasi di sana — ubah path POS (login, auth-callback, /pos) di apps/pos hanya
 * bersamaan dengan penyesuaian server component tersebut.
 */

import { useState } from "react";
import { Role } from "@prisma/client";
import { ROLE_LABELS } from "@repo/database";

type Props = {
  tenantName: string;
  tenantSlug: string;
  userRole: Role;
  /** Lihat kontrak di operations/page.tsx */
  posLoginUrl: string;
  /** Lihat kontrak di operations/page.tsx */
  posTerminalUrl: string;
  orderBaseUrl: string;
  takeawayPath: string;
  tablePath: string;
  kdsUrl: string | null;
};

function CopyRow({ label, url, hint }: { label: string; url: string; hint?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-[#EDEEE9] bg-[#F9FAF5] p-4">
      <p className="text-xs font-bold text-[#43493E] uppercase tracking-wider mb-1">{label}</p>
      {hint && <p className="text-xs text-[#787868] mb-2">{hint}</p>}
      <div className="flex items-center gap-2">
        <code className="text-xs text-[#1A1C19] break-all flex-1 font-mono">{url}</code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0 text-xs font-semibold text-primary hover:underline"
        >
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
    </div>
  );
}

export default function OperationsHub({
  tenantName,
  tenantSlug,
  userRole,
  posLoginUrl,
  posTerminalUrl,
  orderBaseUrl,
  takeawayPath,
  tablePath,
  kdsUrl,
}: Props) {
  const takeawayFull = `${orderBaseUrl}${takeawayPath}`;
  const tableExample = `${orderBaseUrl}${tablePath}`;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1A1C19] mb-2">Operasional</h1>
      <p className="text-sm text-[#787868] mb-8">
        Hubungkan kasir (POS), dapur (KDS), dan pemesanan pelanggan dengan data toko{" "}
        <span className="font-semibold text-[#1A1C19]">{tenantName}</span>. Menu yang Anda kelola di{" "}
        <strong>Menu Management</strong> tersinkron untuk POS dan portal order.
      </p>
      <p className="text-xs text-[#787868] mb-6">
        Role Anda: <span className="font-semibold text-primary">{ROLE_LABELS[userRole]}</span>
      </p>

      <div className="space-y-6">
        {(userRole === Role.OWNER ||
          userRole === Role.MANAGER ||
          userRole === Role.STAFF) && (
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(44,79,27,0.06)] p-6">
            <h2 className="text-sm font-bold text-[#1A1C19] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
              Terminal kasir (POS)
            </h2>
            <p className="text-sm text-[#787868] mb-4">
              Login di domain POS (sesi terpisah dari merchant). Setelah verifikasi, Anda diarahkan ke terminal{" "}
              <code className="text-xs bg-[#F3F4EF] px-1 rounded">/pos</code>. Staff memakai akun yang sudah
              diundang ke toko ini.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={posLoginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Login &amp; buka POS
              </a>
              <a
                href={posTerminalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#7C8B6F]/40 text-[#2C4F1B] px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#F3F4EF] transition-all"
              >
                <span className="material-symbols-outlined text-lg">point_of_sale</span>
                Langsung ke /pos
              </a>
            </div>
          </section>
        )}

        {(userRole === Role.OWNER ||
          userRole === Role.MANAGER ||
          userRole === Role.STAFF ||
          userRole === Role.FINANCE) && (
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(44,79,27,0.06)] p-6">
            <h2 className="text-sm font-bold text-[#1A1C19] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">shopping_bag</span>
              Portal pelanggan (order)
            </h2>
            <p className="text-sm text-[#787868] mb-4">
              Pelanggan memesan lewat URL outlet (takeaway/delivery) atau QR meja. Ganti{" "}
              <code className="text-xs bg-[#F3F4EF] px-1 rounded">{tenantSlug}</code> sesuai slug toko Anda.
            </p>
            <div className="space-y-3">
              <CopyRow
                label="Pesan takeaway / outlet (slug)"
                url={takeawayFull}
                hint={`Path: /o/${tenantSlug}`}
              />
              <CopyRow
                label="Pesan di meja (QR)"
                url={tableExample}
                hint="Ganti [token-meja] dengan qrToken dari data Table di database. Manajemen meja & QR menyusul di roadmap."
              />
            </div>
          </section>
        )}

        {(userRole === Role.OWNER ||
          userRole === Role.MANAGER ||
          userRole === Role.KITCHEN) && (
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(44,79,27,0.06)] p-6">
            <h2 className="text-sm font-bold text-[#1A1C19] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
              Dapur (KDS)
            </h2>
            {kdsUrl ? (
              <a
                href={kdsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1A1C19] text-white px-5 py-2.5 rounded-full font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-lg">open_in_new</span>
                Buka KDS
              </a>
            ) : (
              <p className="text-sm text-[#787868]">
                Set environment variable <code className="text-xs bg-[#F3F4EF] px-1 rounded">NEXT_PUBLIC_KDS_URL</code>{" "}
                agar tautan KDS aktif. Aplikasi KDS mengikuti roadmap realtime kitchen display.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
