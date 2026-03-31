"use client";

import { useState } from "react";

interface WalletTransaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  xenditId: string | null;
  createdAt: string;
}

interface Props {
  tenantName: string;
  tenantId: string;
  walletBalance: number;
  totalCredit: number;
  totalDebit: number;
  paymentStatus: string | null;
  transactions: WalletTransaction[];
}

const TOPUP_PACKAGES = [
  {
    id: "lite",
    label: "Top-up Ringan",
    transactions: 20,
    price: 20000,
    featured: false,
  },
  {
    id: "bisnis",
    label: "Top-up Bisnis",
    transactions: 55,
    price: 50000,
    featured: false,
  },
  {
    id: "populer",
    label: "Paling Populer",
    transactions: 120,
    price: 100000,
    featured: true,
  },
];

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB",
  };
}

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function WalletClient({
  tenantName,
  tenantId,
  walletBalance,
  totalCredit,
  totalDebit,
  paymentStatus,
  transactions,
}: Props) {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPaymentBanner, setShowPaymentBanner] = useState(paymentStatus !== null);

  // walletBalance dari server (ini dalam Rupiah sesuai schema)
  const balance = walletBalance;

  // Progress bar: hitung persentase terpakai dari total top-up yang pernah masuk
  const usedAmount = totalDebit;
  const totalEver = totalCredit || 1;
  const usagePct = Math.min(100, Math.round((usedAmount / totalEver) * 100));

  async function handleTopup(pkg: (typeof TOPUP_PACKAGES)[0]) {
    setLoadingPackage(pkg.id);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          amount: pkg.price,
          transactions: pkg.transactions,
          tenantId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat invoice");
      // Redirect ke halaman pembayaran Xendit
      window.location.href = data.invoiceUrl;
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingPackage(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="text-xs font-bold tracking-[0.1em] text-primary uppercase">
          Sprout Wallet
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">
          Kredit Transaksi
        </h1>
        <p className="text-on-surface-variant text-[13px] mt-2 leading-relaxed max-w-lg">
          Pantau saldo dan isi ulang kredit untuk memproses pesanan dari{" "}
          <span className="font-bold text-primary">{tenantName}</span>.
        </p>
      </div>

      {/* Payment Redirect Banner */}
      {showPaymentBanner && paymentStatus === "success" && (
        <div className="mb-6 p-4 bg-secondary-container/40 rounded-2xl flex items-center gap-3 text-on-secondary-fixed-variant border border-secondary/20 animate-in fade-in">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            check_circle
          </span>
          <div>
            <p className="text-sm font-bold">Pembayaran Berhasil!</p>
            <p className="text-[12px] opacity-80">Kredit wallet kamu akan segera diperbarui setelah konfirmasi dari Xendit.</p>
          </div>
          <button
            onClick={() => setShowPaymentBanner(false)}
            className="ml-auto text-on-secondary-fixed-variant hover:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {showPaymentBanner && paymentStatus === "failed" && (
        <div className="mb-6 p-4 bg-error-container rounded-2xl flex items-center gap-3 text-on-error-container border border-error/20 animate-in fade-in">
          <span className="material-symbols-outlined text-error text-[22px]">
            cancel
          </span>
          <div>
            <p className="text-sm font-bold">Pembayaran Gagal atau Dibatalkan</p>
            <p className="text-[12px] opacity-80">Silakan coba kembali. Creditmu belum dikurangi.</p>
          </div>
          <button
            onClick={() => setShowPaymentBanner(false)}
            className="ml-auto text-on-error-container hover:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-error-container rounded-2xl flex items-center gap-3 text-on-error-container border border-error/20 animate-in fade-in">
          <span className="material-symbols-outlined text-error">
            error_outline
          </span>
          <span className="text-sm font-medium">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-error hover:text-error/70"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* BENTO GRID: Balance Card + Top-up Card */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* ── Balance Card (8 cols) ── */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group shadow-[0_12px_40px_rgba(67,73,62,0.06)] animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Dekorasi latar belakang */}
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-primary/4 rounded-full blur-3xl group-hover:bg-primary/8 transition-colors duration-1000 pointer-events-none" />
          <div className="absolute -right-4 -bottom-8 w-48 h-48 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header row */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
                  Transaction Quota
                </span>
                <h2 className="text-3xl font-extrabold text-primary mt-2">
                  Sisa Kredit Transaksi
                </h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary-container/30 text-on-secondary-fixed-variant rounded-full">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-xs font-bold">Status: Aktif</span>
              </div>
            </div>

            {/* Balance display */}
            <div className="flex items-baseline gap-4 mt-4">
              <span className="text-7xl font-black tracking-tighter text-primary tabular-nums">
                {formatRp(balance)}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Total Top-up
                </p>
                <p className="text-lg font-black text-primary">
                  {formatRp(totalCredit)}
                </p>
              </div>
              <div className="w-px bg-outline-variant/20" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Sudah Terpakai
                </p>
                <p className="text-lg font-black text-on-surface">
                  {formatRp(totalDebit)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-3">
                <span>Kapasitas Digunakan</span>
                <span>{usagePct}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                  style={{
                    width: `${Math.min(usagePct, 70)}%`,
                  }}
                />
                <div
                  className="h-full bg-secondary transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.max(0, Math.min(usagePct - 70, 20))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-4 leading-relaxed max-w-md">
                Saldo kredit akan berkurang setiap kali pesanan baru diproses.
                Pastikan saldo mencukupi untuk menghindari gangguan layanan.
              </p>
            </div>
          </div>
        </section>

        {/* ── Quick Top-up Card (4 cols) ── */}
        <section className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 shadow-[0_12px_40px_rgba(67,73,62,0.06)] border border-outline-variant/10 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                bolt
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary">Isi Ulang Cepat</h3>
          </div>

          <div className="space-y-4">
            {TOPUP_PACKAGES.map((pkg) =>
              pkg.featured ? (
                /* Featured package */
                <button
                  key={pkg.id}
                  onClick={() => handleTopup(pkg)}
                  disabled={loadingPackage !== null}
                  className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#436831] to-[#2C4F1B] flex justify-between items-center shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/20 group"
                >
                  <div className="text-left text-white">
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-wider mb-1">
                      {pkg.label}
                    </p>
                    <p className="text-xl font-black">
                      + {pkg.transactions} Transaksi
                    </p>
                  </div>
                  {loadingPackage === pkg.id ? (
                    <span className="material-symbols-outlined text-primary bg-white px-4 py-2 rounded-full font-black text-sm animate-spin">
                      refresh
                    </span>
                  ) : (
                    <span className="text-primary font-black text-sm bg-white px-4 py-2 rounded-full group-hover:scale-105 transition-transform">
                      {formatRp(pkg.price)}
                    </span>
                  )}
                </button>
              ) : (
                /* Regular packages */
                <button
                  key={pkg.id}
                  onClick={() => handleTopup(pkg)}
                  disabled={loadingPackage !== null}
                  className="w-full p-5 rounded-2xl border border-outline-variant/20 flex justify-between items-center hover:bg-surface-container-low hover:border-primary/40 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-primary">{pkg.label}</p>
                    <p className="text-lg font-black text-on-surface">
                      + {pkg.transactions} Transaksi
                    </p>
                  </div>
                  {loadingPackage === pkg.id ? (
                    <span className="material-symbols-outlined text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full animate-spin text-sm">
                      refresh
                    </span>
                  ) : (
                    <span className="text-on-surface-variant font-bold text-sm bg-surface-container-highest px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                      {formatRp(pkg.price)}
                    </span>
                  )}
                </button>
              )
            )}
          </div>

          <p className="text-[10px] text-center text-outline mt-6 font-medium leading-relaxed">
            Pembayaran aman dengan QRIS, Virtual Account, & E-Wallet
            <br />
            <span className="text-primary font-bold">Powered by Xendit</span>
          </p>
        </section>
      </div>

      {/* ── Log Transaksi ── */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-primary">Log Transaksi</h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Riwayat penggunaan dan isi ulang kredit Sprout Wallet Anda.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-full bg-white text-on-surface text-sm font-bold border border-outline-variant/20 flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">
                filter_list
              </span>
              Filter
            </button>
            <button className="px-5 py-2.5 rounded-full bg-white text-on-surface text-sm font-bold border border-outline-variant/20 flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>
              Export CSV
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-outline-variant/30 rounded-3xl bg-white animate-in zoom-in-95">
            <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4 block">
              account_balance_wallet
            </span>
            <h4 className="text-xl font-extrabold text-on-surface tracking-tight">
              Belum Ada Transaksi
            </h4>
            <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto">
              Isi ulang kredit pertama Anda untuk mulai memproses pesanan.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(67,73,62,0.06)] border border-outline-variant/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/60">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
                    Invoice ID
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
                    Deskripsi
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
                    Waktu & Tanggal
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
                    Jumlah
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {transactions.map((trx) => {
                  const { date, time } = formatDate(trx.createdAt);
                  const isCredit = trx.type === "CREDIT";
                  const invoiceId = trx.xenditId
                    ? `INV/${trx.xenditId.slice(-12).toUpperCase()}`
                    : `TRX/${trx.id.slice(-8).toUpperCase()}`;

                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      <td className="px-8 py-6 font-mono text-xs font-bold text-primary">
                        {invoiceId}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCredit
                                ? "bg-secondary-container/40"
                                : "bg-surface-container"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[18px] ${
                                isCredit ? "text-secondary" : "text-outline"
                              }`}
                            >
                              {isCredit ? "add_circle" : "shopping_basket"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-on-surface">
                            {trx.description || (isCredit ? "Top-up Kredit" : "Penggunaan Kredit")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-on-surface">
                          {date}
                        </p>
                        <p className="text-[10px] text-outline">{time}</p>
                      </td>
                      <td
                        className={`px-8 py-6 text-sm font-black ${
                          isCredit ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {isCredit ? "+" : "-"} {formatRp(trx.amount)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            trx.status === "COMPLETED"
                              ? "bg-secondary-container/50 text-on-secondary-fixed-variant"
                              : trx.status === "PENDING"
                              ? "bg-surface-container-highest text-on-surface-variant"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {trx.status === "COMPLETED"
                            ? "Success"
                            : trx.status === "PENDING"
                            ? "Pending"
                            : "Failed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {transactions.length >= 20 && (
              <div className="py-6 flex justify-center border-t border-outline-variant/10">
                <button className="px-8 py-3 bg-surface-container-low text-on-surface-variant text-sm font-bold rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
