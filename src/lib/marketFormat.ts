import type { MarketQuote } from "@/api/markets";

export const CRYPTO_MARKET_ID = 1;

/** Display names for the codes the market-data API returns. */
const QUOTE_LABELS: Record<string, string> = {
  VNINDEX: "VN-Index",
  VN30: "VN30",
  HNX: "HNX-Index",
  UPCOM: "UPCoM-Index",
};

export function quoteLabel(code: string) {
  return QUOTE_LABELS[code] ?? code;
}

/** Index points (2 decimals) or a USD price (more decimals for cheap coins). */
export function formatQuoteValue(value: number, isCrypto: boolean) {
  if (!isCrypto) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 2 : 4 })}`;
}

export function formatQuote(q: MarketQuote, isCrypto: boolean) {
  return formatQuoteValue(q.value, isCrypto);
}

export function formatChange(value: number, isCrypto: boolean) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString(undefined, { maximumFractionDigits: isCrypto && Math.abs(value) < 1 ? 4 : 2 })}`;
}

/** "HH:mm dd/MM" in the viewer's time zone. */
export function formatAsOf(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
