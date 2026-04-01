"use client";

/**
 * Menangkap error runtime di bawah /dashboard (Prisma, query, dll.)
 * supaya pengguna melihat pesan, bukan hanya "This page couldn't load".
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto mt-16 px-6 py-10 rounded-3xl bg-white shadow-[0_24px_48px_rgba(44,79,27,0.08)] border border-[#EDEEE9]">
      <h1 className="text-lg font-bold text-[#1A1C19] mb-2">Dashboard tidak bisa dimuat</h1>
      <p className="text-sm text-[#787868] mb-4">
        Terjadi kesalahan di server. Coba muat ulang. Jika berlanjut, periksa log Vercel dan koneksi database.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="text-xs bg-[#F3F4EF] p-3 rounded-xl overflow-auto mb-4 text-[#B91C1C] whitespace-pre-wrap">
          {error.message}
        </pre>
      )}
      {error.digest && (
        <p className="text-xs text-[#AAAAA0] mb-4 font-mono">Digest: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={() => reset()}
        className="w-full py-3 rounded-full font-semibold text-sm bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white"
      >
        Coba lagi
      </button>
    </div>
  );
}
