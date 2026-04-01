/** Normalisasi nomor HP Indonesia ke format 08xxxxxxxxxx */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('62')) d = `0${d.slice(2)}`;
  if (d.startsWith('8') && d.length >= 9 && !d.startsWith('0')) d = `0${d}`;
  return d;
}

export function isValidIdPhone(normalized: string): boolean {
  return /^08\d{8,11}$/.test(normalized);
}
