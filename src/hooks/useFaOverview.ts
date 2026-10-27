import { useQuery } from "@tanstack/react-query";
import { fetchTickerOverview } from "@/api/fa";

/** Shared with the ticker header (exchange, company name) — one request per ticker. */
export function useFaOverview(ticker: string, enabled = true) {
  return useQuery({
    queryKey: ["fa", "overview", ticker],
    queryFn: () => fetchTickerOverview(ticker),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled,
  });
}
