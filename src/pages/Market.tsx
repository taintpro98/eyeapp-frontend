import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import {
  mockTopMoversStocks,
  mockTopMoversCrypto,
  mockSentiment,
  mockMarketOverviewStats,
} from "@/data/mockMarket";
import { useAppStore } from "@/store/useAppStore";

const statIcons = [TrendingUp, TrendingUp, BarChart3, BarChart3];

const STOCK_OVERVIEW_KEYS = [
  "vnIndex",
  "vn30",
  "hoseValue",
  "netForeign",
] as const;
const CRYPTO_OVERVIEW_KEYS = [
  "btcPrice",
  "ethPrice",
  "mktCap",
  "volume24h",
] as const;

function sentimentKey(label: string): "bullish" | "neutral" | "bearish" {
  if (label === "Bullish") return "bullish";
  if (label === "Neutral") return "neutral";
  return "bearish";
}

export function MarketPage() {
  const { t } = useTranslation();
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const isCrypto = selectedMarket === "crypto";
  const topMovers = isCrypto ? mockTopMoversCrypto : mockTopMoversStocks;
  const overviewStats = isCrypto
    ? mockMarketOverviewStats.crypto
    : mockMarketOverviewStats.stocks;
  const overviewKeys = isCrypto ? CRYPTO_OVERVIEW_KEYS : STOCK_OVERVIEW_KEYS;

  const tableColumns = useMemo(
    () => [
      { key: "symbol", header: t("market.columns.symbol") },
      { key: "name", header: t("market.columns.name") },
      { key: "price", header: t("market.columns.price") },
      {
        key: "change24h",
        header: t("market.columns.change24h"),
        render: (row: Record<string, unknown>) => {
          const change = (row as { change24h: number }).change24h;
          return (
            <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          );
        },
      },
      { key: "volume", header: t("market.columns.volume") },
    ],
    [t],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("market.title")}
        subtitle={
          isCrypto ? t("market.subtitleCrypto") : t("market.subtitleStocks")
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, i) => (
          <StatCard
            key={stat.title}
            title={t(
              `market.overview.${isCrypto ? "crypto" : "stocks"}.${overviewKeys[i]}`,
            )}
            value={stat.value}
            trend={
              stat.trend
                ? {
                    ...stat.trend,
                    label:
                      stat.trend.label.toLowerCase() === "session"
                        ? t("market.trend.session")
                        : t("market.trend.24h"),
                  }
                : undefined
            }
            icon={statIcons[i] ?? TrendingUp}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={t("market.topMovers")}
          subtitle={t("market.topMoversSubtitle")}
        >
          <div className="space-y-3 md:hidden">
            {topMovers.map((row) => (
              <div
                key={row.symbol}
                className="flex items-center justify-between rounded-lg border border-surface-border p-3"
              >
                <div>
                  <p className="font-medium text-text-primary">{row.symbol}</p>
                  <p className="text-xs text-text-secondary">{row.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{row.price}</p>
                  <p
                    className={
                      row.change24h >= 0
                        ? "text-xs text-green-600"
                        : "text-xs text-red-600"
                    }
                  >
                    {row.change24h >= 0 ? "+" : ""}
                    {row.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable columns={tableColumns} data={topMovers} />
          </div>
        </SectionCard>

        <SectionCard title={t("market.sentiment")}>
          <div className="space-y-3 sm:space-y-4">
            {mockSentiment.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-xs sm:text-sm">
                  <span className="text-text-secondary">
                    {t(`market.sentimentLabels.${sentimentKey(s.label)}`)}
                  </span>
                  <span className="font-medium">{s.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-border">
                  <div
                    className={`h-full ${s.color} transition-all`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
