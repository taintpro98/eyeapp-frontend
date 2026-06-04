import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchBootstrap } from "@/api/bootstrap";
import { fetchUserMarkets } from "@/api/markets";
import { TrendingUp, Zap, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { useAppStore } from "@/store/useAppStore";
import { mockKpis, mockSignals, mockMarketSummary } from "@/data/mockDashboard";
import { formatSignalMinutesAgo } from "@/lib/formatSignalTime";

const KPI_TITLE_KEYS = ["vnIndex", "hoseValue", "netForeign", "vn30"] as const;

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: bootstrap } = useQuery({
    queryKey: ["bootstrap"],
    queryFn: fetchBootstrap,
  });
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const { data: userMarkets = [] } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  const plan = userMarkets.find((m) => m.code === selectedMarket)?.plan ?? "free";
  const signals = mockSignals.filter((s) => s.market === selectedMarket);
  const displayName = bootstrap?.user.displayName ?? t("common.trader");

  const marketRows =
    selectedMarket === "crypto"
      ? mockMarketSummary.crypto.rows
      : mockMarketSummary.stocks.rows;
  const marketOverviewKeys =
    selectedMarket === "crypto"
      ? (["btcPrice", "ethPrice"] as const)
      : (["vnIndex", "vn30"] as const);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("dashboard.welcome", { name: displayName })}
        subtitle={t("dashboard.subtitle")}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockKpis.map((kpi, i) => (
          <StatCard
            key={i}
            title={t(`dashboard.kpiTitles.${KPI_TITLE_KEYS[i]}`)}
            value={kpi.value}
            subtitle={
              kpi.subtitle === "Session"
                ? t("dashboard.kpiSubtitles.session")
                : kpi.subtitle
            }
            trend={
              kpi.trend
                ? {
                    ...kpi.trend,
                    label: t("market.trend.24h"),
                  }
                : undefined
            }
            icon={TrendingUp}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title={t("dashboard.planSummary")}
          className="lg:col-span-2"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
                <span className="text-xl font-bold text-brand-primary">
                  {plan.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}{" "}
                    {t("dashboard.planSuffix")}
                  </span>
                  <PlanBadge
                    label={plan}
                    variant={
                      plan === "free"
                        ? "default"
                        : plan === "pro"
                          ? "pro"
                          : "premium"
                    }
                  />
                </div>
                <p className="text-sm text-text-secondary">
                  {bootstrap?.subscription.expiresAt
                    ? t("dashboard.renews", {
                        date: new Date(
                          bootstrap.subscription.expiresAt,
                        ).toLocaleDateString(
                          i18n.language.startsWith("vi") ? "vi-VN" : "en-US",
                        ),
                      })
                    : t("common.active")}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/app/billing")}>
              {t("dashboard.managePlan")}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title={t("dashboard.currentMarket")}>
          <div className="space-y-3">
            {marketRows.map((row, i) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-text-secondary">
                  {t(
                    `market.overview.${selectedMarket === "crypto" ? "crypto" : "stocks"}.${marketOverviewKeys[i]}`,
                  )}
                </span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title={t("dashboard.recentSignals")}
        subtitle={t("dashboard.recentSignalsSubtitle")}
      >
        <div className="space-y-2">
          {signals.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-surface-border p-3"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-brand-primary" />
                <div>
                  <p className="font-medium">{s.symbol}</p>
                  <p className="text-sm text-text-secondary">
                    {t(`signalsEnum.type.${s.type}` as never)} ·{" "}
                    {t(`signalsEnum.strength.${s.strength}` as never)}
                  </p>
                </div>
              </div>
              <span className="text-sm text-text-secondary">
                {formatSignalMinutesAgo(s.minutesAgo, t)}
              </span>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => navigate("/app/signals")}
        >
          {t("dashboard.viewAllSignals")}{" "}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </SectionCard>

      <SectionCard
        title={t("dashboard.unlockPremium")}
        subtitle={t("dashboard.unlockPremiumSubtitle")}
        className="border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            {t("dashboard.unlockPremiumBody")}
          </p>
          <Button
            onClick={() => openUpgradeModal({ featureKey: "premiumFeatures" })}
          >
            {t("dashboard.upgradeNow")}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
