import { apiFetch } from "@/lib/api";

export type PositionStatus = "running" | "opening" | "opened" | "closing" | "cancelling" | "closed";
export type PositionTerm = "short_term" | "mid_term";
export type PositionSide = "buy" | "sell";

export type Position = {
  id: number;
  symbol: string;
  market_id: number;
  side: PositionSide;
  status: PositionStatus;
  term: PositionTerm;
  active: boolean;
  timestamp: number;
  timestamp_str: string;
  avg_price: number;
  stop_loss: number | null;
  size: number;
  capacity: number;
  realized_pnl: number | null;
  booked_pnl: number;
  drive_candle_id: number;
  created_at: string;
  updated_at: string;
};

export type PositionsResponse = {
  total: number;
  items: Position[];
};

export type PositionsParams = {
  market_id: 1 | 2;
  limit?: number;
  offset?: number;
  is_active?: boolean;
  status?: PositionStatus;
  symbol?: string;
};

export type PositionOrder = {
  id: number;
  position_id: number;
  timestamp: number;
  timestamp_str: string;
  side: PositionSide;
  order_type: "increase" | "decrease";
  price: number;
  quantity: number;
  order_pnl: number;
  position_pnl: number;
  signal_id: number | null;
  created_at: string;
};

export type PositionDetail = Position & {
  orders: PositionOrder[];
};

export type PositionLive = Position & {
  current_price: number | null;
  current_pnl: number | null;
  position_return: number | null;
};

export async function fetchPositions(
  params: PositionsParams,
  accessToken: string,
): Promise<PositionsResponse> {
  const q = new URLSearchParams();
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.offset != null) q.set("offset", String(params.offset));
  if (params.is_active != null) q.set("is_active", String(params.is_active));
  if (params.status) q.set("status", params.status);
  if (params.symbol) q.set("symbol", params.symbol);
  const qs = q.toString();
  return apiFetch<PositionsResponse>(
    `/positions/${params.market_id}${qs ? `?${qs}` : ""}`,
    { accessToken },
  );
}

export async function fetchPositionDetail(
  marketId: 1 | 2,
  positionId: number,
  accessToken: string,
): Promise<PositionDetail> {
  return apiFetch<PositionDetail>(
    `/positions/${marketId}/${positionId}`,
    { accessToken },
  );
}

export async function fetchPositionLive(
  marketId: 1 | 2,
  positionId: number,
  accessToken: string,
): Promise<PositionLive> {
  return apiFetch<PositionLive>(
    `/positions/${marketId}/${positionId}/live`,
    { accessToken },
  );
}
