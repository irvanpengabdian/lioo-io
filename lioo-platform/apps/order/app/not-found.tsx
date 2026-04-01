export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-xl font-bold text-[#1A1C19] mb-2">
        Outlet tidak ditemukan
      </h1>
      <p className="text-[#787868] text-sm max-w-xs">
        Link atau QR code yang kamu gunakan tidak valid atau sudah tidak aktif.
        Coba scan ulang QR code di meja, atau hubungi kasir.
      </p>
    </div>
  );
}
