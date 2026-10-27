import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronLeft, RefreshCw, SearchX } from "lucide-react";
import {
  fetchScoreHistory,
  fetchTickerFinancials,
  fetchTickerOverview,
  fetchTickerRatios,
  isEmptyOverview,
} from "@/api/fa";
import { taAgentRetry } from "@/lib/taAgent";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { FaErrorState } from "@/components/fundamental/FaErrorState";
import { FaTickerHeader } from "@/components/fundamental/FaTickerHeader";
import { FinancialChartsSection } from "@/components/fundamental/FinancialChartsSection";
import { InsightsCards } from "@/components/fundamental/InsightsCards";
import { KeyMetricsGrid } from "@/components/fundamental/KeyMetricsGrid";
import { ScoreBreakdownCard } from "@/components/fundamental/ScoreBreakdownCard";
import { ScoreHistoryChart } from "@/components/fundamental/ScoreHistoryChart";
import { TickerSearch } from "@/components/fundamental/TickerSearch";
import { FundamentalMarketGuard } from "@/components/fundamental/FundamentalMarketGuard";
import { useMarket } from "@/hooks/useMarket";
import { mergeSeries, pivotFinancials } from "@/lib/fa/pivot";
import { cn } from "@/lib/utils";

/** FA data changes per reporting quarter; no need to refetch on every focus. */
const STALE_MS = 5 * 60 * 1000;

function TickerDetail({ ticker }: { ticker: string }) {
  const { t } = useTranslation();
  const market = useMarket();

  const overviewQ = useQuery({
    queryKey: ["fa", "overview", ticker],
    queryFn: () => fetchTickerOverview(ticker),
    staleTime: STALE_MS,
    retry: taAgentRetry,
  });
  const ratiosQ = useQuery({
    queryKey: ["fa", "ratios", ticker],
    queryFn: () => fetchTickerRatios(ticker),
    staleTime: STALE_MS,
    retry: taAgentRetry,
  });
  const quarterQ = useQuery({
    queryKey: ["fa", "financials", ticker, "QUARTER"],
    queryFn: () => fetchTickerFinancials(ticker, "QUARTER"),
    staleTime: STALE_MS,
    retry: taAgentRetry,
  });
  const pitQ = useQuery({
    queryKey: ["fa", "financials", ticker, "POINT_IN_TIME"],
    queryFn: () => fetchTickerFinancials(ticker, "POINT_IN_TIME"),
    staleTime: STALE_MS,
    retry: taAgentRetry,
  });
  const historyQ = useQuery({
    queryKey: ["fa", "score-history", ticker],
    queryFn: () => fetchScoreHistory(ticker),
    staleTime: STALE_MS,
    retry: taAgentRetry,
  });

  const rows = useMemo(
    () => pivotFinancials(mergeSeries(quarterQ.data?.series, pitQ.data?.series)),
    [quarterQ.data, pitQ.data],
  );

  const queries = [overviewQ, ratiosQ, quarterQ, pitQ, historyQ];
  const refetchAll = () => queries.forEach((q) => q.refetch());
  const isFetching = queries.some((q) => q.isFetching);
  const financialsLoading = quarterQ.isLoading || pitQ.isLoading;

  const backLink = (
    <Link
      to={`/app/${market}/fundamental`}
      className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      <ChevronLeft className="h-4 w-4" />
      {t("fa.ticker.back")}
    </Link>
  );

  if (overviewQ.isError) {
    return (
      <div className="space-y-4">
        {backLink}
        <FaErrorState error={overviewQ.error} onRetry={refetchAll} />
      </div>
    );
  }

  if (isEmptyOverview(overviewQ.data)) {
    return (
      <div className="space-y-4">
        {backLink}
        <EmptyState
          icon={SearchX}
          title={t("fa.ticker.notFound.title", { ticker })}
          description={t("fa.ticker.notFound.description")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        {backLink}
        <Button variant="outline" size="sm" onClick={refetchAll} disabled={isFetching} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          <span className="hidden sm:inline">{t("fa.common.refresh")}</span>
        </Button>
      </div>

      <FaTickerHeader ticker={ticker} overview={overviewQ.data} isLoading={overviewQ.isLoading} />

      <KeyMetricsGrid
        overview={overviewQ.data}
        ratios={ratiosQ.data?.ratios}
        rows={rows}
        isLoading={overviewQ.isLoading || ratiosQ.isLoading}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ScoreBreakdownCard overview={overviewQ.data} isLoading={overviewQ.isLoading} />
        </div>
        <div className="lg:col-span-3">
          <ScoreHistoryChart history={historyQ.data?.history} isLoading={historyQ.isLoading} />
        </div>
      </div>

      <InsightsCards
        highlights={overviewQ.data?.highlights}
        warnings={overviewQ.data?.warnings}
        isLoading={overviewQ.isLoading}
      />

      {quarterQ.isError ? (
        <FaErrorState error={quarterQ.error} onRetry={() => quarterQ.refetch()} />
      ) : (
        <FinancialChartsSection rows={rows} isLoading={financialsLoading} />
      )}

      <p className="text-center text-xs text-text-secondary">{t("fa.disclaimer")}</p>
    </div>
  );
}

export function FundamentalTickerPage() {
  const { t } = useTranslation();
  const { ticker: raw } = useParams<{ ticker: string }>();
  const ticker = (raw ?? "").trim().toUpperCase();

  return (
    <FundamentalMarketGuard>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">{t("fa.ticker.title")}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t("fa.ticker.subtitle")}</p>
          </div>
          <TickerSearch />
        </div>
        {/* key resets per-ticker state (chart toggles, range) when navigating between tickers */}
        <TickerDetail key={ticker} ticker={ticker} />
      </div>
    </FundamentalMarketGuard>
  );
}
