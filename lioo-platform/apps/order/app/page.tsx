import Link from 'next/link';

/**
 * Root page — portal pelanggan tidak memiliki "beranda" publik.
 * Akses harus selalu via:
 *   /t/[tableToken]   → dine-in via QR meja
 *   /o/[tenantSlug]   → takeaway / delivery
 *
 * Halaman ini menampilkan 404 informatif.
 */
export default function OrderRootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <p className="text-5xl mb-4">🍽️</p>
      <h1 className="text-xl font-bold text-[#1A1C19] mb-2">
        Scan QR untuk mulai pesan
      </h1>
      <p className="text-[#787868] text-sm max-w-xs">
        Halaman ini diakses melalui QR code di meja atau link khusus dari outlet.
      </p>
    </div>
  );
}
