import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Status Sistem | lioo.io",
  description: "Pantau ketersediaan dan performa sistem lioo.io secara real-time.",
};

export default function StatusPage() {
  const systems = [
    {
      name: "Core POS",
      desc: "Point of Sale Transaction Processing",
      status: "Operational",
      uptime: "99.98%",
      // 90 bars total. Representing 90 days.
      history: Array(90)
        .fill(0)
        .map((_, i) => (i === 70 || i === 85 ? "degraded" : "operational")),
    },
    {
      name: "AI Inventory",
      desc: "Predictive Stock Management & Insights",
      status: "Operational",
      uptime: "100%",
      history: Array(90).fill("operational"),
    },
    {
      name: "Payment Gateway",
      desc: "Processing and Merchant Settlements",
      status: "Partial Outage",
      uptime: "94.2%",
      // Simulating a recent outage
      history: Array(90)
        .fill(0)
        .map((_, i) => (i > 80 && i < 85 ? "outage" : "operational")),
    },
    {
      name: "API & Database",
      desc: "Core Infrastructure and Data Queries",
      status: "Operational",
      uptime: "100%",
      history: Array(90).fill("operational"),
    },
  ];

  const getColor = (status: string) => {
    if (status === "operational") return "#A8D390"; // primary-fixed-dim
    if (status === "degraded") return "#FBBF24"; // amber-400
    if (status === "outage") return "#BA1A1A"; // error hex
    return "#E2E3DE";
  };

  return (
    <div className="bg-[#F9FAF5] min-h-screen font-sans text-[#1A1C19] selection:bg-[#436831] selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Global Status Banner */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-[#436831] to-[#2C4F1B] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight">Semua Sistem Normal</h1>
              </div>
              <p className="text-[#BAE5A1] font-medium opacity-90 text-lg">
                Sistem berjalan dengan baik. Tidak ada insiden aktif.
              </p>
            </div>
            <div className="relative z-10 md:text-right">
              <span className="text-xs uppercase tracking-widest text-[#BAE5A1] font-bold block mb-1">
                Pengecekan Terakhir
              </span>
              <span className="text-sm font-semibold">
                {new Date().toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} — {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
          </div>
        </section>

        {/* Component Breakdown & Uptime History */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-[#1A1C19]">Kesehatan Layanan</h2>
            <div className="flex items-center gap-4 text-xs font-bold text-[#43493E] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2C4F1B]" /> Normal
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" /> Gangguan
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]" /> Mati Total
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {systems.map((sys, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E3DE]/60 transition-transform hover:-translate-y-1 duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1C19]">{sys.name}</h3>
                    <p className="text-sm text-[#43493E]">{sys.desc}</p>
                  </div>
                  <span
                    className={`text-sm font-bold flex items-center gap-1.5 ${
                      sys.status === "Operational"
                        ? "text-[#2C4F1B]"
                        : sys.status === "Partial Outage"
                        ? "text-[#D97706]"
                        : "text-[#BA1A1A]"
                    }`}
                  >
                    {sys.status === "Operational" ? "Normal" : "Terganggu"}{" "}
                    <span className="material-symbols-outlined text-base">
                      {sys.status === "Operational" ? "check_circle" : "warning"}
                    </span>
                  </span>
                </div>
                
                <div className="grid grid-cols-[repeat(90,minmax(0,1fr))] gap-[2px] h-10 w-full mb-3">
                  {sys.history.map((dayStatus, i) => (
                    <div
                      key={i}
                      className="rounded-full h-full w-full"
                      style={{ backgroundColor: getColor(dayStatus) }}
                      title={`Day ${i + 1}: ${dayStatus}`}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[10px] font-bold text-[#73796D] uppercase tracking-widest">
                  <span>90 hari lalu</span>
                  <span className="text-[#2C4F1B]">{sys.uptime} Uptime</span>
                  <span>Hari Ini</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-[#1A1C19] mb-8">Riwayat Insiden</h2>
          
          <div className="space-y-12">
            {/* Day Group */}
            <div>
              <h3 className="text-sm font-bold text-[#43493E] uppercase tracking-widest border-b border-[#C3C9BA]/30 pb-2 mb-6">
                Riwayat Terbaru
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <span className="text-xs font-bold text-[#1A1C19] bg-[#EDEEE9] px-3 py-1.5 rounded-lg">
                    14:12 WIB
                  </span>
                </div>
                <div className="md:w-3/4">
                  <h4 className="font-bold text-[#2C4F1B] mb-2">Terselesaikan: Keterlambatan Sinkronisasi Payment</h4>
                  <p className="text-sm text-[#43493E] leading-relaxed">
                    Penyedia upstream kami mengidentifikasi masalah yang memengaruhi sebagian kecil request pembayaran. Semua fitur telah kembali berjalan normal.
                  </p>
                </div>
              </div>
            </div>

            {/* Day Group */}
            <div>
              <h3 className="text-sm font-bold text-[#43493E] uppercase tracking-widest border-b border-[#C3C9BA]/30 pb-2 mb-6">
                2 Minggu Lalu
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <span className="text-xs font-bold text-[#1A1C19] bg-[#EDEEE9] px-3 py-1.5 rounded-lg">
                    03:00 WIB
                  </span>
                </div>
                <div className="md:w-3/4">
                  <h4 className="font-bold text-[#1A1C19] mb-2">Pemeliharaan Terjadwal: Optimisasi Database</h4>
                  <p className="text-sm text-[#43493E] leading-relaxed">
                    Proses pemeliharaan rutin pada cluster database. Latensi sistem tetap berada di bawah 50ms selama periode perbaikan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <button className="flex items-center gap-2 text-[#436831] font-bold hover:gap-3 transition-all border-b-2 border-transparent hover:border-[#436831] pb-1">
              Lihat arsip insiden penuh <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
