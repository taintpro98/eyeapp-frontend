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
