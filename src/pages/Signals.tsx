import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchSignals } from "@/api/signals";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/relativeTime";
import type { Signal } from "@/api/signals";

const PAGE_SIZE = Number(import.meta.env.VITE_ORDERS_PAGE_SIZE ?? 20);

const ORDER_TYPE_STRENGTH: Record<string, string> = {
  market: "Strong",
  limit: "Medium",
};

function toSignalRow(order: Signal) {
  return {
    id: order.id,
    symbol: order.symbol,
    type: order.side === "buy" ? "Buy" : "Sell",
    strength: ORDER_TYPE_STRENGTH[order.signal_type] ?? "Weak",
    confidence: Math.round(order.confidence * 100),
    price: order.price,
    timestamp: order.timestamp * 1000,
  };
}

type SignalRow = ReturnType<typeof toSignalRow>;

export function SignalsPage() {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const accessToken = useAuthStore((s) => s.accessToken);

  const marketId = 2 as const;
  const [orders, setOrders] = useState<Signal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [symbolFilter, setSymbolFilter] = useState("");
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(
    async (nextOffset: number, market: 1 | 2) => {
      if (!accessToken) return;
      nextOffset === 0 ? setLoading(true) : setLoadingMore(true);
      try {
        const res = await fetchSignals(
          { market_id: market, limit: PAGE_SIZE, offset: nextOffset },
          accessToken,
        );
        setOrders((prev) => (nextOffset === 0 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setOffset(nextOffset + res.items.length);
      } catch {
        // keep existing data on error
      } finally {
        nextOffset === 0 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [accessToken],
  );

  const handleRefresh = useCallback(async () => {
    if (!accessToken || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetchSignals(
        { market_id: marketId, limit: PAGE_SIZE, offset: 0 },
        accessToken,
      );
      setOrders(res.items);
      setTotal(res.total);
      setOffset(res.items.length);
    } catch {
      // keep existing data on error
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken, marketId, isRefreshing]);

  useEffect(() => {
    setOrders([]);
    setOffset(0);
    loadOrders(0, marketId);
  }, [loadOrders, marketId]);


  // Debounce symbol filter (client-side only)
  const handleFilterChange = (value: string) => {
    setSymbolFilter(value);
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => {}, 400);
  };

  const hasMore = offset < total;

  const rows = useMemo(
    () =>
      orders
        .filter((o) => !symbolFilter || o.symbol.toLowerCase().includes(symbolFilter.toLowerCase()))
        .map(toSignalRow),
    [orders, symbolFilter],
  );

  const columns = useMemo(
    () => [
      { key: "symbol", header: t("signals.columns.symbol") },
      {
        key: "type",
        header: t("signals.columns.type"),
        render: (row: SignalRow) =>
          t(`signalsEnum.type.${row.type}` as never),
      },
      {
        key: "strength",
        header: t("signals.columns.strength"),
        render: (row: SignalRow) =>
          t(`signalsEnum.strength.${row.strength}` as never),
      },
      {
        key: "confidence",
        header: t("signals.columns.confidence"),
        render: (row: SignalRow) => (
          <span
            className={
              row.confidence >= 80
                ? "font-medium text-green-600 dark:text-green-400"
                : ""
            }
          >
            {row.confidence}%
          </span>
        ),
      },
      {
        key: "price",
        header: t("signals.columns.price"),
        render: (row: SignalRow) => (
          <span className="tabular-nums">{row.price.toLocaleString()}</span>
        ),
      },
      {
        key: "timestamp",
        header: t("signals.columns.time"),
        render: (row: SignalRow) => (
          <span className="text-text-secondary">
            {formatRelativeTime(row.timestamp, t)}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        title={t("signals.title")}
        subtitle={t("signals.subtitle")}
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            placeholder={t("signals.filterPlaceholder")}
            className="w-full min-w-0 sm:w-48"
            value={symbolFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>
      </PageHeader>

      <SectionCard
        title={t("signals.activeSignals")}
        subtitle={t("signals.activeSignalsSubtitle")}
        className="p-3 sm:p-4 md:p-6"
        headerAction={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{t("common.refresh")}</span>
          </Button>
        }
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("common.loading")}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("signals.noSignals", { defaultValue: "No signals found." })}
          </p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={rows}
              renderMobileCard={(row) => {
                return (
                  <div
                    className={cn(
                      "rounded-lg border border-surface-border bg-surface-card p-3 sm:p-4",
                      "dark:bg-zinc-900/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-lg font-semibold text-text-primary">
                        {row.symbol}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("signals.mobile.type")}
                        </dt>
                        <dd className="mt-0.5 font-medium text-text-primary">
                          {t(`signalsEnum.type.${row.type}` as never)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("signals.mobile.strength")}
                        </dt>
                        <dd className="mt-0.5 font-medium text-text-primary">
                          {t(`signalsEnum.strength.${row.strength}` as never)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("signals.mobile.confidence")}
                        </dt>
                        <dd
                          className={cn(
                            "mt-0.5 font-medium tabular-nums",
                            row.confidence >= 80 &&
                              "text-green-600 dark:text-green-400",
                          )}
                        >
                          {row.confidence}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("signals.columns.price")}
                        </dt>
                        <dd className="mt-0.5 tabular-nums text-text-primary">
                          {row.price.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("signals.mobile.time")}
                        </dt>
                        <dd className="mt-0.5 text-text-primary">
                          {formatRelativeTime(row.timestamp, t)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              }}
            />
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  disabled={loadingMore}
                  onClick={() => loadOrders(offset, marketId)}
                >
                  {loadingMore ? t("common.loading") : t("orders.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard
        title={t("signals.advancedAnalytics")}
        subtitle={t("signals.advancedAnalyticsSubtitle")}
        className="relative overflow-hidden p-3 sm:p-4 md:p-6"
      >
        <div className="pointer-events-none select-none blur-sm">
          <div className="h-48 rounded-lg border border-surface-border bg-surface-warm/50 p-4">
            <p className="text-text-secondary">
              {t("signals.advancedAnalyticsBlurb")}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <Button
            className="w-full max-w-sm sm:w-auto"
            onClick={() =>
              openUpgradeModal({
                featureKey: "advancedAnalytics",
                reasonKey: "proPlan",
              })
            }
          >
            <Lock className="mr-2 h-4 w-4" />
            {t("signals.unlockAdvancedAnalytics")}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
