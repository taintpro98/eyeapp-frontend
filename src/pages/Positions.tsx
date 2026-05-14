import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchPositions } from "@/api/positions";
import { RelativeTime } from "@/components/RelativeTime";
import { cn } from "@/lib/utils";
import type { Position, PositionStatus } from "@/api/positions";

const PAGE_SIZE = 15;

type StatusFilter = "all" | PositionStatus;

const STATUS_FILTERS: StatusFilter[] = ["all", "opening", "opened", "closing", "closed"];

function statusClass(status: PositionStatus) {
  switch (status) {
    case "opening":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "opened":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "closing":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
    case "closed":
      return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function sideClass(side: "buy" | "sell") {
  return side === "buy"
    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
}

function termClass(term: "short_term" | "mid_term") {
  return term === "short_term"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
    : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400";
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

function formatPrice(n: number) {
  if (n === 0) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function PositionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const marketId = (selectedMarket === "crypto" ? 1 : 2) as 1 | 2;

  const [positions, setPositions] = useState<Position[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [symbolInput, setSymbolInput] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(
    async (p: number, symbol: string, sf: StatusFilter, active: boolean | null) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const res = await fetchPositions(
          {
            market_id: marketId,
            limit: PAGE_SIZE,
            offset: p * PAGE_SIZE,
            symbol: symbol || undefined,
            is_active: active !== null ? active : undefined,
            status: sf !== "all" ? (sf as PositionStatus) : undefined,
          },
          accessToken,
        );
        setPositions(res.items);
        setTotal(res.total);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    },
    [accessToken, marketId],
  );

  useEffect(() => {
    setPage(0);
    setPositions([]);
  }, [marketId]);

  useEffect(() => {
    load(page, symbolFilter, statusFilter, isActive);
  }, [load, page, symbolFilter, statusFilter, isActive, refreshKey]);

  const handleRowClick = useCallback(
    (row: Position) => {
      navigate(`/app/positions/${row.id}`, { state: { marketId } });
    },
    [navigate, marketId],
  );

  const isApplyMode = symbolInput.trim() !== symbolFilter;

  const handleSearchAction = () => {
    if (isApplyMode) {
      setPage(0);
      setSymbolFilter(symbolInput.trim());
    } else {
      setRefreshKey((k) => k + 1);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "timestamp",
        header: t("positions.columns.time"),
        render: (row: Position) => (
          <RelativeTime timestampMs={row.timestamp * 1000} />
        ),
      },
      {
        key: "symbol",
        header: t("positions.columns.symbol"),
        render: (row: Position) => (
          <span className="font-bold text-text-primary">{row.symbol}</span>
        ),
      },
      {
        key: "side",
        header: t("positions.columns.side"),
        render: (row: Position) => (
          <Badge className={sideClass(row.side)}>
            {t(`positionsEnum.side.${row.side}`)}
          </Badge>
        ),
      },
      {
        key: "status",
        header: t("positions.columns.status"),
        render: (row: Position) => (
          <Badge className={statusClass(row.status)}>
            {t(`positionsEnum.status.${row.status}`)}
          </Badge>
        ),
      },
      {
        key: "term",
        header: t("positions.columns.term"),
        render: (row: Position) => (
          <Badge className={termClass(row.term)}>
            {t(`positionsEnum.term.${row.term}`)}
          </Badge>
        ),
      },
      {
        key: "avg_price",
        header: t("positions.columns.avgPrice"),
        render: (row: Position) => (
          <span className="tabular-nums">{formatPrice(row.avg_price)}</span>
        ),
      },
      {
        key: "size",
        header: t("positions.columns.size"),
        render: (row: Position) => (
          <span className="tabular-nums text-text-secondary">{row.size.toFixed(4)}</span>
        ),
      },
      {
        key: "capacity",
        header: t("positions.columns.capacity"),
        render: (row: Position) => {
          const pct = row.capacity > 0
            ? Math.min(100, (row.size / row.capacity) * 100)
            : 0;
          return (
            <div className="flex items-center gap-2 min-w-[80px]">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-border">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    row.side === "buy" ? "bg-green-500" : "bg-red-500",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="tabular-nums text-xs text-text-secondary w-9 text-right">
                {(row.capacity * 100).toFixed(0)}%
              </span>
            </div>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader title={t("positions.title")} subtitle={t("positions.subtitle")}>
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            placeholder={t("positions.filterPlaceholder")}
            className="min-w-0 flex-1 sm:w-48 sm:flex-none"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchAction()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchAction}
            disabled={loading}
            className="shrink-0 gap-2"
          >
            {isApplyMode ? (
              t("common.apply")
            ) : (
              <>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                <span className="hidden sm:inline">{t("common.refresh")}</span>
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {/* Filters row: scrollable pills + pinned checkbox */}
      <div className="flex items-center gap-0">
        {/* Pills: horizontally scrollable on mobile, no line-break */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf}
              onClick={() => { setStatusFilter(sf); setPage(0); }}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === sf
                  ? "bg-brand-primary text-white"
                  : "border border-surface-border bg-surface-card text-text-secondary hover:text-text-primary",
              )}
            >
              {t(`positions.filter.${sf}`)}
            </button>
          ))}
        </div>

        {/* Active checkbox — always visible, pinned right */}
        <label className="ml-3 flex shrink-0 cursor-pointer items-center gap-2 select-none border-l border-surface-border pl-3">
          <div
            role="checkbox"
            aria-checked={isActive}
            onClick={() => { setIsActive((v) => !v); setPage(0); }}
            className={cn(
              "h-4 w-4 rounded border-2 transition-colors flex items-center justify-center",
              isActive
                ? "border-brand-primary bg-brand-primary"
                : "border-surface-border bg-transparent",
            )}
          >
            {isActive && (
              <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-white stroke-[2]">
                <polyline points="1,4 4,7 9,1" />
              </svg>
            )}
          </div>
          <span className="text-xs font-medium text-text-secondary">
            {t("positions.filter.activeOnly")}
          </span>
        </label>
      </div>

      <SectionCard
        title={t("positions.listTitle")}
        subtitle={t("positions.listSubtitle")}
        className="p-3 sm:p-4 md:p-6"
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-text-secondary">{t("common.loading")}</p>
        ) : positions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">{t("positions.noPositions")}</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={positions}
              onRowClick={handleRowClick}
              renderMobileCard={(row: Position) => (
                <div
                  className={cn(
                    "rounded-lg border-l-4 border-surface-border bg-surface-card p-3 sm:p-4 dark:bg-zinc-900/40",
                    row.side === "buy" ? "border-l-green-500" : "border-l-red-500",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-lg font-bold text-text-primary">{row.symbol}</span>
                      <RelativeTime timestampMs={row.timestamp * 1000} className="mt-0.5 block text-[11px]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={sideClass(row.side)}>
                        {t(`positionsEnum.side.${row.side}`)}
                      </Badge>
                      <Badge className={statusClass(row.status)}>
                        {t(`positionsEnum.status.${row.status}`)}
                      </Badge>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.avgPrice")}
                      </dt>
                      <dd className="mt-0.5 tabular-nums text-text-primary">{formatPrice(row.avg_price)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.size")}
                      </dt>
                      <dd className="mt-0.5 tabular-nums text-text-secondary">{row.size.toFixed(4)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.term")}
                      </dt>
                      <dd className="mt-0.5">
                        <Badge className={termClass(row.term)}>
                          {t(`positionsEnum.term.${row.term}`)}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.capacity")}
                      </dt>
                      <dd className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-border">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              row.side === "buy" ? "bg-green-500" : "bg-red-500",
                            )}
                            style={{
                              width: `${row.capacity > 0 ? Math.min(100, (row.size / row.capacity) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-xs text-text-secondary">
                          {(row.capacity * 100).toFixed(0)}%
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            />

            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-sm text-text-secondary">
                {total} {t("positions.total")}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-text-secondary">{page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
