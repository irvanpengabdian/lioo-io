import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import MerchantOnboarding from "./OnboardingClient";
import { getMerchantDbUser } from "./lib/merchant-session";

export const dynamic = "force-dynamic";

export default async function MerchantRootPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const kinde = await getUser();

  const preloaded = await getMerchantDbUser();
  if (preloaded?.tenantId) {
    redirect("/dashboard");
  }

  if (preloaded && !preloaded.tenantId) {
    return <MerchantOnboarding />;
  }

  if (!(await isAuthenticated())) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  if (!kinde?.id) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: kinde.id },
  });

  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: kinde.id,
        email: kinde.email ?? "",
        firstName: kinde.given_name ?? "",
        lastName: kinde.family_name ?? "",
      },
    });
  } else if (dbUser.tenantId) {
    redirect("/dashboard");
  }

  return <MerchantOnboarding />;
}
