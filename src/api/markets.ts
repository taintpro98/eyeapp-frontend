import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export type MarketPlan = {
  code: string;
  name: string;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
};

export type Market = {
  market_id: number;
  code: string;
  name: string;
  active: boolean;
  plans: MarketPlan[];
};

export type UserMarketFeature = {
  code: string;
  name: string;
  accessible: boolean;
  required_plan: string;
};

export type UserMarket = {
  code: string;
  name: string;
  plan: string;
  expires_at: string | null;
  features: UserMarketFeature[];
};

export async function fetchAllMarkets(): Promise<Market[]> {
  return apiFetch<Market[]>("/markets");
}

export async function fetchOnboardingMarkets(): Promise<Market[]> {
  return apiFetch<Market[]>("/markets/onboarding");
}

export async function fetchUserMarkets(): Promise<UserMarket[]> {
  const accessToken = useAuthStore.getState().getAccessToken();
  return apiFetch<UserMarket[]>("/me/markets", { accessToken: accessToken ?? undefined });
}

export async function subscribeFreeMarket(marketId: number): Promise<void> {
  const accessToken = useAuthStore.getState().getAccessToken();
  return apiFetch<void>("/me/subscriptions", {
    method: "POST",
    body: JSON.stringify({ market_id: marketId }),
    accessToken: accessToken ?? undefined,
  });
}

export type MarketQuote = {
  code: string;
  value: number;
  change: number;
  change_pct: number;
};

export type MarketOverview = {
  market_id: number;
  as_of: string;
  quotes: MarketQuote[];
  /** HOSE advancers/decliners — vnstock only. */
  breadth?: {
    advances: number;
    declines: number;
    unchanged: number;
    ceiling: number;
    floor: number;
  };
  /** HOSE session value in VND — vnstock only. */
  turnover?: number;
};

/** Index levels (vnstock) or top coins (crypto); backend caches for 60s. */
export async function fetchMarketOverview(marketId: number): Promise<MarketOverview> {
  const accessToken = useAuthStore.getState().getAccessToken();
  return apiFetch<MarketOverview>(`/markets/${marketId}/overview`, {
    accessToken: accessToken ?? undefined,
  });
}

export type HistoryRange = "1D" | "1M" | "3M" | "1Y" | "5Y";

/** One bar: 5-minute (1D), daily, or weekly (5Y). */
export type MarketHistoryPoint = {
  /** Bar start, unix seconds. */
  time: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Shares (vnstock) or base-asset units (crypto) traded in the bar. */
  volume: number;
  /** Session value in VND (vnstock) or quote volume in USDT (crypto). */
  turnover?: number;
  advances?: number;
  declines?: number;
};

export type MarketHistory = {
  code: string;
  range: HistoryRange;
  points: MarketHistoryPoint[];
};

/** Closing series of one index (vnstock) or coin (crypto). */
export async function fetchMarketHistory(marketId: number, code: string, range: HistoryRange): Promise<MarketHistory> {
  const accessToken = useAuthStore.getState().getAccessToken();
  const qs = new URLSearchParams({ code, range });
  return apiFetch<MarketHistory>(`/markets/${marketId}/history?${qs}`, {
    accessToken: accessToken ?? undefined,
  });
}

export type Mover = {
  code: string;
  /** Thousand VND (vnstock) or USDT (crypto). */
  price: number;
  change_pct: number;
  /** Session matched value in VND (vnstock) or 24h quote volume in USDT (crypto). */
  value: number;
};

export type MarketMovers = {
  market_id: number;
  as_of: string;
  gainers: Mover[];
  losers: Mover[];
  active: Mover[];
  /** Crypto only: direction of the 100 most traded USDT pairs. */
  breadth?: { advances: number; declines: number; unchanged: number; total_volume: number };
};

export async function fetchMarketMovers(marketId: number): Promise<MarketMovers> {
  const accessToken = useAuthStore.getState().getAccessToken();
  return apiFetch<MarketMovers>(`/markets/${marketId}/movers`, { accessToken: accessToken ?? undefined });
}

export type ForeignStock = { code: string; net_value: number };

export type ForeignFlow = {
  floor: string;
  latest: {
    date: string;
    buy_value: number;
    sell_value: number;
    net_value: number;
    top_buy: ForeignStock[];
    top_sell: ForeignStock[];
  };
  history: { date: string; net_value: number }[];
};

/** HOSE foreign investor flow (vnstock only), values in VND. */
export async function fetchForeignFlow(marketId: number): Promise<ForeignFlow> {
  const accessToken = useAuthStore.getState().getAccessToken();
  return apiFetch<ForeignFlow>(`/markets/${marketId}/foreign`, { accessToken: accessToken ?? undefined });
}
