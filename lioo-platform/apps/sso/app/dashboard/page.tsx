import { getKindeServerSession, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";

export default async function DashboardPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("/");
  }

  const user = await getUser();
  
  if (!user || (!user.id)) {
    redirect("/");
  }

  // Sinkronisasi: Pastikan Database Postgres sinkron dengan Kinde Token.
  // Bila user ini belum teregistrasi di DB kita, buat entitasnya berikut Merchant Dummy.
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true }
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
      },
      include: { tenant: true }
    });
  }

  // Redirect ke gatekeeper Merchant App 
  redirect("https://merchant.lioo.io/auth-callback");
}
