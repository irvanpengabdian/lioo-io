import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";

export default async function AuthCallbackPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("https://sso.lioo.io");
  }

  const user = await getUser();
  
  if (!user || (!user.id)) {
    redirect("https://sso.lioo.io");
  }

  // Sinkronisasi User
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
      }
    });
  }

  // Routing Pintar Berdasarkan Kepemilikan Toko
  if (!dbUser.tenantId) {
    redirect("/"); // Arahkan ke Onboarding Profil Toko
  } else {
    redirect("/dashboard"); // Arahkan ke Dashboard Analytics
  }
}
