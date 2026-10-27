import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";
import { fetchFullScreener, type ScreenerSortField } from "@/api/fa";
import { taAgentRetry } from "@/lib/taAgent";
import { applyScreener } from "@/lib/fa/screener";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { FaErrorState } from "./FaErrorState";
import { ScreenerFilters } from "./ScreenerFilters";
import { ScreenerResults, type SortState } from "./ScreenerResults";
import { DEFAULT_SCREENER_FILTERS, type ScreenerFilterState } from "./screenerFilterState";

export function ScreenerPanel() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ScreenerFilterState>(DEFAULT_SCREENER_FILTERS);
  const [sort, setSort] = useState<SortState>({ field: "overallScore", dir: "desc" });
  const [page, setPage] = useState(0);

  // The whole universe is a few hundred rows: fetch it once (shared with the overview panel)
  // and filter/sort/page locally — see applyScreener for why server-side filters fall short.
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["fa", "screener-full", filters.watchedOnly ? "watched" : "all"],
    queryFn: () => fetchFullScreener({ watchedOnly: filters.watchedOnly }),
    staleTime: 5 * 60 * 1000,
    retry: taAgentRetry,
  });

  const matched = useMemo(
    () =>
      applyScreener(
        data?.items ?? [],
        {
          query: filters.query,
          exchange: filters.exchange,
          rating: filters.rating,
          minScore: filters.minScore ? Number(filters.minScore) : null,
        },
        sort,
      ),
    [data, filters.query, filters.exchange, filters.rating, filters.minScore, sort],
  );

  const changeFilters = (next: ScreenerFilterState) => {
    setFilters(next);
    setPage(0);
  };

  // Same column flips direction, a new column starts descending (best first).
  const changeSort = (field: ScreenerSortField) => {
    setSort((prev) => (prev.field === field ? { field, dir: prev.dir === "desc" ? "asc" : "desc" } : { field, dir: "desc" }));
    setPage(0);
  };

  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const items = matched.slice(safePage * filters.pageSize, (safePage + 1) * filters.pageSize);

  return (
    <div className="space-y-4">
      <ScreenerFilters value={filters} onChange={changeFilters} />

      {data?.period && (
        <p className="text-xs text-text-secondary">{t("fa.screener.period", { period: data.period })}</p>
      )}

      {isError ? (
        <FaErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border border-surface-border bg-surface-card" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Filter} title={t("fa.screener.empty.title")} description={t("fa.screener.empty.description")} />
      ) : (
        <div>
          <ScreenerResults items={items} sort={sort} onSort={changeSort} startRank={safePage * filters.pageSize + 1} />
          <Pagination page={safePage} totalPages={totalPages} total={total} totalLabel={t("fa.screener.totalLabel")} setPage={setPage} />
        </div>
      )}
    </div>
  );
}
