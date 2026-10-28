import { useNavigate } from "react-router-dom";
import { useMarket } from "@/hooks/useMarket";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchUserMarkets } from "@/api/markets";
import { fetchSignals } from "@/api/signals";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MarketKpiRow, MarketOverviewCard } from "@/components/MarketSnapshot";
import { useMarketOverview } from "@/hooks/useMarketOverview";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { PlanSummaryCard } from "@/components/PlanSummaryCard";
import { FaDashboardWidget } from "@/components/fundamental/FaDashboardWidget";
import { VN_STOCK_MARKET_ID } from "@/api/fa";
import { useMarketId } from "@/hooks/useMarketId";
import { SignalRow, SignalSourceTag } from "@/components/SignalRow";
import { SymbolLink } from "@/components/SymbolLink";
import { RelativeTime } from "@/components/RelativeTime";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const RECENT_SIGNALS_LIMIT = 10;

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedMarket = useMarket();
  const marketId = useMarketId();
  const { data: userMarkets = [] } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    data: signals = [],
    isLoading: signalsLoading,
    error: signalsError,
  } = useQuery({
    queryKey: ["signals", marketId, "recent"],
    queryFn: () =>
      fetchSignals(
        { market_id: marketId, limit: RECENT_SIGNALS_LIMIT },
        accessToken!,
      ),
    select: (res) => res.items,
    enabled: !!accessToken,
    retry: false,
  });
  const signalsCode = (signalsError as { code?: string } | null)?.code;
  const signalsDenied =
    signalsCode === "feature_required" ||
    signalsCode === "subscription_required";
  const displayName = useAuthStore((s) => s.user?.display_name) || t("common.trader");

  const { data: marketOverview } = useMarketOverview(marketId);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("dashboard.welcome", { name: displayName })}
        subtitle={t("dashboard.subtitle")}
      />

      <MarketKpiRow marketId={marketId} />

      <div className="grid gap-6 xl:grid-cols-3">
        <MarketOverviewCard marketId={marketId} className="xl:col-span-2" />
        <PlanSummaryCard
          market={userMarkets.find((m) => m.code === selectedMarket)}
          className={marketOverview ? undefined : "xl:col-span-3"}
        />
      </div>

      {marketId === VN_STOCK_MARKET_ID && <FaDashboardWidget />}

      <SectionCard
        title={t("dashboard.recentSignals")}
        subtitle={t("dashboard.recentSignalsSubtitle")}
        headerAction={<SignalSourceTag source="proprietary" />}
      >
        {signalsLoading ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            {t("common.loading")}
          </p>
        ) : signalsDenied ? (
          <AccessDeniedState
            titleKey="signals.accessDenied"
            hintKey="signals.accessDeniedHint"
          />
        ) : signals.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            {t("signals.noSignals")}
          </p>
        ) : (
          <div className="space-y-2">
            {signals.map((s) => (
              <SignalRow
                key={s.id}
                tone={s.side}
                label={
                  s.side === "buy"
                    ? t("assetAnalysis.buy")
                    : t("assetAnalysis.sell")
                }
                meta={<RelativeTime timestampMs={s.timestamp * 1000} />}
              >
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <SymbolLink
                    symbol={s.symbol}
                    className="font-bold text-text-primary"
                  />
                  <div className="flex items-baseline gap-3">
                    <span className="tabular-nums text-sm font-medium text-text-primary">
                      {s.price.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "tabular-nums text-sm font-semibold",
                        s.quantity >= 20
                          ? "text-red-500"
                          : s.quantity >= 10
                            ? "text-orange-500"
                            : "text-blue-500",
                      )}
                    >
                      {s.quantity.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </SignalRow>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => navigate(`/app/${selectedMarket}/signals`)}
        >
          {t("dashboard.viewAllSignals")}{" "}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </SectionCard>
    </div>
  );
}
