import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useMarketId } from "@/hooks/useMarketId";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { Button } from "@/components/ui/button";
import { PortfolioAllocation } from "@/components/portfolio/PortfolioAllocation";
import { fetchPortfolio } from "@/api/portfolio";
import type { PortfolioResponse } from "@/api/portfolio";
import type { PortfolioSlice } from "@/data/mockPortfolio";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#3b82f6",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
];

const CASH_COLOR = "#22c55e";
const POLL_INTERVAL = 30_000;

function toSlices(data: PortfolioResponse, marketId: 1 | 2): PortfolioSlice[] {
  const priceScale = marketId === 2 ? 1000 : 1;
  const slices: PortfolioSlice[] = data.holdings.map((h, i) => ({
    key: String(h.position_id),
    label: h.symbol,
    color: PALETTE[i % PALETTE.length],
    percent: h.weight * 100,
    entryPrice: h.avg_price * priceScale,
    currentPrice: h.current_price != null ? h.current_price * priceScale : null,
    returnPct: h.position_return,
    href: `/app/positions/${h.position_id}`,
  }));

  slices.push({
    key: "CASH",
    label: "CASH",
    color: CASH_COLOR,
    percent: data.cash_weight * 100,
    entryPrice: null,
    currentPrice: null,
    returnPct: null,
  });

  return slices;
}

function formatValue(v: number) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function PortfolioPage() {
  const { t } = useTranslation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const handleApiError = useApiErrorHandler();
  const marketId = useMarketId();

  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!accessToken) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await fetchPortfolio(marketId, accessToken);
        setPortfolio(data);
        setAccessDenied(false);
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "feature_required" || code === "subscription_required") {
          setAccessDenied(true);
        } else {
          handleApiError(err);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, marketId, handleApiError],
  );

  useEffect(() => {
    setPortfolio(null);
    setAccessDenied(false);
    load(false);

    pollingRef.current = setInterval(() => load(true), POLL_INTERVAL);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [load]);

  const slices = useMemo(
    () => (portfolio ? toSlices(portfolio, marketId) : []),
    [portfolio, marketId],
  );

  if (accessDenied) {
    return (
      <AccessDeniedState
        titleKey="positions.accessDenied"
        hintKey="positions.accessDeniedHint"
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        title={t("portfolio.title")}
        subtitle={t("portfolio.subtitle")}
      />

      {portfolio && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-card border border-surface-border bg-surface-card p-4 shadow-card">
            <p className="text-xs font-medium text-text-secondary">
              {t("portfolio.stats.totalValue")}
            </p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {formatValue(portfolio.total_portfolio_value)}
            </p>
          </div>
          <div className="rounded-card border border-surface-border bg-surface-card p-4 shadow-card">
            <p className="text-xs font-medium text-text-secondary">
              {t("portfolio.stats.cash")}
            </p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {formatValue(portfolio.cash)}
              <span className="ml-1 text-sm font-normal text-text-secondary">
                ({(portfolio.cash_weight * 100).toFixed(1)}%)
              </span>
            </p>
          </div>
          <div className="col-span-2 rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:col-span-1">
            <p className="text-xs font-medium text-text-secondary">
              {t("portfolio.stats.positions")}
            </p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {portfolio.holdings.length}
            </p>
          </div>
        </div>
      )}

      <SectionCard
        title={t("portfolio.allocation")}
        className="relative overflow-hidden border-brand-primary/10 bg-gradient-to-br from-brand-primary/[0.04] via-transparent to-brand-light/[0.03] p-3 shadow-soft sm:p-4 md:p-6 dark:from-brand-primary/[0.07] dark:to-transparent"
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing}
            aria-label={t("common.refresh")}
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </Button>
        }
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/5 blur-3xl dark:bg-brand-light/10"
          aria-hidden
        />
        <div className="relative">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-text-secondary" />
            </div>
          ) : (
            <PortfolioAllocation slices={slices} />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
