"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveOperationalHoursJson,
  saveReceiptInlineSettings,
  saveSelfServiceTheme,
} from "./actions";
import {
  emptyLine,
  parseOperationalHours,
  type OperationalHoursLine,
  type OperationalHoursPayload,
} from "./operational-hours-types";

const THEMES = [
  "Minimalist Green",
  "Dark Forest",
  "Classic Light",
  "Vibrant Orange",
] as const;

type TenantSlice = {
  address: string | null;
  selfServiceTheme: string | null;
  operationalHours: unknown;
  serviceChargePercent: number;
  restaurantTaxEnabled: boolean;
  receiptDeliveryMode: string;
};

export default function ProfileOperationalSection({
  tenant,
  canEdit,
}: {
  tenant: TenantSlice;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedHint, setSavedHint] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialHours = parseOperationalHours(tenant.operationalHours);
  const [hoursState, setHoursState] = useState<OperationalHoursPayload>(initialHours);
  const hoursDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [theme, setTheme] = useState(tenant.selfServiceTheme || "Minimalist Green");

  const [sc, setSc] = useState(
    typeof tenant.serviceChargePercent === "number" ? tenant.serviceChargePercent : 0
  );
  const [pb1, setPb1] = useState(Boolean(tenant.restaurantTaxEnabled));
  const [receiptMode, setReceiptMode] = useState(tenant.receiptDeliveryMode || "PRINT");

  const receiptSnap = useRef({ pb1, receiptMode });
  receiptSnap.current = { pb1, receiptMode };

  const scDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeOptions = useMemo(() => {
    const set = new Set<string>([...THEMES]);
    const cur = tenant.selfServiceTheme?.trim();
    if (cur) set.add(cur);
    if (theme.trim()) set.add(theme.trim());
    return Array.from(set);
  }, [tenant.selfServiceTheme, theme]);

  useEffect(() => {
    setHoursState(parseOperationalHours(tenant.operationalHours));
  }, [tenant.operationalHours]);

  useEffect(() => {
    setTheme(tenant.selfServiceTheme || "Minimalist Green");
  }, [tenant.selfServiceTheme]);

  useEffect(() => {
    setSc(typeof tenant.serviceChargePercent === "number" ? tenant.serviceChargePercent : 0);
    setPb1(Boolean(tenant.restaurantTaxEnabled));
    setReceiptMode(tenant.receiptDeliveryMode || "PRINT");
  }, [tenant.serviceChargePercent, tenant.restaurantTaxEnabled, tenant.receiptDeliveryMode]);

  const flashSaved = useCallback(() => {
    setSavedHint(true);
    const t = setTimeout(() => setSavedHint(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const runSave = useCallback(
    (fn: () => Promise<void>) => {
      if (!canEdit) return;
      setError(null);
      startTransition(async () => {
        try {
          await fn();
          router.refresh();
          flashSaved();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Gagal menyimpan.");
        }
      });
    },
    [canEdit, router, flashSaved]
  );

  const onThemeChange = (v: string) => {
    setTheme(v);
    runSave(async () => {
      await saveSelfServiceTheme(v);
    });
  };

  const scheduleHoursSave = (next: OperationalHoursPayload) => {
    setHoursState(next);
    if (!canEdit) return;
    if (hoursDebounce.current) clearTimeout(hoursDebounce.current);
    hoursDebounce.current = setTimeout(() => {
      runSave(async () => {
        await saveOperationalHoursJson({
          acceptingOrders: next.acceptingOrders,
          lines: next.lines,
        });
      });
    }, 500);
  };

  const onAcceptingChange = (acceptingOrders: boolean) => {
    const next = { ...hoursState, acceptingOrders };
    scheduleHoursSave(next);
  };

  const updateLine = (index: number, patch: Partial<OperationalHoursLine>) => {
    const lines = hoursState.lines.map((l, i) => (i === index ? { ...l, ...patch } : l));
    scheduleHoursSave({ ...hoursState, lines });
  };

  const addLine = () => {
    const lines = [...hoursState.lines, emptyLine()];
    scheduleHoursSave({ ...hoursState, lines });
  };

  const removeLine = (index: number) => {
    const lines = hoursState.lines.filter((_, i) => i !== index);
    scheduleHoursSave({ ...hoursState, lines });
  };

  const onScInput = (n: number) => {
    setSc(n);
    if (!canEdit) return;
    if (scDebounce.current) clearTimeout(scDebounce.current);
    scDebounce.current = setTimeout(() => {
      const snap = receiptSnap.current;
      runSave(async () => {
        await saveReceiptInlineSettings({
          serviceChargePercent: n,
          restaurantTaxEnabled: snap.pb1,
          receiptDeliveryMode: snap.receiptMode,
        });
      });
    }, 450);
  };

  const pushReceiptSave = (patch: {
    serviceChargePercent?: number;
    restaurantTaxEnabled?: boolean;
    receiptDeliveryMode?: string;
  }) => {
    runSave(async () => {
      await saveReceiptInlineSettings({
        serviceChargePercent: patch.serviceChargePercent ?? sc,
        restaurantTaxEnabled: patch.restaurantTaxEnabled ?? pb1,
        receiptDeliveryMode: patch.receiptDeliveryMode ?? receiptMode,
      });
    });
  };

  const onPb1Change = (v: boolean) => {
    setPb1(v);
    pushReceiptSave({ restaurantTaxEnabled: v });
  };

  const onReceiptModeChange = (v: string) => {
    setReceiptMode(v);
    pushReceiptSave({ receiptDeliveryMode: v });
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">map</span>
          <h2 className="text-xl font-bold text-[#1A1C19]">Alamat &amp; Operasional</h2>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 text-xs min-h-[1.25rem]">
            {pending && (
              <span className="text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                Menyimpan…
              </span>
            )}
            {!pending && savedHint && (
              <span className="text-[#2C4F1B] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Tersimpan
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
            Alamat Lengkap
          </label>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-sm font-medium text-[#43493E]">
            {tenant.address || "Belum diisi — ubah melalui Edit Profil."}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">
            Tema Self-Service Menu
          </label>
          <select
            value={theme}
            disabled={!canEdit}
            onChange={(e) => onThemeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-sm font-medium disabled:opacity-70"
          >
            {themeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {canEdit && (
            <p className="text-[11px] text-outline mt-1.5">Disimpan otomatis saat Anda memilih tema.</p>
          )}
        </div>

        <div>
          <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">
            Status operasional
          </label>
          <label className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-xl bg-surface-container-lowest cursor-pointer">
            <input
              type="checkbox"
              checked={hoursState.acceptingOrders}
              disabled={!canEdit}
              onChange={(e) => onAcceptingChange(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant shrink-0"
            />
            <div>
              <div className="text-xs font-bold text-[#1A1C19]">
                {hoursState.acceptingOrders ? "Menerima pesanan" : "Tutup sementara"}
              </div>
              <div className="text-[11px] text-outline mt-0.5">
                {hoursState.acceptingOrders
                  ? "Pelanggan dapat memesan sesuai jadwal di bawah."
                  : "Nonaktifkan jika sedang tutup atau tidak menerima pesanan baru."}
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/30">
        <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-3">
          Jam operasional
        </label>
        <p className="text-xs text-outline mb-4">
          Isi label hari (contoh: Senin–Kamis) dan jam buka–tutup. Perubahan disimpan otomatis.
        </p>
        <div className="space-y-3">
          {hoursState.lines.length === 0 && (
            <p className="text-sm text-outline italic">Belum ada jadwal — tambahkan baris di bawah.</p>
          )}
          {hoursState.lines.map((line, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-2 p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/80"
            >
              <div className="flex-1 min-w-[140px]">
                <span className="text-[10px] font-bold text-outline uppercase block mb-1">Label</span>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={line.label}
                  placeholder="Mis. Senin–Kamis"
                  onChange={(e) => updateLine(idx, { label: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 text-sm font-medium disabled:opacity-70"
                />
              </div>
              <div className="w-[120px]">
                <span className="text-[10px] font-bold text-outline uppercase block mb-1">Buka</span>
                <input
                  type="time"
                  disabled={!canEdit}
                  value={line.open}
                  onChange={(e) => updateLine(idx, { open: e.target.value })}
                  className="w-full px-2 py-2 rounded-lg border border-outline-variant/50 text-sm disabled:opacity-70"
                />
              </div>
              <div className="w-[120px]">
                <span className="text-[10px] font-bold text-outline uppercase block mb-1">Tutup</span>
                <input
                  type="time"
                  disabled={!canEdit}
                  value={line.close}
                  onChange={(e) => updateLine(idx, { close: e.target.value })}
                  className="w-full px-2 py-2 rounded-lg border border-outline-variant/50 text-sm disabled:opacity-70"
                />
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="p-2 rounded-lg text-outline hover:bg-red-50 hover:text-red-700 transition-colors"
                  aria-label="Hapus baris"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}
            </div>
          ))}
          {canEdit && (
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah jadwal
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/30">
        <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-3">
          Struk kasir &amp; pajak
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase text-outline font-bold mb-1">Service charge (%)</div>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              disabled={!canEdit}
              value={sc}
              onChange={(e) => onScInput(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 text-sm font-semibold text-[#1A1C19] disabled:opacity-70"
            />
            <p className="text-[10px] text-outline mt-1">Dari subtotal setelah diskon</p>
          </div>
          <div>
            <div className="text-[10px] uppercase text-outline font-bold mb-1">PB1</div>
            <label className="flex items-center gap-2 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={pb1}
                disabled={!canEdit}
                onChange={(e) => onPb1Change(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant"
              />
              <span className="text-sm font-medium text-[#43493E]">Aktif (10%)</span>
            </label>
          </div>
          <div>
            <div className="text-[10px] uppercase text-outline font-bold mb-1">Struk</div>
            <select
              value={receiptMode}
              disabled={!canEdit}
              onChange={(e) => onReceiptModeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 text-sm font-medium mt-1 disabled:opacity-70"
            >
              <option value="PRINT">Cetak</option>
              <option value="EMAIL">Email</option>
              <option value="BOTH">Cetak &amp; email</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
