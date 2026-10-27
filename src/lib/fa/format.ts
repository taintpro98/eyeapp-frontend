/**
 * Number formatting for FA data. ta-agent reports money in VND, ratios such as
 * ROE / margins / YoY already in percent (18.5 = 18.5%), and multiples (P/E,
 * D/E) as plain numbers.
 */

const isNum = (v: number | null | undefined): v is number => v != null && Number.isFinite(v);

export function formatVnd(v: number | null | undefined): string {
  if (!isNum(v)) return "—";
  return `${Math.round(v).toLocaleString("vi-VN")} ₫`;
}

/** 1.25e12 → "1,25 nghìn tỷ", 3.4e9 → "3,4 tỷ". `thousandDigits` trims the nghìn-tỷ figure for tight cards. */
export function formatBillionVnd(
  v: number | null | undefined,
  unitBillion = "tỷ",
  unitThousandBillion = "nghìn tỷ",
  thousandDigits = 2,
): string {
  if (!isNum(v)) return "—";
  const billion = v / 1_000_000_000;
  if (Math.abs(billion) >= 1000) {
    return `${(billion / 1000).toLocaleString("vi-VN", { maximumFractionDigits: thousandDigits })} ${unitThousandBillion}`;
  }
  return `${billion.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ${unitBillion}`;
}

/** Value already in percent. `signed` adds "+" for growth figures. */
export function formatPct(v: number | null | undefined, { signed = false, digits = 1 } = {}): string {
  if (!isNum(v)) return "—";
  const sign = signed && v > 0 ? "+" : "";
  return `${sign}${v.toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function formatMultiple(v: number | null | undefined, digits = 2): string {
  if (!isNum(v)) return "—";
  return `${v.toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}x`;
}

/** Fixed decimals so a column of scores lines up ("78,0" next to "90,5"). */
export function formatScore(v: number | null | undefined, digits = 1): string {
  if (!isNum(v)) return "—";
  return v.toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// ─── Chart axes & tooltips ─────────────────────────────────────────

/** Axis ticks for VND amounts: "25k tỷ", "340 tỷ", "12 tr". */
export function formatVndAxis(v: number): string {
  if (!isNum(v)) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}k tỷ`;
  if (abs >= 1e9) return `${Math.round(v / 1e9).toLocaleString("vi-VN")} tỷ`;
  if (abs >= 1e6) return `${Math.round(v / 1e6).toLocaleString("vi-VN")} tr`;
  return v.toLocaleString("vi-VN");
}

export function formatVndTooltip(v: number | null | undefined): string {
  if (!isNum(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}k tỷ ₫`;
  if (abs >= 1e9) return `${(v / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ ₫`;
  if (abs >= 1e6) return `${(v / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr ₫`;
  return `${v.toLocaleString("vi-VN")} ₫`;
}

/** Share price ticks: 138500 → "139k". */
export function formatPriceAxis(v: number): string {
  if (!isNum(v)) return "0";
  return Math.abs(v) >= 1000 ? `${Math.round(v / 1000).toLocaleString("vi-VN")}k` : v.toLocaleString("vi-VN");
}

export function formatPctAxis(v: number): string {
  return isNum(v) ? `${Math.round(v)}%` : "0%";
}

export function formatMultipleAxis(v: number): string {
  return isNum(v) ? `${v.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}x` : "0";
}
