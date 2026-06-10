import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchPositions, fetchPositionLive } from "@/api/positions";
import { RelativeTime } from "@/components/RelativeTime";
import { cn } from "@/lib/utils";
import type { Position, PositionStatus } from "@/api/positions";

type LiveEntry = { price: number | null; pnl: number | null; positionReturn: number | null };
type LiveMap = Map<number, LiveEntry>;
type LoadingSet = Set<number>;

const PAGE_SIZE = 15;

type StatusFilter = "all" | PositionStatus;

const STATUS_FILTERS: StatusFilter[] = ["all", "running", "opening", "opened", "closing", "cancelling", "closed"];

function statusClass(status: PositionStatus) {
  switch (status) {
    case "running":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "opening":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "opened":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "closing":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
    case "cancelling":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
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
  const handleApiError = useApiErrorHandler();
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const marketId = (selectedMarket === "crypto" ? 1 : 2) as 1 | 2;

  const [positions, setPositions] = useState<Position[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [page, setPage] = useState(0);
  const [symbolInput, setSymbolInput] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [liveMap, setLiveMap] = useState<LiveMap>(new Map());
  const [liveLoadingSet, setLiveLoadingSet] = useState<LoadingSet>(new Set());

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
            is_active: active || undefined,
            status: sf !== "all" ? (sf as PositionStatus) : undefined,
          },
          accessToken,
        );
        setPositions(res.items);
        setTotal(res.total);
        setAccessDenied(false);
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "feature_required" || code === "subscription_required") {
          setAccessDenied(true);
        }
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, marketId],
  );

  useEffect(() => {
    setPage(0);
    setPositions([]);
    setLiveMap(new Map());
    setLiveLoadingSet(new Set());
    setAccessDenied(false);
  }, [marketId]);

  useEffect(() => {
    load(page, symbolFilter, statusFilter, isActive);
  }, [load, page, symbolFilter, statusFilter, isActive, refreshKey]);

  const handleRowClick = useCallback(
    (row: Position) => {
      setSelectedId(row.id);
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

  const handleRefreshPositionLive = useCallback(
    async (e: React.MouseEvent, row: Position) => {
      e.stopPropagation();
      if (!accessToken || liveLoadingSet.has(row.id)) return;
      setLiveLoadingSet((prev) => new Set(prev).add(row.id));
      try {
        const live = await fetchPositionLive(marketId, row.id, accessToken);
        setLiveMap((prev) => {
          const next = new Map(prev);
          next.set(row.id, { price: live.current_price, pnl: live.current_pnl, positionReturn: live.position_return });
          return next;
        });
      } catch (err) {
        handleApiError(err);
      } finally {
        setLiveLoadingSet((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [accessToken, marketId, liveLoadingSet],
  );

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
          <div className="flex flex-col gap-0.5">
            <span className="tabular-nums">{formatPrice(row.avg_price)}</span>
            {row.stop_loss != null ? (
              <span className="tabular-nums text-xs text-red-500">{formatPrice(row.stop_loss)}</span>
            ) : (
              <span className="text-xs text-text-secondary">—</span>
            )}
          </div>
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
                {row.capacity.toFixed(0)}%
              </span>
            </div>
          );
        },
      },
      {
        key: "current_price",
        header: t("positions.columns.currentPrice"),
        render: (row: Position) => {
          const live = liveMap.get(row.id);
          if (!live) return <span className="tabular-nums text-text-secondary">—</span>;
          return (
            <span className="tabular-nums text-text-primary">
              {live.price != null ? formatPrice(live.price) : "—"}
            </span>
          );
        },
      },
      {
        key: "current_pnl",
        header: t("positions.columns.currentPnl"),
        render: (row: Position) => {
          const live = liveMap.get(row.id);
          if (!live || live.pnl == null) return <span className="text-text-secondary">—</span>;
          return (
            <span className={cn(
              "tabular-nums",
              live.pnl > 0 ? "text-green-500" : live.pnl < 0 ? "text-red-500" : "text-text-secondary",
            )}>
              {live.pnl > 0 ? "+" : ""}{formatPrice(live.pnl)}%
            </span>
          );
        },
      },
      {
        key: "position_return",
        header: t("positions.columns.positionReturn"),
        render: (row: Position) => {
          const live = liveMap.get(row.id);
          if (!live || live.positionReturn == null) return <span className="text-text-secondary">—</span>;
          return (
            <span className={cn(
              "tabular-nums",
              live.positionReturn > 0 ? "text-green-500" : live.positionReturn < 0 ? "text-red-500" : "text-text-secondary",
            )}>
              {live.positionReturn > 0 ? "+" : ""}{formatPrice(live.positionReturn)}%
            </span>
          );
        },
      },
      {
        key: "dist_to_stop",
        header: t("positions.columns.distToStop"),
        render: (row: Position) => {
          const live = liveMap.get(row.id);
          if (!live || live.price == null || row.stop_loss == null || row.avg_price === 0) {
            return <span className="text-text-secondary">—</span>;
          }
          const dist = (Math.abs(live.price - row.stop_loss) / row.avg_price) * 100;
          const cls = dist > 5 ? "text-green-500" : dist >= 2 ? "text-amber-500" : "text-red-500";
          return <span className={cn("tabular-nums text-xs font-semibold", cls)}>{dist.toFixed(2)}%</span>;
        },
      },
      {
        key: "refresh_live",
        header: "",
        render: (row: Position) => {
          const refreshing = liveLoadingSet.has(row.id);
          return (
            <button
              onClick={(e) => handleRefreshPositionLive(e, row)}
              disabled={refreshing}
              className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
              title={t("positions.detail.refreshLive")}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </button>
          );
        },
      },
    ],
    [t, liveMap, liveLoadingSet, handleRefreshPositionLive],
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
        ) : accessDenied ? (
          <AccessDeniedState titleKey="positions.accessDenied" hintKey="positions.accessDeniedHint" />
        ) : positions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">{t("positions.noPositions")}</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={positions}
              onRowClick={handleRowClick}
              renderMobileCard={(row: Position, index: number) => (
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-surface-card p-4 shadow-card transition-all duration-150 card-hint",
                    "group-active/card:scale-[0.98]",
                    row.id === selectedId
                      ? "border-l-4 border-l-[var(--brand-primary)] bg-brand-primary/5 shadow-[inset_3px_0_0_var(--brand-primary)]"
                      : cn(
                          "border-surface-border",
                          row.side === "buy" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500",
                        ),
                  )}
                  style={{ ["--row-delay" as string]: `${index * 80}ms` }}
                >
                  {/* header row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-text-primary">{row.symbol}</span>
                      <Badge className={sideClass(row.side)}>
                        {t(`positionsEnum.side.${row.side}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={statusClass(row.status)}>
                        {t(`positionsEnum.status.${row.status}`)}
                      </Badge>
                      <button
                        onClick={(e) => handleRefreshPositionLive(e, row)}
                        disabled={liveLoadingSet.has(row.id)}
                        className="rounded p-1 text-text-secondary transition-colors hover:text-brand-primary disabled:opacity-50"
                        title={t("positions.detail.refreshLive")}
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", liveLoadingSet.has(row.id) && "animate-spin")} />
                      </button>
                      <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary opacity-40" />
                    </div>
                  </div>

                  {/* time + term */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <RelativeTime timestampMs={row.timestamp * 1000} className="text-[11px]" />
                    <span className="text-[11px] text-text-secondary">·</span>
                    <Badge className={termClass(row.term)}>
                      {t(`positionsEnum.term.${row.term}`)}
                    </Badge>
                  </div>

                  {/* metrics grid */}
                  <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 text-sm">
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.avgPrice")}
                      </dt>
                      <dd className="mt-0.5 tabular-nums font-medium text-text-primary">{formatPrice(row.avg_price)}</dd>
                      {row.stop_loss != null ? (
                        <dd className="tabular-nums text-xs text-red-500">{formatPrice(row.stop_loss)}</dd>
                      ) : (
                        <dd className="text-xs text-text-secondary">—</dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.size")}
                      </dt>
                      <dd className="mt-0.5 tabular-nums text-text-secondary">{row.size.toFixed(4)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        {t("positions.columns.capacity")}
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5">
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
                        <span className="tabular-nums text-[10px] text-text-secondary">
                          {row.capacity.toFixed(0)}%
                        </span>
                      </dd>
                    </div>
                    {(() => {
                      const live = liveMap.get(row.id);
                      if (!live) return null;
                      return (
                        <>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                              {t("positions.columns.currentPrice")}
                            </dt>
                            <dd className="mt-0.5 tabular-nums font-medium text-text-primary">
                              {live.price != null ? formatPrice(live.price) : "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                              {t("positions.columns.currentPnl")}
                            </dt>
                            <dd className={cn(
                              "mt-0.5 tabular-nums font-medium",
                              live.pnl == null ? "text-text-secondary"
                                : live.pnl > 0 ? "text-green-500"
                                : live.pnl < 0 ? "text-red-500"
                                : "text-text-secondary",
                            )}>
                              {live.pnl == null ? "—" : `${live.pnl > 0 ? "+" : ""}${formatPrice(live.pnl)}%`}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                              {t("positions.columns.positionReturn")}
                            </dt>
                            <dd className={cn(
                              "mt-0.5 tabular-nums font-medium",
                              live.positionReturn == null ? "text-text-secondary"
                                : live.positionReturn > 0 ? "text-green-500"
                                : live.positionReturn < 0 ? "text-red-500"
                                : "text-text-secondary",
                            )}>
                              {live.positionReturn == null ? "—" : `${live.positionReturn > 0 ? "+" : ""}${formatPrice(live.positionReturn)}%`}
                            </dd>
                          </div>
                          {row.stop_loss != null && live.price != null && row.avg_price !== 0 && (() => {
                            const dist = (Math.abs(live.price - row.stop_loss) / row.avg_price) * 100;
                            const cls = dist > 5 ? "text-green-500" : dist >= 2 ? "text-amber-500" : "text-red-500";
                            return (
                              <div>
                                <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                                  {t("positions.columns.distToStop")}
                                </dt>
                                <dd className={cn("mt-0.5 tabular-nums font-semibold", cls)}>
                                  {dist.toFixed(2)}%
                                </dd>
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
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
