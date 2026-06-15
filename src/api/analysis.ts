import { apiFetch } from "@/lib/api";

export type TrendData = {
  trend: "uptrend" | "downtrend" | "sideway";
  signal: "bullish" | "bearish" | "neutral";
  strength: "strong" | "moderate" | "weak";
};

export type AnalysisResult = {
  market_id: number;
  symbol: string;
  name: string | null;
  live_price: number;
  mid_term: TrendData;
  short_term: TrendData;
  rating: "A" | "B+" | "B" | "C" | "D" | "F";
};

export async function fetchAnalysis(
  marketId: 1 | 2,
  symbol: string,
): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`/market/${marketId}/analysis/${encodeURIComponent(symbol)}`);
}
