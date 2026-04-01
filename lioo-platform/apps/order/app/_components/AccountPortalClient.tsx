'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerCustomer, loginCustomer, logoutCustomer } from '../actions/customer-auth';
import { formatRupiah } from '../../lib/types';
import type { CustomerSession, CustomerOrderHistoryRow } from '../../lib/customer-session';

type Props = {
  tenantId: string;
  menuHref: string;
  initialSession: CustomerSession | null;
  initialOrders: CustomerOrderHistoryRow[];
};

const PAY_LABEL: Record<string, string> = {
  UNPAID: 'Belum bayar',
  PARTIAL: 'Sebagian',
  PAID: 'Lunas',
};

const TYPE_LABEL: Record<string, string> = {
  DINE_IN: 'Makan di tempat',
  TAKEAWAY: 'Ambil sendiri',
  DELIVERY: 'Diantar',
};

export default function AccountPortalClient({
  tenantId,
  menuHref,
  initialSession,
  initialOrders,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'daftar' | 'masuk'>('daftar');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regPin2, setRegPin2] = useState('');
  const [logPhone, setLogPhone] = useState('');
  const [logPin, setLogPin] = useState('');

  const loggedIn = Boolean(initialSession);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const r = await registerCustomer(tenantId, regName, regPhone, regPin, regPin2);
      if (!r.success) {
        setErr(r.error);
        return;
      }
      setMsg(r.message ?? 'Berhasil.');
      setRegPin('');
      setRegPin2('');
      router.refresh();
    });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const r = await loginCustomer(tenantId, logPhone, logPin);
      if (!r.success) {
        setErr(r.error);
        return;
      }
      setLogPin('');
      router.refresh();
    });
  }

  async function handleLogout() {
    setErr(null);
    startTransition(async () => {
      await logoutCustomer();
      router.refresh();
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-[#E8F0E4] via-[#F9FAF5] to-[#FFF8E1] p-6 shadow-[0_8px_32px_rgba(44,79,27,0.08)] border border-white/60 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] flex items-center justify-center text-2xl shadow-md flex-shrink-0">
            🌿
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A1C19] leading-tight">Akun pelanggan</h1>
            <p className="text-xs text-[#787868] mt-1 leading-relaxed">
              Simpan riwayat pesanan di <span className="font-semibold text-[#43493E]">outlet ini</span> dengan nomor
              HP dan PIN 6 digit yang kamu buat sendiri. Tidak wajib — pesanan anonim tetap bisa.
            </p>
          </div>
        </div>
      </div>

      <Link
        href={menuHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2C4F1B] mb-6 hover:underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Kembali ke menu
      </Link>

      {loggedIn && initialSession ? (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(44,79,27,0.06)] p-5 border border-[#EDEEE9]">
            <p className="text-xs font-bold text-[#787868] uppercase tracking-wider mb-1">Masuk sebagai</p>
            <p className="text-base font-bold text-[#1A1C19]">{initialSession.name || 'Pelanggan'}</p>
            <p className="text-sm text-[#43493E] font-mono mt-0.5">{initialSession.phone}</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={pending}
              className="mt-4 text-sm font-semibold text-[#B91C1C] hover:underline disabled:opacity-50"
            >
              Keluar
            </button>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#1A1C19] mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Pesanan saya di outlet ini
            </h2>
            {initialOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#D5D9CE] p-10 text-center">
                <p className="text-3xl mb-2">🍃</p>
                <p className="text-sm font-semibold text-[#1A1C19]">Belum ada riwayat</p>
                <p className="text-xs text-[#787868] mt-1 max-w-[240px] mx-auto">
                  Pesanan dari portal (setelah daftar/masuk) tampil di sini.
                </p>
                <Link
                  href={menuHref}
                  className="inline-block mt-4 text-sm font-bold text-[#2C4F1B] bg-[#F3F4EF] px-4 py-2 rounded-full"
                >
                  Mulai pesan
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {initialOrders.map((o) => (
                  <li
                    key={o.id}
                    className="bg-white rounded-2xl border border-[#EDEEE9] px-4 py-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-[#1A1C19]">{o.orderNumber}</p>
                        <p className="text-[10px] text-[#787868] mt-0.5">
                          {new Date(o.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' · '}
                          {TYPE_LABEL[o.orderType] ?? o.orderType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#2C4F1B]">{formatRupiah(o.grandTotal)}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-[#E8F5E2] text-[#2C6B1A]'
                              : 'bg-[#FDE8E8] text-[#B91C1C]'
                          }`}
                        >
                          {PAY_LABEL[o.paymentStatus] ?? o.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#787868] mt-2">{o.itemCount} jenis item</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex bg-[#F0F1EC] rounded-full p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('daftar');
                setErr(null);
                setMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                tab === 'daftar' ? 'bg-white text-[#2C4F1B] shadow-sm' : 'text-[#787868]'
              }`}
            >
              Daftar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('masuk');
                setErr(null);
                setMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                tab === 'masuk' ? 'bg-white text-[#2C4F1B] shadow-sm' : 'text-[#787868]'
              }`}
            >
              Masuk
            </button>
          </div>

          {(err || msg) && (
            <div
              className={`rounded-xl px-4 py-2.5 text-sm mb-4 ${
                err ? 'bg-red-50 text-red-700' : 'bg-[#E8F5E2] text-[#2C6B1A]'
              }`}
            >
              {err || msg}
            </div>
          )}

          {tab === 'daftar' ? (
            <form onSubmit={handleRegister} className="space-y-4 bg-white rounded-2xl border border-[#EDEEE9] p-5 shadow-sm">
              <Field label="Nama" hint="Bisa dipakai sebagai nama di pesanan">
                <input
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5D9CE] text-sm focus:outline-none focus:border-[#2C4F1B]"
                  placeholder="Nama panggilan"
                />
              </Field>
              <Field label="Nomor HP" hint="Satu nomor = satu akun per outlet">
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5D9CE] text-sm font-mono focus:outline-none focus:border-[#2C4F1B]"
                  placeholder="08xxxxxxxxxx"
                />
              </Field>
              <Field label="PIN 6 digit" hint="Ingat PIN ini untuk masuk lagi">
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5D9CE] text-sm font-mono tracking-widest focus:outline-none focus:border-[#2C4F1B]"
                  placeholder="••••••"
                />
              </Field>
              <Field label="Ulangi PIN">
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={regPin2}
                  onChange={(e) => setRegPin2(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5D9CE] text-sm font-mono tracking-widest focus:outline-none focus:border-[#2C4F1B]"
                  placeholder="••••••"
                />
              </Field>
              <button
                type="submit"
                disabled={pending}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] shadow-md disabled:opacity-50"
              >
                {pending ? 'Memproses…' : 'Buat akun'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 bg-white rounded-2xl border border-[#EDEEE9] p-5 shadow-sm">
              <Field label="Nomor HP">
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  value={logPhone}
                  onChange={(e) => setLogPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5D9CE] text-sm font-mono focus:outline-none focus:border-[#2C4F1B]"
                  placeholder="08xxxxxxxxxx"
                />
              </Field>
              <Field label="PIN">
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={logPin}
                  onChange={(e) => setLogPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5D9CE] text-sm font-mono tracking-widest focus:outline-none focus:border-[#2C4F1B]"
                  placeholder="••••••"
                />
              </Field>
              <button
                type="submit"
                disabled={pending}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] shadow-md disabled:opacity-50"
              >
                {pending ? 'Memproses…' : 'Masuk'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#43493E] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#787868] mt-1">{hint}</p>}
    </div>
  );
}
