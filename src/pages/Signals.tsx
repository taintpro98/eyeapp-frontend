import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Lock, RefreshCw } from "lucide-react";
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

const PAGE_SIZE = 15;

function toSignalRow(s: Signal) {
  return {
    id: s.id,
    symbol: s.symbol,
    type: s.side === "buy" ? "Buy" : "Sell",
    quantity: s.quantity,
    price: s.price,
    timestamp: s.timestamp * 1000,
  };
}

type SignalRow = ReturnType<typeof toSignalRow>;

export function SignalsPage() {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const accessToken = useAuthStore((s) => s.accessToken);

  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const marketId = (selectedMarket === "crypto" ? 1 : 2) as 1 | 2;
  const [signals, setSignals] = useState<Signal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [symbolInput, setSymbolInput] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(
    async (p: number, symbol: string) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const res = await fetchSignals(
          {
            market_id: marketId,
            limit: PAGE_SIZE,
            offset: p * PAGE_SIZE,
            symbol: symbol || undefined,
          },
          accessToken,
        );
        setSignals(res.items);
        setTotal(res.total);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    },
    [accessToken, marketId],
  );

  // Reset to first page when market changes
  useEffect(() => {
    setPage(0);
    setSignals([]);
  }, [marketId]);

  useEffect(() => {
    load(page, symbolFilter);
  }, [load, page, symbolFilter]);

  const handleSymbolChange = (value: string) => {
    setSymbolInput(value);
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => {
      setPage(0);
      setSymbolFilter(value.trim());
    }, 400);
  };

  const handleRefresh = useCallback(async () => {
    if (!accessToken || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetchSignals(
        {
          market_id: marketId,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          symbol: symbolFilter || undefined,
        },
        accessToken,
      );
      setSignals(res.items);
      setTotal(res.total);
    } catch {
      // keep existing data on error
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken, marketId, page, symbolFilter, isRefreshing]);

  const rows = useMemo(() => signals.map(toSignalRow), [signals]);

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
        key: "quantity",
        header: t("signals.columns.quantity", { defaultValue: "Tỷ trọng" }),
        render: (row: SignalRow) => (
          <span className="tabular-nums">{row.quantity.toFixed(2)}%</span>
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
            value={symbolInput}
            onChange={(e) => handleSymbolChange(e.target.value)}
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
              renderMobileCard={(row) => (
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
                        {t("signals.columns.quantity", { defaultValue: "Tỷ trọng" })}
                      </dt>
                      <dd className="mt-0.5 font-medium tabular-nums text-text-primary">
                        {row.quantity.toFixed(2)}%
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
              )}
            />

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-sm text-text-secondary">
                {total} {t("signals.total", { defaultValue: "total" })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-text-secondary">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
