'use client';

import { useState } from 'react';
import {
  createTable, updateTableLabel, toggleTableActive, deleteTable,
} from './actions';

type Table = {
  id: string;
  label: string;
  qrToken: string;
  isActive: boolean;
};

type Props = {
  tables: Table[];
  orderBaseUrl: string;
};

// ─── QR Code viewer ────────────────────────────────────────────────────────
function QRModal({ table, orderBaseUrl, onClose }: {
  table: Table;
  orderBaseUrl: string;
  onClose: () => void;
}) {
  const tableUrl = `${orderBaseUrl}/t/${table.qrToken}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(tableUrl)}&color=1A1C19&bgcolor=F9FAF5`;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(tableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Meja ${table.label}</title>
      <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:12px;background:#F9FAF5}
      h2{font-size:22px;font-weight:bold;color:#1A1C19;margin:0}
      p{font-size:13px;color:#787868;margin:0}
      img{border:4px solid #2C4F1B;border-radius:16px;padding:8px;background:white}
      </style></head><body>
      <h2>${table.label}</h2>
      <img src="${qrImageUrl}" width="280" height="280" />
      <p>Scan untuk memesan</p>
      <p style="font-size:11px;color:#B0B0A0">${tableUrl}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#1A1C19]">QR Code — {table.label}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F3F4EF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#43493E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#F9FAF5] border-4 border-[#2C4F1B] rounded-2xl p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImageUrl} alt={`QR ${table.label}`} width={220} height={220} className="rounded-xl" />
          </div>
        </div>

        <p className="text-center text-xs font-bold text-[#1A1C19] mb-1">{table.label}</p>
        <p className="text-center text-[10px] text-[#787868] break-all mb-5">{tableUrl}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 border border-[#D5D9CE] text-[#43493E] rounded-full py-2.5 text-sm font-semibold hover:bg-[#F3F4EF] transition-colors"
          >
            {copied ? '✓ Tersalin' : 'Salin URL'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full py-2.5 text-sm font-bold shadow-md"
          >
            Print / Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row ────────────────────────────────────────────────────────────────────
function TableRow({
  table, orderBaseUrl, onQRView,
}: {
  table: Table;
  orderBaseUrl: string;
  onQRView: (t: Table) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [label, setLabel]       = useState(table.label);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSaveLabel() {
    setSaving(true);
    setError(null);
    const r = await updateTableLabel(table.id, label);
    setSaving(false);
    if (!r.success) { setError(r.error); return; }
    setEditing(false);
  }

  async function handleToggle() {
    setToggling(true);
    await toggleTableActive(table.id, !table.isActive);
    setToggling(false);
  }

  async function handleDelete() {
    if (!confirm(`Hapus "${table.label}"? Riwayat pesanan tidak akan terhapus.`)) return;
    setDeleting(true);
    await deleteTable(table.id);
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#EDEEE9] px-4 py-3 flex items-center gap-3 ${!table.isActive ? 'opacity-50' : ''}`}>
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${table.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
              autoFocus
              className="flex-1 px-2 py-1 border border-[#2C4F1B] rounded-lg text-sm font-semibold focus:outline-none"
            />
            <button onClick={handleSaveLabel} disabled={saving} className="text-xs bg-[#2C4F1B] text-white px-2 py-1 rounded-lg">
              {saving ? '…' : 'Simpan'}
            </button>
            <button onClick={() => { setEditing(false); setLabel(table.label); }} className="text-xs text-[#787868] px-2 py-1">
              Batal
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm font-semibold text-[#1A1C19] hover:text-[#2C4F1B] text-left">
            {table.label}
          </button>
        )}
        {error && <p className="text-[10px] text-red-600 mt-0.5">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* QR button */}
        <button
          onClick={() => onQRView(table)}
          className="flex items-center gap-1 text-xs bg-[#E8F5E2] text-[#2C4F1B] font-bold px-2.5 py-1.5 rounded-full hover:bg-[#D4EECC]"
          title="Lihat QR Code"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <path d="M13 17h2m2 0h2M13 13h2m4 0v2m0 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          QR
        </button>

        {/* Toggle aktif */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${
            table.isActive
              ? 'border-[#D5D9CE] text-[#787868] hover:border-red-300 hover:text-red-600'
              : 'border-green-300 text-green-700 hover:bg-green-50'
          }`}
          title={table.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        >
          {toggling ? '…' : table.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[#787868] hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
          title="Hapus meja"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function TablesClient({ tables: initial, orderBaseUrl }: Props) {
  const [tables, setTables] = useState(initial);
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [qrTable, setQrTable] = useState<Table | null>(null);

  async function handleAdd() {
    setAdding(true);
    setAddError(null);
    const r = await createTable(newLabel);
    setAdding(false);
    if (!r.success) { setAddError(r.error); return; }
    setNewLabel('');
    // Refresh dilakukan via revalidatePath di action — tapi untuk optimistic update:
    window.location.reload();
  }

  const active   = tables.filter((t) => t.isActive).length;
  const inactive = tables.filter((t) => !t.isActive).length;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#1A1C19]">Meja & QR Code</h1>
        <div className="flex gap-2 text-xs text-[#787868]">
          <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{active} aktif</span>
          {inactive > 0 && (
            <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">{inactive} nonaktif</span>
          )}
        </div>
      </div>
      <p className="text-sm text-[#787868] mb-6">
        Setiap meja punya QR Code unik. Customer scan QR → langsung ke menu dine-in.
        Klik tombol <strong>QR</strong> untuk melihat atau mencetak QR Code tiap meja.
      </p>

      {/* Add new table */}
      <div className="bg-white rounded-2xl border border-[#EDEEE9] px-4 py-3 flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => { setNewLabel(e.target.value); setAddError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nama meja baru, mis: Meja 1, Rooftop A, Bar 2…"
          className="flex-1 text-sm text-[#1A1C19] placeholder:text-[#B0B4AC] focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newLabel.trim()}
          className="flex-shrink-0 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white text-sm font-bold px-4 py-2 rounded-full disabled:opacity-40 shadow-sm"
        >
          {adding ? '…' : '+ Tambah'}
        </button>
      </div>
      {addError && <p className="text-xs text-red-600 mb-3 px-1">{addError}</p>}

      {/* Table list */}
      {tables.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#D5D9CE]">
          <p className="text-4xl mb-3">🪑</p>
          <p className="font-semibold text-[#1A1C19]">Belum ada meja</p>
          <p className="text-xs text-[#787868] mt-1">Tambahkan meja di atas untuk generate QR Code.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tables.map((t) => (
            <TableRow
              key={t.id}
              table={t}
              orderBaseUrl={orderBaseUrl}
              onQRView={setQrTable}
            />
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrTable && (
        <QRModal
          table={qrTable}
          orderBaseUrl={orderBaseUrl}
          onClose={() => setQrTable(null)}
        />
      )}
    </div>
  );
}
