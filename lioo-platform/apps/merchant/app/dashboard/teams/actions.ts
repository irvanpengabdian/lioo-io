"use server";

import {
  prisma,
  canAddStaff,
  isRoleAllowedForPlan,
  ROLE_PERMISSIONS,
  guardAccess,
} from "@repo/database";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

function merchantAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.KINDE_SITE_URL ??
    "http://localhost:3002"
  );
}

async function getAuthenticatedManager() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) return null;
  const user = await getUser();
  if (!user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });

  if (!dbUser?.tenant) return null;
  return dbUser;
}

function actorCanManageTarget(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === Role.OWNER) return true;
  if (actorRole === Role.MANAGER) {
    return targetRole !== Role.OWNER && targetRole !== Role.MANAGER;
  }
  return false;
}

async function occupiedStaffSlots(tenantId: string): Promise<number> {
  const now = new Date();
  const [nonOwner, pending] = await Promise.all([
    prisma.user.count({
      where: { tenantId, role: { not: Role.OWNER } },
    }),
    prisma.staffInvite.count({
      where: {
        tenantId,
        status: "PENDING",
        expiresAt: { gt: now },
      },
    }),
  ]);
  return nonOwner + pending;
}

export async function createInvite(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const roleInput = formData.get("role") as string;

  if (!email || !roleInput) {
    return { success: false, error: "Email dan role wajib diisi." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Format email tidak valid." };
  }

  const role = roleInput as Role;
  const validRoles: Role[] = [Role.MANAGER, Role.STAFF, Role.KITCHEN, Role.FINANCE];
  if (!validRoles.includes(role)) {
    return { success: false, error: "Role tidak valid." };
  }

  const actor = await getAuthenticatedManager();
  if (!actor) return { success: false, error: "Akses ditolak." };

  const guard = guardAccess(
    actor.role,
    actor.tenant!.planType,
    ROLE_PERMISSIONS.manageStaff
  );
  if (!guard.ok) return { success: false, error: guard.message };

  if (!isRoleAllowedForPlan(actor.tenant!.planType, role)) {
    return {
      success: false,
      error: `Role ${role} tidak tersedia di plan ${actor.tenant!.planType}. Upgrade plan untuk mengaktifkan role ini.`,
    };
  }

  const slotsUsed = await occupiedStaffSlots(actor.tenantId!);
  const quotaCheck = canAddStaff(
    actor.tenant!.planType,
    actor.tenant!.purchasedExtraSeats,
    slotsUsed
  );
  if (!quotaCheck.allowed) {
    return { success: false, error: quotaCheck.reason };
  }

  const existingInvite = await prisma.staffInvite.findFirst({
    where: {
      tenantId: actor.tenantId!,
      email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) {
    return {
      success: false,
      error: "Sudah ada undangan aktif untuk email ini. Batalkan dulu sebelum mengirim ulang.",
    };
  }

  const existingStaff = await prisma.user.findFirst({
    where: { email, tenantId: actor.tenantId! },
  });

  if (existingStaff) {
    return {
      success: false,
      error: "Pengguna dengan email ini sudah menjadi anggota tim di toko Anda.",
    };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.staffInvite.create({
    data: {
      tenantId: actor.tenantId!,
      email,
      role,
      expiresAt,
    },
  });

  const base = merchantAppOrigin().replace(/\/$/, "");
  const inviteUrl = `${base}/join/${invite.token}`;

  revalidatePath("/dashboard/teams");
  return {
    success: true,
    inviteUrl,
    message: `Undangan dibuat untuk ${email}. Bagikan link berikut kepada staff Anda.`,
  };
}

export async function revokeInvite(inviteId: string) {
  const actor = await getAuthenticatedManager();
  if (!actor) return { success: false, error: "Akses ditolak." };

  const guard = guardAccess(
    actor.role,
    actor.tenant!.planType,
    ROLE_PERMISSIONS.manageStaff
  );
  if (!guard.ok) return { success: false, error: guard.message };

  const invite = await prisma.staffInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.tenantId !== actor.tenantId) {
    return { success: false, error: "Undangan tidak ditemukan." };
  }

  await prisma.staffInvite.update({
    where: { id: inviteId },
    data: { status: "REVOKED" },
  });

  revalidatePath("/dashboard/teams");
  return { success: true };
}

export async function removeMember(userId: string) {
  const actor = await getAuthenticatedManager();
  if (!actor) return { success: false, error: "Akses ditolak." };

  const guard = guardAccess(
    actor.role,
    actor.tenant!.planType,
    ROLE_PERMISSIONS.manageStaff
  );
  if (!guard.ok) return { success: false, error: guard.message };

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser || targetUser.tenantId !== actor.tenantId) {
    return { success: false, error: "Anggota tidak ditemukan di toko Anda." };
  }

  if (targetUser.id === actor.id) {
    return { success: false, error: "Anda tidak bisa menghapus diri sendiri." };
  }

  if (targetUser.role === Role.OWNER) {
    return { success: false, error: "Tidak bisa menghapus akun OWNER." };
  }

  if (!actorCanManageTarget(actor.role, targetUser.role)) {
    return { success: false, error: "Anda tidak memiliki izin untuk menghapus anggota ini." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { tenantId: null, role: Role.STAFF },
  });

  revalidatePath("/dashboard/teams");
  return { success: true };
}

export async function updateMemberRole(userId: string, newRole: Role) {
  const actor = await getAuthenticatedManager();
  if (!actor) return { success: false, error: "Akses ditolak." };

  const guard = guardAccess(
    actor.role,
    actor.tenant!.planType,
    ROLE_PERMISSIONS.manageStaff
  );
  if (!guard.ok) return { success: false, error: guard.message };

  if (newRole === Role.OWNER) {
    return { success: false, error: "Role OWNER tidak bisa ditetapkan lewat undangan ini." };
  }

  if (!isRoleAllowedForPlan(actor.tenant!.planType, newRole)) {
    return {
      success: false,
      error: `Role ${newRole} tidak tersedia di plan ${actor.tenant!.planType}.`,
    };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser || targetUser.tenantId !== actor.tenantId) {
    return { success: false, error: "Anggota tidak ditemukan." };
  }

  if (targetUser.role === Role.OWNER) {
    return { success: false, error: "Role OWNER tidak bisa diubah." };
  }

  if (!actorCanManageTarget(actor.role, targetUser.role)) {
    return { success: false, error: "Anda tidak memiliki izin mengubah anggota ini." };
  }

  if (!actorCanManageTarget(actor.role, newRole)) {
    return { success: false, error: "Anda tidak memiliki izin menetapkan role ini." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/dashboard/teams");
  return { success: true };
}
