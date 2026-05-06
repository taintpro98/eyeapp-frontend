import { apiFetch } from "@/lib/api";

export type Signal = {
  id: number;
  symbol: string;
  market_id: number;
  timestamp: number;
  timestamp_str: string;
  side: "buy" | "sell";
  signal_type: string;
  main_position: string;
  price: number;
  quantity: number;
  confidence: number;
  candle_id: number | null;
};

export type SignalsResponse = {
  total: number;
  items: Signal[];
};

export type SignalsParams = {
  market_id: 1 | 2;
  limit?: number;
  offset?: number;
  symbol?: string;
};

export async function fetchSignals(
  params: SignalsParams,
  accessToken: string,
): Promise<SignalsResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  if (params.symbol) query.set("symbol", params.symbol);

  const qs = query.toString();
  return apiFetch<SignalsResponse>(
    `/signals/${params.market_id}${qs ? `?${qs}` : ""}`,
    { accessToken },
  );
}
