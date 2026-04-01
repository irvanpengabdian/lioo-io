import { Resend } from "resend";
import { ROLE_LABELS } from "@repo/database";
import type { Role } from "@prisma/client";

export type SendStaffInviteResult = { sent: true } | { sent: false };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Kirim email undangan staff via Resend (opsional).
 *
 * Env:
 * - RESEND_API_KEY — wajib untuk mengirim
 * - MERCHANT_INVITE_FROM_EMAIL — mis. "lioo.io <invite@merchant.lioo.io>" (domain harus terverifikasi di Resend)
 *   Tanpa ini dipakai sandbox Resend: onboarding@resend.dev (hanya ke email terdaftar di akun Resend)
 */
export async function trySendStaffInviteEmail(params: {
  to: string;
  inviteUrl: string;
  tenantName: string;
  role: Role;
  inviterLabel: string;
}): Promise<SendStaffInviteResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false };
  }

  const from =
    process.env.MERCHANT_INVITE_FROM_EMAIL?.trim() ?? "lioo.io <onboarding@resend.dev>";
  const roleLabel = ROLE_LABELS[params.role];
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `Undangan bergabung — ${params.tenantName}`,
    html: `
      <p>Halo,</p>
      <p><strong>${escapeHtml(params.inviterLabel)}</strong> mengundang Anda bergabung ke tim <strong>${escapeHtml(params.tenantName)}</strong> di lioo.io sebagai <strong>${escapeHtml(roleLabel)}</strong>.</p>
      <p>Klik tombol berikut lalu login dengan <strong>email ini</strong> (${escapeHtml(params.to)}):</p>
      <p><a href="${escapeHtml(params.inviteUrl)}" style="display:inline-block;padding:12px 24px;background:#2C4F1B;color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;">Terima undangan</a></p>
      <p style="font-size:12px;color:#666;">Link berlaku 7 hari. Jika tombol tidak berfungsi, salin tautan:<br/><span style="word-break:break-all;">${escapeHtml(params.inviteUrl)}</span></p>
    `,
  });

  if (error) {
    console.error("trySendStaffInviteEmail:", error);
    return { sent: false };
  }

  return { sent: true };
}
