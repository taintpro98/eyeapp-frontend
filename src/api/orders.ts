import { apiFetch } from "@/lib/api";

export type Order = {
  id: number;
  symbol: string;
  timestamp: number;
  timestamp_str: string;
  side: "buy" | "sell";
  order_type: string;
  main_position: boolean;
  price: number;
  quantity: number;
  candle_id: number | null;
  created_at: string;
};

export type OrdersResponse = {
  data: Order[];
  pagination: {
    limit: number;
    next_cursor?: string;
    has_more: boolean;
  };
};

export type OrdersParams = {
  symbol?: string;
  side?: "buy" | "sell";
  order_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
};

export async function fetchOrders(
  params: OrdersParams,
  accessToken: string,
): Promise<OrdersResponse> {
  const query = new URLSearchParams();
  if (params.symbol) query.set("symbol", params.symbol);
  if (params.side) query.set("side", params.side);
  if (params.order_type) query.set("order_type", params.order_type);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.cursor) query.set("cursor", params.cursor);

  const qs = query.toString();
  return apiFetch<OrdersResponse>(`/orders${qs ? `?${qs}` : ""}`, {
    accessToken,
  });
}
