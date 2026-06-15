import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";

export type PagedResult<T> = { items: T[]; total: number };
export type PaginatedFetchFn<T> = (page: number, symbol: string) => Promise<PagedResult<T>>;

type Options<T> = {
  /** Fetch function that accepts the current page and symbol filter. Should be
   *  wrapped in `useCallback` and capture any extra filter state (status, etc.)
   *  so that a change to those filters causes the effect to re-run. */
  fetchFn: PaginatedFetchFn<T>;
  /** Numeric market ID — used solely to reset to page 0 when the market switches. */
  marketId: 1 | 2;
  pageSize: number;
};

type Return<T> = {
  items: T[];
  total: number;
  loading: boolean;
  accessDenied: boolean;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  symbolInput: string;
  setSymbolInput: (v: string) => void;
  /** The committed filter value (sent to the API). */
  symbolFilter: string;
  /** True when the text input differs from the committed filter — button shows "Apply". */
  isApplyMode: boolean;
  /** Either apply the pending symbol filter (resetting to page 0) or refresh. */
  handleSearchAction: () => void;
  /** Force a re-fetch of the current page without changing any other state. */
  refresh: () => void;
};

export function usePaginatedList<T>({
  fetchFn,
  marketId,
  pageSize,
}: Options<T>): Return<T> {
  const handleApiError = useApiErrorHandler();

  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [page, setPage] = useState(0);
  const [symbolInput, setSymbolInput] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isApplyMode = symbolInput.trim() !== symbolFilter;

  // Reset list state when the market changes so stale data is never shown.
  useEffect(() => {
    setPage(0);
    setItems([]);
    setAccessDenied(false);
  }, [marketId]);

  // Main fetch effect — re-runs whenever page, committed filter, fetchFn, or refreshKey changes.
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchFn(page, symbolFilter)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setAccessDenied(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const code = (err as { code?: string })?.code;
        if (code === "feature_required" || code === "subscription_required") {
          setAccessDenied(true);
        }
        handleApiError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchFn, page, symbolFilter, refreshKey, handleApiError]);

  const handleSearchAction = () => {
    if (isApplyMode) {
      setPage(0);
      setSymbolFilter(symbolInput.trim());
    } else {
      setRefreshKey((k) => k + 1);
    }
  };

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    items,
    total,
    loading,
    accessDenied,
    page,
    setPage,
    totalPages,
    symbolInput,
    setSymbolInput,
    symbolFilter,
    isApplyMode,
    handleSearchAction,
    refresh,
  };
}
