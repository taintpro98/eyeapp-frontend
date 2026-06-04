import { apiFetch } from "@/lib/api";

export type WatchlistItem = {
  id: number;
  symbol: string;
  market_id: number;
  name: string | null;
  base_asset: string | null;
  quote_asset: string | null;
  is_active: boolean;
  latest_price: number | null;
};

export type WatchlistResponse = {
  total: number;
  items: WatchlistItem[];
};

export async function fetchWatchlist(
  marketId: 1 | 2,
  accessToken: string,
): Promise<WatchlistResponse> {
  return apiFetch<WatchlistResponse>(`/watchlist/${marketId}`, { accessToken });
}
