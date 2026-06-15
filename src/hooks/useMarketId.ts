import { useAppStore } from "@/store/useAppStore";

/** Returns the numeric market ID (1 = crypto, 2 = stocks) for the currently selected market. */
export function useMarketId(): 1 | 2 {
  return useAppStore((s) => (s.selectedMarket === "crypto" ? 1 : 2));
}
