"use client";

import { useState } from "react";

export default function UpgradePlanButton({ 
  disabled = false, 
  targetPlan = "SPROUT" 
}: { 
  disabled?: boolean;
  targetPlan?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: targetPlan }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat invoice");
      }

      // Arahkan ke pintu tol pembayaran Xendit
      window.location.href = data.invoiceUrl;
      
    } catch (err: any) {
      console.error("Upgrade error:", err);
      alert(err.message || "Terjadi kesalahan saat menghubungi server pembayaran.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpgrade}
      disabled={disabled || loading}
      className={`w-full py-4 text-center text-white rounded-xl font-bold text-sm shadow-lg transition-all outline-none ring-2 ring-transparent focus:ring-primary flex justify-center items-center gap-2 ${disabled ? "bg-outline-variant/50 cursor-not-allowed" : "sage-gradient hover:opacity-90 active:scale-95"}`}
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          Menyiapkan Gerbang Pembayaran...
        </>
      ) : (
        `Tumbuhkan ke ${targetPlan === "SPROUT" ? "Sprout Plan" : "Bloom Plan"}`
      )}
    </button>
  );
}
