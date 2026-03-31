import Link from "next/link";

export default function SSOLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAF5] font-sans text-[#1A1C19]">
      <div className="p-10 mb-8 text-center bg-white border border-[#EAE8DF] rounded-3xl shadow-[0_4px_24px_rgba(26,26,20,0.08)] max-w-sm w-full">
        
        {/* Placeholder Logo */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-[#7C8B6F] rounded-xl flex items-center justify-center text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.65 21C8 19 12.85 17.61 15 14c1.5-2.19 2-5 2-6z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.82 19.34C3.82 19.34 6 14 9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">lioo<span className="text-[#7C8B6F]">.io</span></span>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Portal Merchant</h1>
        <p className="text-[#787868] mb-8 text-sm">Masuk atau daftar untuk mengelola bisnis kuliner Anda.</p>
        
        <div className="flex flex-col gap-4">
          <Link href={`${process.env.NEXT_PUBLIC_MERCHANT_URL || "http://localhost:3002"}/api/auth/login`} className="w-full bg-[#7C8B6F] hover:bg-[#5C6B51] text-white py-3 px-4 rounded-full font-semibold transition-all shadow-md text-center inline-block">
            Masuk dengan Akun
          </Link>
          
          <Link href={`${process.env.NEXT_PUBLIC_MERCHANT_URL || "http://localhost:3002"}/api/auth/register`} className="w-full bg-white hover:bg-[#F9FAF5] text-[#1A1C19] border-2 border-[#EAE8DF] py-3 px-4 rounded-full font-semibold transition-all text-center inline-block">
            Daftar Merchant Baru
          </Link>
        </div>
        
      </div>
      <p className="text-sm text-[#787868]">Aman & Tersinkronisasi. Ditenagai oleh Kinde Auth.</p>
    </div>
  );
}
