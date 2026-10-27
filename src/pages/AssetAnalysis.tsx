import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import { Search, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useMarket } from "@/hooks/useMarket";
import { useMarketId } from "@/hooks/useMarketId";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/RelativeTime";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { SignalBadge, SignalRow, SignalSourceTag } from "@/components/SignalRow";
import { SIGNAL_BORDER_CLASS } from "@/lib/signalColors";
import { FaSummaryBlock } from "@/components/fundamental/FaSummaryCard";
import { useFaOverview } from "@/hooks/useFaOverview";
import { fetchDailyQuote } from "@/api/ta";
import { useQuery } from "@tanstack/react-query";
import { ChartWorkspace, TechnicalSignalsPanel } from "@/components/technical/TechnicalPanel";
import { VN_STOCK_MARKET_ID } from "@/api/fa";
import { fetchSignals } from "@/api/signals";
import { fetchPositions } from "@/api/positions";
import { fetchAnalysis } from "@/api/analysis";
import { cn } from "@/lib/utils";
import type { Signal } from "@/api/signals";
import type { Position } from "@/api/positions";
import type { AnalysisResult, TrendData } from "@/api/analysis";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TAB_TRIGGER =
  "relative -mb-px border-b-2 border-transparent px-1 pb-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary " +
  "data-[state=active]:border-brand-primary data-[state=active]:text-text-primary dark:data-[state=active]:border-brand-light";

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className={cn("mt-0.5 font-medium tabular-nums text-text-primary", className)}>{value}</dd>
    </div>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

function statusClass(status: string) {
  switch (status) {
    case "running":    return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "opening":    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "opened":     return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "closing":    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
    case "cancelling": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    default:           return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function termClass(term: string) {
  return term === "short_term"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
    : "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-light";
}

function ratingClass(rating: string) {
  if (rating === "A" || rating === "B+") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (rating === "B" || rating === "C")  return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
}

function trendIcon(trend: string) {
  if (trend === "uptrend")   return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "downtrend") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-text-secondary" />;
}

function signalTextClass(signal: string) {
  if (signal === "bullish") return "text-green-500";
  if (signal === "bearish") return "text-red-500";
  return "text-text-secondary";
}

// ---------------------------------------------------------------------------
// Trend Row
// ---------------------------------------------------------------------------

function TrendRow({ label, data }: { label: string; data: TrendData }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-warm/30 px-3 py-2 text-sm">
      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</span>
      <span className="flex items-center gap-1.5 font-semibold text-text-primary">
        {trendIcon(data.trend)}
        {t(`assetAnalysis.trendEnum.${data.trend}`, data.trend)}
      </span>
      <span className="ml-auto text-right text-xs text-text-secondary">
        <span className={cn("font-medium", signalTextClass(data.signal))}>
          {t(`assetAnalysis.signalEnum.${data.signal}`, data.signal)}
        </span>
        {" · "}
        <span className="hidden sm:inline">{t("assetAnalysis.strength")} </span>
        {t(`assetAnalysis.strengthEnum.${data.strength}`, data.strength).toLowerCase()}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AssetAnalysisPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { symbol: symbolParam } = useParams<{ symbol?: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const handleApiError = useApiErrorHandler();
  const market = useMarket();
  const marketId = useMarketId();

  const [input, setInput]   = useState(symbolParam?.toUpperCase() ?? "");
  const [symbol, setSymbol] = useState<string | null>(symbolParam?.toUpperCase() ?? null);

  const [analysis, setAnalysis]             = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError]   = useState(false);

  const [signals, setSignals]               = useState<Signal[]>([]);
  const [signalsTotal, setSignalsTotal]     = useState(0);
  const [signalsPage, setSignalsPage]       = useState(0);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsDenied, setSignalsDenied]   = useState(false);

  const SIGNALS_PAGE_SIZE = 10;

  const [positions, setPositions]               = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsDenied, setPositionsDenied]   = useState(false);

  const loadAnalysis = useCallback(
    async (sym: string) => {
      setAnalysisLoading(true);
      setAnalysisError(false);
      setAnalysis(null);
      try {
        const res = await fetchAnalysis(marketId as 1 | 2, sym);
        setAnalysis(res);
      } catch {
        setAnalysisError(true);
      } finally {
        setAnalysisLoading(false);
      }
    },
    [marketId],
  );

  const loadSignals = useCallback(
    async (sym: string, page: number) => {
      if (!accessToken) return;
      setSignalsLoading(true);
      setSignalsDenied(false);
      try {
        const res = await fetchSignals(
          { market_id: marketId, limit: SIGNALS_PAGE_SIZE, offset: page * SIGNALS_PAGE_SIZE, symbol: sym },
          accessToken,
        );
        setSignals(res.items);
        setSignalsTotal(res.total);
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "feature_required" || code === "subscription_required") setSignalsDenied(true);
        handleApiError(err);
      } finally {
        setSignalsLoading(false);
      }
    },
    [accessToken, marketId, handleApiError],
  );

  const loadPositions = useCallback(
    async (sym: string) => {
      if (!accessToken) return;
      setPositionsLoading(true);
      setPositionsDenied(false);
      try {
        const res = await fetchPositions({ market_id: marketId, limit: 10, symbol: sym, is_active: true }, accessToken);
        setPositions(res.items);
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "feature_required" || code === "subscription_required") setPositionsDenied(true);
        handleApiError(err);
      } finally {
        setPositionsLoading(false);
      }
    },
    [accessToken, marketId, handleApiError],
  );

  useEffect(() => {
    if (!symbol) return;
    loadAnalysis(symbol);
    loadPositions(symbol);
  }, [symbol, loadAnalysis, loadPositions]);

  useEffect(() => {
    if (!symbol) return;
    loadSignals(symbol, signalsPage);
  }, [symbol, signalsPage, loadSignals]);

  useEffect(() => {
    const upper = symbolParam?.toUpperCase() ?? null;
    setSymbol(upper);
    setInput(upper ?? "");
    setSignalsPage(0);
  }, [symbolParam]);

  // Summary card extras for VN stocks: exchange/name from FA, day change and volume from the chart feed.
  const isVnStock = marketId === VN_STOCK_MARKET_ID;
  const { data: faOverview } = useFaOverview(symbol ?? "", isVnStock && !!symbol);
  const { data: quote } = useQuery({
    queryKey: ["ta", "daily-quote", symbol],
    queryFn: () => fetchDailyQuote(symbol!),
    enabled: isVnStock && !!symbol,
    staleTime: 60 * 1000,
    retry: false,
  });
  // eyebroker quotes VN prices in thousands of VND (57.6 = 57,600 ₫); match that when falling back to the feed.
  const price = analysis?.live_price ?? (quote ? quote.close / 1000 : null);
  const volumeFmt = new Intl.NumberFormat(i18n.language === "en" ? "en" : "vi", { notation: "compact", maximumFractionDigits: 1 });

  // Signal tabs (ALumiEye algorithm | common indicators), kept in the URL so reloads and shared links land on the same tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "technical" ? "technical" : "algo";
  const changeTab = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "technical") params.set("tab", next);
    else params.delete("tab");
    setSearchParams(params, { replace: true });
  };

  const handleSearch = () => {
    const q = input.trim().toUpperCase();
    if (!q) return;
    navigate(`/app/${market}/analysis/${q}${tab === "technical" ? "?tab=technical" : ""}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("assetAnalysis.title")} subtitle={t("assetAnalysis.subtitle")}>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder={t("assetAnalysis.searchPlaceholder")}
              className="pl-9"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="shrink-0">
            {t("assetAnalysis.searchButton")}
          </Button>
        </div>
      </PageHeader>

      {!symbol ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Search className="h-10 w-10 text-text-secondary opacity-40" />
          <p className="text-sm text-text-secondary">{t("assetAnalysis.emptyState")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary: ticker & price | trend | FA score — one card instead of three */}
          <div
            className={cn(
              "grid gap-5 rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:p-5 lg:gap-0 lg:divide-x lg:divide-surface-border",
              isVnStock
                ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]"
                : "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.4fr)]",
            )}
          >
            {/* Ticker & price */}
            <div className="min-w-0 lg:pr-5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-text-primary">{symbol}</h2>
                {faOverview?.exchange && (
                  <span className="rounded bg-surface-border/50 px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                    {faOverview.exchange}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-text-secondary">
                {analysis?.name ?? faOverview?.companyName ?? (analysisLoading ? t("assetAnalysis.trendAnalysisLoading") : "")}
              </p>
              {price != null && (
                <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-2xl font-bold tabular-nums text-text-primary">{price.toLocaleString()}</span>
                  {quote && (
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        quote.change > 0 ? "text-green-500" : quote.change < 0 ? "text-red-500" : "text-text-secondary",
                      )}
                    >
                      {quote.change > 0 ? "+" : ""}
                      {quote.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
              )}
              <p className="mt-0.5 text-xs text-text-secondary">
                {t("assetAnalysis.livePrice")}
                {quote && ` · ${t("assetAnalysis.volume")} ${volumeFmt.format(quote.volume)}`}
              </p>
            </div>

            {/* Trend */}
            <div className="min-w-0 lg:px-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("assetAnalysis.trendTitle")}</p>
                {analysis && (
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", ratingClass(analysis.rating))}>
                    {t("assetAnalysis.rating")} {analysis.rating}
                  </span>
                )}
              </div>
              {analysisLoading ? (
                <div className="mt-3 h-20 animate-pulse rounded bg-surface-border/50" />
              ) : analysisError || !analysis ? (
                <p className="mt-3 text-sm text-text-secondary">{t("assetAnalysis.trendAnalysisError")}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  <TrendRow label={t("assetAnalysis.midTerm")} data={analysis.mid_term} />
                  <TrendRow label={t("assetAnalysis.shortTerm")} data={analysis.short_term} />
                </div>
              )}
            </div>

            {/* Fundamental score (VN stocks only — data from ta-agent) */}
            {isVnStock && <FaSummaryBlock ticker={symbol} className="min-w-0 lg:pl-5" />}
          </div>

          {/* Chart + Lumi: one instance above the signal tabs. VN stocks only. */}
          {marketId === VN_STOCK_MARKET_ID && <ChartWorkspace ticker={symbol} />}

          {/* Signals right under the chart: ALumiEye's own algorithm vs common indicator rules */}
          <Tabs.Root value={tab} onValueChange={changeTab} className="space-y-4">
            <Tabs.List className="flex gap-6 border-b border-surface-border" aria-label={t("assetAnalysis.tabs.label")}>
              <Tabs.Trigger value="algo" className={TAB_TRIGGER}>
                {t("assetAnalysis.tabs.algo")}
              </Tabs.Trigger>
              <Tabs.Trigger value="technical" className={TAB_TRIGGER}>
                {t("assetAnalysis.tabs.technical")}
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="algo" className="focus:outline-none">
              {/* Signals */}
              <SectionCard
                title={t("assetAnalysis.signals")}
                subtitle={t("assetAnalysis.signalsSubtitle", { symbol })}
                headerAction={<SignalSourceTag source="proprietary" />}
                className="p-3 sm:p-4 md:p-6"
              >
                {signalsLoading ? (
                  <p className="py-6 text-center text-sm text-text-secondary">{t("common.loading")}</p>
                ) : signalsDenied ? (
                  <AccessDeniedState titleKey="signals.accessDenied" hintKey="signals.accessDeniedHint" />
                ) : signals.length === 0 ? (
                  <p className="py-6 text-center text-sm text-text-secondary">
                    {t("assetAnalysis.noSignals", { symbol })}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {signals.map((s) => (
                        <SignalRow
                          key={s.id}
                          tone={s.side}
                          label={s.side === "buy" ? t("assetAnalysis.buy") : t("assetAnalysis.sell")}
                          meta={<RelativeTime timestampMs={s.timestamp * 1000} />}
                        >
                          <span className="tabular-nums text-sm font-medium text-text-primary">
                            {s.price.toLocaleString()}
                          </span>
                          <span className={cn("tabular-nums text-sm font-semibold",
                            s.quantity >= 20 ? "text-red-500"
                            : s.quantity >= 10 ? "text-orange-500"
                            : "text-blue-500"
                          )}>
                            {s.quantity.toFixed(2)}%
                          </span>
                        </SignalRow>
                      ))}
                    </div>
                    {signalsTotal > SIGNALS_PAGE_SIZE && (
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <p className="text-sm text-text-secondary">{t("assetAnalysis.signalsTotal", { count: signalsTotal })}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={signalsPage === 0}
                            onClick={() => setSignalsPage((p) => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-text-secondary">
                            {signalsPage + 1} / {Math.ceil(signalsTotal / SIGNALS_PAGE_SIZE)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={signalsPage >= Math.ceil(signalsTotal / SIGNALS_PAGE_SIZE) - 1}
                            onClick={() => setSignalsPage((p) => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </SectionCard>
            </Tabs.Content>

            <Tabs.Content value="technical" className="focus:outline-none">
              {tab === "technical" && <TechnicalSignalsPanel ticker={symbol} supported={marketId === VN_STOCK_MARKET_ID} />}
            </Tabs.Content>
          </Tabs.Root>

          {/* Active Positions */}
          <SectionCard
            title={t("assetAnalysis.positions")}
            subtitle={t("assetAnalysis.positionsSubtitle", { symbol })}
            className="p-3 sm:p-4 md:p-6"
          >
            {positionsLoading ? (
              <p className="py-6 text-center text-sm text-text-secondary">{t("common.loading")}</p>
            ) : positionsDenied ? (
              <AccessDeniedState titleKey="positions.accessDenied" hintKey="positions.accessDeniedHint" />
            ) : positions.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-secondary">
                {t("assetAnalysis.noPositions", { symbol })}
              </p>
            ) : (
              <div className="space-y-3">
                {positions.map((p) => (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/app/${market}/positions/${p.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/app/${market}/positions/${p.id}`)}
                    className={cn(
                      "cursor-pointer rounded-xl border border-surface-border bg-surface-card p-4 shadow-card transition-colors hover:bg-surface-warm/40 active:scale-[0.99]",
                      "border-l-4",
                      SIGNAL_BORDER_CLASS[p.side],
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SignalBadge tone={p.side}>
                          {p.side === "buy" ? t("assetAnalysis.buy") : t("assetAnalysis.sell")}
                        </SignalBadge>
                        <Badge className={statusClass(p.status)}>{t(`positionsEnum.status.${p.status}`)}</Badge>
                        <Badge className={termClass(p.term)}>
                          {p.term === "short_term" ? t("assetAnalysis.shortTerm") : t("assetAnalysis.midTerm")}
                        </Badge>
                      </div>
                      <RelativeTime timestampMs={p.timestamp * 1000} className="text-xs" />
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
                      <Stat label={t("assetAnalysis.avgPrice")} value={p.avg_price.toLocaleString()} />
                      <Stat
                        label={t("assetAnalysis.stopLoss")}
                        value={p.stop_loss != null ? p.stop_loss.toLocaleString() : "—"}
                        className={p.stop_loss != null ? "text-red-500" : undefined}
                      />
                      <Stat label={t("assetAnalysis.size")} value={`${p.size.toFixed(2)}%`} />
                      <div className="col-span-3">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                          {t("assetAnalysis.capacity")} ({p.capacity}%)
                        </dt>
                        <dd className="mt-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
                            <div
                              className={cn("h-full rounded-full", p.side === "buy" ? "bg-green-500" : "bg-red-500")}
                              style={{ width: `${Math.min(100, p.capacity > 0 ? (p.size / p.capacity) * 100 : 0)}%` }}
                            />
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
