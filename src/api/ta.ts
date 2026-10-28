import { taAgentFetch } from "@/lib/taAgent";

/**
 * Technical-analysis chart data from ta-agent's TradingView-style UDF datafeed,
 * reached through the eyeapp-backend proxy (`/api/v1/ta/{marketId}/udf/*`).
 * Only Vietnamese listed stocks have candles.
 */

export type UdfSearchItem = {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  ticker: string;
  type: string;
};

export type UdfSymbolInfo = {
  name: string;
  full_name: string;
  description: string;
  exchange: string;
  timezone: string;
  session: string;
  pricescale: number;
  currency_code: string;
  s?: "error";
};

export type UdfHistory =
  | { s: "ok"; t: number[]; o: number[]; h: number[]; l: number[]; c: number[]; v: number[] }
  | { s: "no_data" | "error"; nextTime?: number; errmsg?: string };

/** ta-agent signal as a UDF bar mark: label B = buy, S = sell, W = watch. */
export type UdfMark = {
  id: string;
  /** Unix seconds */
  time: number;
  color: { border: string; background: string };
  text: string;
  label: string;
};

/** Resolutions ta-agent serves: 1/15/60 minutes, day, week, month. */
export type UdfResolution = "1" | "15" | "60" | "D" | "W" | "M";

export function searchSymbols(query = "", limit = 3000): Promise<UdfSearchItem[]> {
  return taAgentFetch<UdfSearchItem[]>("/udf/search", { query, limit }, "ta");
}

export function fetchSymbolInfo(symbol: string): Promise<UdfSymbolInfo> {
  return taAgentFetch<UdfSymbolInfo>("/udf/symbols", { symbol }, "ta");
}

export function fetchHistory(params: {
  symbol: string;
  resolution: UdfResolution;
  /** Unix seconds */
  from: number;
  /** Unix seconds */
  to: number;
  countback?: number;
}): Promise<UdfHistory> {
  return taAgentFetch<UdfHistory>("/udf/history", params, "ta");
}

export function fetchMarks(params: { symbol: string; from: number; to: number; resolution?: UdfResolution }): Promise<UdfMark[]> {
  return taAgentFetch<UdfMark[]>("/udf/marks", { resolution: "D", ...params }, "ta");
}

/** Last daily close vs the previous one, plus the last session's volume. */
export type DailyQuote = { close: number; change: number; changePct: number; volume: number; time: number };

export async function fetchDailyQuote(symbol: string): Promise<DailyQuote | null> {
  const to = Math.floor(Date.now() / 1000);
  const data = await fetchHistory({ symbol, resolution: "D", from: to - 30 * 86400, to, countback: 2 });
  if (data.s !== "ok" || data.c.length === 0) return null;
  const last = data.c.length - 1;
  const close = data.c[last];
  const prev = last > 0 ? data.c[last - 1] : close;
  return {
    close,
    change: close - prev,
    changePct: prev ? ((close - prev) / prev) * 100 : 0,
    volume: data.v[last] ?? 0,
    time: data.t[last],
  };
}

/** BUY/SELL/WATCH counts of ta-agent's indicator alerts. */
export type AlertsSummary = {
  buy: number;
  sell: number;
  watch: number;
  total: number;
};

/** Alert counts for the last `days` days, ending at ta-agent's latest alert date. */
export async function fetchAlertsSummary(days = 1): Promise<AlertsSummary> {
  return taAgentFetch<AlertsSummary>("/alerts/summary", { days }, "ta");
}
