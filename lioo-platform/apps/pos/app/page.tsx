import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function POSRootPage() {
  const { isAuthenticated } = getKindeServerSession();

  if (await isAuthenticated()) {
    redirect('/pos');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAF5]">
      <div className="p-10 text-center bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.06)] max-w-sm w-full mx-4">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-[#7C8B6F] rounded-xl flex items-center justify-center text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.65 21C8 19 12.85 17.61 15 14c1.5-2.19 2-5 2-6z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.82 19.34C3.82 19.34 6 14 9 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            lioo<span className="text-[#7C8B6F]"> POS</span>
          </span>
        </div>

        <h1 className="text-xl font-bold mb-2">Terminal Kasir</h1>
        <p className="text-[#787868] text-sm mb-8">
          Masuk dengan akun staff untuk memulai sesi kasir.
        </p>

        <Link
          href="/api/auth/login"
          className="block w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white py-3 px-4 rounded-full font-semibold transition-all shadow-md text-center"
        >
          Masuk sebagai Staff
        </Link>
      </div>
    </div>
  );
}
