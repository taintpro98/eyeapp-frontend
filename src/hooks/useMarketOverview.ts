import { useQuery } from "@tanstack/react-query";
import { fetchMarketOverview } from "@/api/markets";

/** Dashboard market snapshot: polls every minute, same as the backend cache. Errors hide the widgets. */
export function useMarketOverview(marketId: number) {
  return useQuery({
    queryKey: ["markets", marketId, "overview"],
    queryFn: () => fetchMarketOverview(marketId),
    refetchInterval: 60_000,
    retry: 1,
  });
}
