import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import MerchantOnboarding from "./OnboardingClient";

export default async function MerchantRootPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"); // Redirect to SSO Portal if not logged in
  }

  const user = await getUser();
  if (!user || (!user.id)) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  // Cari User di DB untuk mengecek apakah dia sudah punya Profil Toko
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    // Fall-back jikalau skip auth-callback flow
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
      }
    });
  } else if (dbUser.tenantId) {
    // Jika terdeteksi SUDAH punya profil toko, tidak boleh buka Form ini lagi!
    redirect("/dashboard");
  }

  // Semua aman (Telah Login & Belum Punya Toko) -> Munculkan Setup Wizard
  return <MerchantOnboarding />;
}
