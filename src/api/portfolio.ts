import { apiFetch } from "@/lib/api";

export type PortfolioHolding = {
  position_id: number;
  symbol: string;
  side: "buy" | "sell";
  port_slot: number;
  size: number;
  spent: number;
  size_ratio: number;
  current_value: number;
  weight: number;
  avg_price: number;
  current_price: number | null;
  position_return: number | null;
};

export type PortfolioResponse = {
  total_capital: number;
  total_portfolio_value: number;
  cash: number;
  cash_weight: number;
  holdings: PortfolioHolding[];
};

export async function fetchPortfolio(
  marketId: 1 | 2,
  accessToken: string,
): Promise<PortfolioResponse> {
  return apiFetch<PortfolioResponse>(`/market/${marketId}/portfolio`, {
    accessToken,
  });
}
