import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchOrders } from "@/api/orders";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/relativeTime";
import type { Order } from "@/api/orders";

const PAGE_SIZE = Number(import.meta.env.VITE_ORDERS_PAGE_SIZE ?? 20);

const ORDER_TYPE_STRENGTH: Record<string, string> = {
  market: "Strong",
  limit: "Medium",
};

function toSignalRow(order: Order) {
  return {
    id: order.id,
    symbol: order.symbol,
    type: order.side === "buy" ? "Buy" : "Sell",
    strength: ORDER_TYPE_STRENGTH[order.order_type] ?? "Weak",
    confidence: Math.min(100, Math.round(order.quantity * 100)),
    timestamp: order.timestamp,
  };
}

type SignalRow = ReturnType<typeof toSignalRow>;

export function SignalsPage() {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [symbolFilter, setSymbolFilter] = useState("");
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appliedFilter, setAppliedFilter] = useState("");

  const loadOrders = useCallback(
    async (cursor?: string, symbol?: string) => {
      if (!accessToken) return;
      cursor ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await fetchOrders(
          { symbol: symbol || undefined, limit: PAGE_SIZE, cursor },
          accessToken,
        );
        setOrders((prev) => (cursor ? [...prev, ...res.data] : res.data));
        setHasMore(res.pagination.has_more);
        setNextCursor(res.pagination.next_cursor);
      } catch {
        // keep existing data on error
      } finally {
        cursor ? setLoadingMore(false) : setLoading(false);
      }
    },
    [accessToken],
  );

  // Initial load + re-fetch when filter changes
  useEffect(() => {
    setOrders([]);
    setNextCursor(undefined);
    loadOrders(undefined, appliedFilter);
  }, [loadOrders, appliedFilter]);

  // Debounce symbol filter
  const handleFilterChange = (value: string) => {
    setSymbolFilter(value);
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => setAppliedFilter(value), 400);
  };

  const rows = useMemo(() => orders.map(toSignalRow), [orders]);

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
          <Button variant="outline" className="w-full shrink-0 sm:w-auto">
            {t("signals.filters")}
          </Button>
        </div>
      </PageHeader>

      <SectionCard
        title={t("signals.activeSignals")}
        subtitle={t("signals.activeSignalsSubtitle")}
        className="p-3 sm:p-4 md:p-6"
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
              data={rows as unknown as Record<string, unknown>[]}
              renderMobileCard={(raw) => {
                const row = raw as unknown as SignalRow;
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
                  onClick={() => loadOrders(nextCursor, appliedFilter)}
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
