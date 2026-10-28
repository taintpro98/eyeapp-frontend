import { useQuery } from "@tanstack/react-query";
import { fetchMarketHistory, type HistoryRange } from "@/api/markets";

/**
 * Index/coin history, refreshed on the backend cache's cadence: intraday (1D) bars
 * every minute, daily/weekly ranges every hour.
 */
export function useMarketHistory(marketId: number, code: string | undefined, range: HistoryRange) {
  return useQuery({
    queryKey: ["markets", marketId, "history", code, range],
    queryFn: () => fetchMarketHistory(marketId, code!, range),
    enabled: !!code,
    // Keep the previous series on screen while another code/range loads (the chart updates in place).
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    // Match the backend cache: intraday bars 1 minute, daily/weekly history 1 hour.
    refetchInterval: range === "1D" ? 60_000 : 60 * 60_000,
    retry: 1,
  });
}
