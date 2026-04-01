"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvite, revokeInvite, removeMember, updateMemberRole } from "./actions";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, PLAN_ALLOWED_ROLES } from "@repo/database";
import { Role, PlanType } from "@prisma/client";

type StaffMember = {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  createdAt: string;
  isCurrentUser: boolean;
};

type PendingInvite = {
  id: string;
  email: string;
  role: Role;
  roleLabel: string;
  expiresAt: string;
  inviteUrl: string;
};

type Props = {
  currentUserRole: Role;
  planType: PlanType;
  maxSeats: number;
  occupiedSlots: number;
  nonOwnerMemberCount: number;
  staffList: StaffMember[];
  pendingInvites: PendingInvite[];
};

const ROLE_BADGE: Record<Role, { bg: string; text: string }> = {
  OWNER: { bg: "bg-[#E8F5E2]", text: "text-[#2C6B1A]" },
  MANAGER: { bg: "bg-[#EEF2FF]", text: "text-[#4338CA]" },
  STAFF: { bg: "bg-[#FFF8E1]", text: "text-[#B35900]" },
  KITCHEN: { bg: "bg-[#FDE8E8]", text: "text-[#B91C1C]" },
  FINANCE: { bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]" },
};

function RoleBadge({ role, label }: { role: Role; label: string }) {
  const style = ROLE_BADGE[role] ?? { bg: "bg-[#EDEEE9]", text: "text-[#43493E]" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="text-xs text-[#7C8B6F] hover:text-[#2C4F1B] font-medium transition-colors flex items-center gap-1"
    >
      <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
      {copied ? "Tersalin!" : "Salin Link"}
    </button>
  );
}

function showRoleSelector(
  actorRole: Role,
  staff: StaffMember
): boolean {
  if (staff.role === Role.OWNER || staff.isCurrentUser) return false;
  if (actorRole === Role.MANAGER && staff.role === Role.MANAGER) return false;
  return true;
}

function showRemoveButton(actorRole: Role, staff: StaffMember): boolean {
  if (staff.isCurrentUser || staff.role === Role.OWNER) return false;
  if (actorRole === Role.MANAGER && staff.role === Role.MANAGER) return false;
  return true;
}

export default function TeamsClient({
  currentUserRole,
  planType,
  maxSeats,
  occupiedSlots,
  nonOwnerMemberCount,
  staffList,
  pendingInvites,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url?: string; error?: string } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  const allowedRoles = PLAN_ALLOWED_ROLES[planType].filter((r) => r !== Role.OWNER);
  const seatsLeft = maxSeats - occupiedSlots;
  const isAtCapacity = seatsLeft <= 0;

  function showFeedback(message: string, ok: boolean) {
    setFeedback({ message, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createInvite(fd);
      if (result.success) {
        setInviteResult({ url: result.inviteUrl });
        router.refresh();
      } else {
        setInviteResult({ error: result.error });
      }
    });
  }

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      const result = await revokeInvite(inviteId);
      showFeedback(result.success ? "Undangan dibatalkan." : result.error ?? "Gagal.", result.success);
      if (result.success) router.refresh();
    });
  }

  function handleRemove(userId: string, name: string) {
    if (!confirm(`Hapus ${name} dari toko ini? Mereka kehilangan akses ke dashboard dan POS toko ini.`)) return;
    startTransition(async () => {
      const result = await removeMember(userId);
      showFeedback(result.success ? "Anggota dihapus dari tim." : result.error ?? "Gagal.", result.success);
      if (result.success) router.refresh();
    });
  }

  function handleRoleChange(userId: string, newRole: Role) {
    startTransition(async () => {
      const result = await updateMemberRole(userId, newRole);
      showFeedback(result.success ? "Role diperbarui." : result.error ?? "Gagal.", result.success);
      if (result.success) router.refresh();
    });
  }

  const pendingCount = pendingInvites.length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C19]">Tim &amp; Staff</h1>
          <p className="text-[#787868] text-sm mt-1">
            Kelola anggota, role, dan undangan. Pemilik tidak memakai kuota kursi staff.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowInviteModal(true);
            setInviteResult(null);
          }}
          disabled={isAtCapacity}
          className="flex items-center gap-2 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Undang anggota
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-2xl text-sm font-medium ${feedback.ok ? "bg-[#E8F5E2] text-[#2C6B1A]" : "bg-[#FDE8E8] text-[#B91C1C]"}`}
        >
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(44,79,27,0.06)] mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#1A1C19]">Kuota kursi staff</p>
          <RoleBadge role={Role.OWNER} label={`Plan ${planType}`} />
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold text-[#1A1C19]">{occupiedSlots}</span>
          <span className="text-[#787868] text-sm mb-1">/ {maxSeats} terpakai</span>
        </div>
        <p className="text-xs text-[#787868] mb-2">
          {nonOwnerMemberCount} anggota (non-pemilik) + {pendingCount} undangan aktif
        </p>
        <div className="w-full bg-[#EDEEE9] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#7C8B6F] to-[#2C4F1B] h-2 rounded-full transition-all"
            style={{ width: `${maxSeats > 0 ? Math.min((occupiedSlots / maxSeats) * 100, 100) : 0}%` }}
          />
        </div>
        {isAtCapacity && (
          <p className="text-xs text-[#B35900] mt-2 font-medium">
            Kuota penuh. Upgrade plan atau beli seat tambahan untuk mengundang lebih banyak anggota.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(44,79,27,0.06)] mb-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-[#EDEEE9]">
          <p className="text-sm font-semibold text-[#1A1C19]">Anggota ({staffList.length})</p>
        </div>
        <div className="divide-y divide-[#F3F4EF]">
          {staffList.map((staff) => (
            <div key={staff.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-[#EDEEE9] flex items-center justify-center text-sm font-bold text-[#43493E] flex-shrink-0">
                {(staff.name || staff.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1C19] truncate">
                  {staff.name || staff.email}
                  {staff.isCurrentUser && (
                    <span className="ml-2 text-xs font-normal text-[#787868]">(kamu)</span>
                  )}
                </p>
                <p className="text-xs text-[#787868] truncate">{staff.email}</p>
              </div>

              {showRoleSelector(currentUserRole, staff) ? (
                <select
                  defaultValue={staff.role}
                  onChange={(e) => handleRoleChange(staff.id, e.target.value as Role)}
                  disabled={isPending}
                  className="text-xs border-0 bg-[#F3F4EF] rounded-xl px-3 py-2 font-medium text-[#1A1C19] focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/30 cursor-pointer"
                >
                  {allowedRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              ) : (
                <RoleBadge role={staff.role} label={staff.roleLabel} />
              )}

              {showRemoveButton(currentUserRole, staff) && (
                <button
                  type="button"
                  onClick={() => handleRemove(staff.id, staff.name)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg hover:bg-[#FDE8E8] text-[#787868] hover:text-[#B91C1C] transition-colors"
                  title="Hapus dari toko"
                >
                  <span className="material-symbols-outlined text-sm">person_remove</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(44,79,27,0.06)] overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-[#EDEEE9]">
            <p className="text-sm font-semibold text-[#1A1C19]">
              Undangan tertunda ({pendingInvites.length})
            </p>
          </div>
          <div className="divide-y divide-[#F3F4EF]">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFF8E1] flex items-center justify-center text-xs font-bold text-[#B35900]">
                    {inv.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1C19] truncate">{inv.email}</p>
                    <p className="text-xs text-[#787868]">
                      Kedaluwarsa{" "}
                      {new Date(inv.expiresAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <RoleBadge role={inv.role} label={inv.roleLabel} />
                  <button
                    type="button"
                    onClick={() => handleRevoke(inv.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg hover:bg-[#FDE8E8] text-[#787868] hover:text-[#B91C1C] transition-colors"
                    title="Batalkan undangan"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-[#F3F4EF] rounded-xl px-3 py-2">
                  <p className="text-xs text-[#787868] flex-1 truncate font-mono">{inv.inviteUrl}</p>
                  <CopyButton text={inv.inviteUrl} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C19]/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.12)] w-full max-w-md p-8">
            {inviteResult?.url ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-[#E8F5E2] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#2C6B1A] text-2xl">check_circle</span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1C19] mb-2">Undangan dibuat!</h3>
                <p className="text-sm text-[#787868] mb-5">Bagikan link ini (domain merchant). Staff login dengan email yang diundang:</p>
                <div className="bg-[#F3F4EF] rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                  <p className="text-xs text-[#787868] flex-1 break-all font-mono leading-relaxed">
                    {inviteResult.url}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteResult.url!);
                      setShowCopied(true);
                      setTimeout(() => setShowCopied(false), 2000);
                    }}
                    className="flex-shrink-0 text-[#7C8B6F] hover:text-[#2C4F1B]"
                  >
                    <span className="material-symbols-outlined">{showCopied ? "check" : "content_copy"}</span>
                  </button>
                </div>
                <p className="text-xs text-[#787868] mb-6">
                  Link berlaku 7 hari. Halaman undangan: <strong>/join/…</strong> di app merchant.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteResult(null);
                  }}
                  className="w-full py-3 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full font-semibold"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A1C19]">Undang anggota baru</h3>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="p-1 rounded-lg hover:bg-[#F3F4EF] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#787868]">close</span>
                  </button>
                </div>

                {inviteResult?.error && (
                  <div className="mb-4 px-4 py-3 bg-[#FDE8E8] text-[#B91C1C] text-sm rounded-2xl font-medium">
                    {inviteResult.error}
                  </div>
                )}

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#43493E] uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="staff@email.com"
                      className="w-full bg-[#F3F4EF] rounded-2xl px-4 py-3 text-sm text-[#1A1C19] placeholder-[#AAAAA0] focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/30 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#43493E] uppercase tracking-wider mb-2">
                      Role
                    </label>
                    <div className="space-y-2">
                      {allowedRoles.map((role) => (
                        <label
                          key={role}
                          className="flex items-start gap-3 p-3 bg-[#F3F4EF] rounded-2xl cursor-pointer hover:bg-[#EDEEE9] transition-colors has-[:checked]:bg-[#E8F5E2] has-[:checked]:ring-1 has-[:checked]:ring-[#7C8B6F]/40"
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            defaultChecked={role === Role.STAFF}
                            className="mt-0.5 accent-[#2C4F1B]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#1A1C19]">{ROLE_LABELS[role]}</p>
                            <p className="text-xs text-[#787868]">{ROLE_DESCRIPTIONS[role]}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full font-semibold shadow-md disabled:opacity-50 transition-all mt-2"
                  >
                    {isPending ? "Membuat undangan..." : "Buat link undangan"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
