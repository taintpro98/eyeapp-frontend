import { useMarket } from "@/hooks/useMarket";

/** Returns the numeric market ID (1 = crypto, 2 = stocks) for the currently active market. */
export function useMarketId(): 1 | 2 {
  const market = useMarket();
  return market === "crypto" ? 1 : 2;
}
