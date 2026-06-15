import { useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

/**
 * Returns the string market code for the current route (e.g. "crypto", "stocks").
 *
 * On market-scoped pages (/app/:market/...) this is read directly from the URL.
 * On market-agnostic pages (profile, billing, settings) the :market param is
 * absent, so we fall back to the last value synced into the Zustand store by
 * AppShell. This keeps the market context stable while the user navigates to
 * account pages and back.
 */
export function useMarket(): string {
  const { market } = useParams<{ market?: string }>();
  const storedMarket = useAppStore((s) => s.selectedMarket);
  return market ?? storedMarket ?? "stocks";
}
