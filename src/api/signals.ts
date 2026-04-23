import { apiFetch } from "@/lib/api";

export type Signal = {
  id: number;
  symbol: string;
  timestamp: number;
  timestamp_str: string;
  side: "buy" | "sell";
  signal_type: string;
  main_position: boolean;
  price: number;
  quantity: number;
  candle_id: number | null;
  created_at: string;
};

export type SignalsResponse = {
  data: Signal[];
  pagination: {
    limit: number;
    next_cursor?: string;
    has_more: boolean;
  };
};

export type SignalsParams = {
  symbol?: string;
  side?: "buy" | "sell";
  signal_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
};

export async function fetchSignals(
  params: SignalsParams,
  accessToken: string,
): Promise<SignalsResponse> {
  const query = new URLSearchParams();
  if (params.symbol) query.set("symbol", params.symbol);
  if (params.side) query.set("side", params.side);
  if (params.signal_type) query.set("signal_type", params.signal_type);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.cursor) query.set("cursor", params.cursor);

  const qs = query.toString();
  return apiFetch<SignalsResponse>(`/signals${qs ? `?${qs}` : ""}`, {
    accessToken,
  });
}
