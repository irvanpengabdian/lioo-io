'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';
import { CUSTOMER_SESSION_COOKIE, SESSION_MAX_AGE } from '../../lib/customer-session';
import { normalizePhone, isValidIdPhone } from '../../lib/phone';

const GUEST_COOKIE = 'lioo_guest_sid';
const PIN_ROUNDS = 10;

function validatePin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export type AuthResult =
  | { success: true; message?: string }
  | { success: false; error: string };

/**
 * Daftar akun pelanggan di outlet ini (nomor HP unik per tenant).
 * Menggabungkan pesanan anonim sebelumnya (guestSessionId) ke akun baru.
 */
export async function registerCustomer(
  tenantId: string,
  name: string,
  phoneRaw: string,
  pin: string,
  confirmPin: string
): Promise<AuthResult> {
  try {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return { success: false, error: 'Nama minimal 2 karakter.' };
    }
    const phone = normalizePhone(phoneRaw);
    if (!isValidIdPhone(phone)) {
      return { success: false, error: 'Nomor HP tidak valid (gunakan 08…).' };
    }
    if (!validatePin(pin) || pin !== confirmPin) {
      return { success: false, error: 'PIN harus 6 angka dan sama dengan konfirmasi.' };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) return { success: false, error: 'Outlet tidak ditemukan.' };

    const dup = await prisma.customer.findFirst({
      where: { tenantId, phone },
    });
    if (dup?.pinHash) {
      return { success: false, error: 'Nomor ini sudah terdaftar. Gunakan Masuk.' };
    }

    const pinHash = await bcrypt.hash(pin, PIN_ROUNDS);
    const guestToken = crypto.randomUUID();

    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(GUEST_COOKIE)?.value ?? null;

    await prisma.$transaction(async (tx) => {
      const row = dup
        ? await tx.customer.update({
            where: { id: dup.id },
            data: {
              name: trimmedName,
              phone,
              isGuest: false,
              pinHash,
              guestToken,
            },
            select: { id: true },
          })
        : await tx.customer.create({
            data: {
              tenantId,
              name: trimmedName,
              phone,
              isGuest: false,
              pinHash,
              guestToken,
            },
            select: { id: true },
          });

      if (guestSessionId) {
        await tx.order.updateMany({
          where: {
            tenantId,
            guestSessionId,
            customerId: null,
          },
          data: { customerId: row.id },
        });
      }
    });

    cookieStore.set(CUSTOMER_SESSION_COOKIE, guestToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return { success: true, message: 'Akun berhasil dibuat.' };
  } catch (err) {
    console.error('[registerCustomer]', err);
    return { success: false, error: 'Gagal mendaftar. Coba lagi.' };
  }
}

export async function loginCustomer(
  tenantId: string,
  phoneRaw: string,
  pin: string
): Promise<AuthResult> {
  try {
    const phone = normalizePhone(phoneRaw);
    if (!isValidIdPhone(phone)) {
      return { success: false, error: 'Nomor HP tidak valid.' };
    }
    if (!validatePin(pin)) {
      return { success: false, error: 'PIN harus 6 angka.' };
    }

    const customer = await prisma.customer.findFirst({
      where: { tenantId, phone, isGuest: false },
    });
    if (!customer?.pinHash) {
      return { success: false, error: 'Akun tidak ditemukan. Daftar dulu.' };
    }

    const ok = await bcrypt.compare(pin, customer.pinHash);
    if (!ok) return { success: false, error: 'PIN salah.' };

    const guestToken = crypto.randomUUID();
    await prisma.customer.update({
      where: { id: customer.id },
      data: { guestToken },
    });

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_SESSION_COOKIE, guestToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    const guestSessionId = cookieStore.get(GUEST_COOKIE)?.value;
    if (guestSessionId) {
      await prisma.order.updateMany({
        where: {
          tenantId,
          guestSessionId,
          customerId: null,
        },
        data: { customerId: customer.id },
      });
    }

    return { success: true };
  } catch (err) {
    console.error('[loginCustomer]', err);
    return { success: false, error: 'Gagal masuk. Coba lagi.' };
  }
}

export async function logoutCustomer(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.customer.updateMany({
      where: { guestToken: token },
      data: { guestToken: null },
    });
  }
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}
