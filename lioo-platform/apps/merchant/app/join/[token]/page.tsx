import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { acceptStaffInvite } from "../../actions/accept-invite";

export const metadata = { title: "Gabung tim | lioo.io Merchant" };

async function merchantOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return (
    process.env.KINDE_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3002"
  );
}

export default async function JoinInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const origin = merchantOrigin();
  const joinUrl = `${origin}/join/${encodeURIComponent(token)}`;

  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    const loginUrl = `${origin}/api/auth/login?post_login_redirect_url=${encodeURIComponent(joinUrl)}`;
    redirect(loginUrl);
  }

  const result = await acceptStaffInvite(token);

  if (result.ok) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4EF] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.08)] p-8 text-center">
        <div className="w-14 h-14 bg-[#FDE8E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[#B91C1C] text-2xl">error</span>
        </div>
        <h1 className="text-lg font-bold text-[#1A1C19] mb-2">Tidak bisa bergabung</h1>
        <p className="text-sm text-[#787868] mb-6">{result.error}</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="py-3 rounded-full font-semibold text-sm bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white"
          >
            Ke dashboard
          </Link>
          <Link
            href="/"
            className="py-3 rounded-full font-semibold text-sm text-[#43493E] hover:bg-[#F3F4EF]"
          >
            Beranda merchant
          </Link>
        </div>
      </div>
    </div>
  );
}
