"use server";

import { prisma, getEffectiveMaxSeats, isRoleAllowedForPlan } from "@repo/database";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Role } from "@prisma/client";

function normEmail(s: string) {
  return s.trim().toLowerCase();
}

export type AcceptInviteResult =
  | { ok: true; alreadyMember?: boolean }
  | { ok: false; error: string };

/**
 * Menerima undangan staff setelah user login dengan email yang cocok.
 */
export async function acceptStaffInvite(token: string): Promise<AcceptInviteResult> {
  if (!token || typeof token !== "string" || token.length > 200) {
    return { ok: false, error: "Link undangan tidak valid." };
  }

  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const user = await getUser();
  if (!user?.id || !user.email) {
    return { ok: false, error: "Sesi login tidak valid." };
  }

  const kindeEmail = normEmail(user.email);

  try {
    return await prisma.$transaction(async (tx) => {
      const invite = await tx.staffInvite.findUnique({
        where: { token },
        include: {
          tenant: {
            select: {
              id: true,
              planType: true,
              purchasedExtraSeats: true,
            },
          },
        },
      });

      if (!invite) {
        return { ok: false, error: "Undangan tidak ditemukan." };
      }

      if (invite.status !== "PENDING") {
        return { ok: false, error: "Undangan ini sudah tidak berlaku." };
      }

      if (invite.expiresAt < new Date()) {
        await tx.staffInvite.update({
          where: { id: invite.id },
          data: { status: "EXPIRED" },
        });
        return { ok: false, error: "Undangan sudah kedaluwarsa." };
      }

      if (normEmail(invite.email) !== kindeEmail) {
        return {
          ok: false,
          error: `Undangan dikirim ke ${invite.email}. Anda login sebagai ${user.email}. Gunakan akun yang sesuai.`,
        };
      }

      if (!isRoleAllowedForPlan(invite.tenant.planType, invite.role)) {
        return {
          ok: false,
          error: "Role pada undangan tidak lagi didukung untuk plan toko ini. Minta pemilik mengirim undangan baru.",
        };
      }

      let dbUser = await tx.user.findUnique({ where: { id: user.id } });

      if (!dbUser) {
        dbUser = await tx.user.create({
          data: {
            id: user.id,
            email: user.email ?? kindeEmail,
            firstName: user.given_name ?? "",
            lastName: user.family_name ?? "",
          },
        });
      }

      if (dbUser.tenantId === invite.tenantId) {
        return { ok: true, alreadyMember: true };
      }

      if (dbUser.tenantId && dbUser.tenantId !== invite.tenantId) {
        return {
          ok: false,
          error:
            "Akun Anda sudah terikat ke toko lain. Hubungi support jika perlu pindah toko.",
        };
      }

      const nonOwnerCount = await tx.user.count({
        where: {
          tenantId: invite.tenantId,
          role: { not: Role.OWNER },
        },
      });

      const maxSeats = getEffectiveMaxSeats(
        invite.tenant.planType,
        invite.tenant.purchasedExtraSeats
      );

      if (nonOwnerCount + 1 > maxSeats) {
        return {
          ok: false,
          error: "Kuota staff toko penuh. Minta pemilik upgrade plan atau batalkan undangan lain.",
        };
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          tenantId: invite.tenantId,
          role: invite.role,
          email: user.email ?? dbUser.email,
          firstName: user.given_name ?? dbUser.firstName,
          lastName: user.family_name ?? dbUser.lastName,
        },
      });

      await tx.staffInvite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
          acceptedByUserId: user.id,
        },
      });

      return { ok: true };
    });
  } catch (e: unknown) {
    console.error("acceptStaffInvite:", e);
    return { ok: false, error: "Gagal menerima undangan. Coba lagi." };
  }
}
