import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Lock, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useMarketId } from "@/hooks/useMarketId";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchSignals } from "@/api/signals";
import { cn } from "@/lib/utils";
import { RelativeTime } from "@/components/RelativeTime";
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
  const marketId = useMarketId();

  const fetchFn = useCallback(
    async (p: number, symbol: string) => {
      if (!accessToken) return { items: [] as Signal[], total: 0 };
      return fetchSignals(
        {
          market_id: marketId,
          limit: PAGE_SIZE,
          offset: p * PAGE_SIZE,
          symbol: symbol || undefined,
        },
        accessToken,
      );
    },
    [accessToken, marketId],
  );

  const {
    items: signals,
    total,
    loading,
    accessDenied,
    page,
    setPage,
    totalPages,
    symbolInput,
    setSymbolInput,
    isApplyMode,
    handleSearchAction: handleAction,
  } = usePaginatedList({ fetchFn, marketId, pageSize: PAGE_SIZE });

  const rows = useMemo(() => signals.map(toSignalRow), [signals]);

  const columns = useMemo(
    () => [
      {
        key: "symbol",
        header: t("signals.columns.symbol"),
        render: (row: SignalRow) => (
          <span className="font-bold text-text-primary">{row.symbol}</span>
        ),
      },
      {
        key: "type",
        header: t("signals.columns.type"),
        render: (row: SignalRow) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              row.type === "Buy"
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
            )}
          >
            {t(`signalsEnum.type.${row.type}` as never)}
          </span>
        ),
      },
      {
        key: "quantity",
        header: t("signals.columns.quantity"),
        render: (row: SignalRow) => (
          <span
            className={cn(
              "tabular-nums font-medium",
              row.quantity >= 20
                ? "text-red-500 dark:text-red-400"
                : row.quantity >= 10
                  ? "text-orange-500 dark:text-orange-400"
                  : row.quantity >= 2
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-text-secondary",
            )}
          >
            {row.quantity.toFixed(2)}%
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
          <RelativeTime timestampMs={row.timestamp} />
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
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            placeholder={t("signals.filterPlaceholder")}
            className="min-w-0 flex-1 sm:w-48 sm:flex-none"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAction()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAction}
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

      <SectionCard
        title={t("signals.activeSignals")}
        subtitle={t("signals.activeSignalsSubtitle")}
        className="p-3 sm:p-4 md:p-6"
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("common.loading")}
          </p>
        ) : accessDenied ? (
          <AccessDeniedState titleKey="signals.accessDenied" hintKey="signals.accessDeniedHint" />
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
                    "rounded-lg border-l-4 border-surface-border bg-surface-card p-3 sm:p-4",
                    "dark:bg-zinc-900/40",
                    row.type === "Buy"
                      ? "border-l-green-500"
                      : "border-l-red-500",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg font-bold text-text-primary">
                      {row.symbol}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        row.type === "Buy"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                      )}
                    >
                      {t(`signalsEnum.type.${row.type}` as never)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("signals.columns.quantity")}
                      </dt>
                      <dd
                        className={cn(
                          "mt-0.5 font-medium tabular-nums",
                          row.quantity >= 20
                            ? "text-red-500 dark:text-red-400"
                            : row.quantity >= 10
                              ? "text-orange-500 dark:text-orange-400"
                              : row.quantity >= 2
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-text-secondary",
                        )}
                      >
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
                      <dd className="mt-0.5">
                        <RelativeTime timestampMs={row.timestamp} />
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
