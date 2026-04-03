export type OperationalHoursLine = { label: string; open: string; close: string };

export type OperationalHoursPayload = {
  acceptingOrders: boolean;
  lines: OperationalHoursLine[];
};

const DEFAULT: OperationalHoursPayload = {
  acceptingOrders: true,
  lines: [],
};

export function parseOperationalHours(raw: unknown): OperationalHoursPayload {
  if (!raw || typeof raw !== "object") return { ...DEFAULT, lines: [] };
  const o = raw as Record<string, unknown>;
  const acceptingOrders =
    typeof o.acceptingOrders === "boolean" ? o.acceptingOrders : true;
  const linesRaw = Array.isArray(o.lines) ? o.lines : [];
  const lines: OperationalHoursLine[] = [];
  for (const row of linesRaw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const label = typeof r.label === "string" ? r.label.trim() : "";
    const open = typeof r.open === "string" ? r.open : "10:00";
    const close = typeof r.close === "string" ? r.close : "21:00";
    if (label) lines.push({ label, open, close });
  }
  return { acceptingOrders, lines };
}

export function emptyLine(): OperationalHoursLine {
  return { label: "", open: "10:00", close: "21:00" };
}
