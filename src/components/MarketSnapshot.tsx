import { useTranslation } from "react-i18next";
import { Activity, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { useMarketOverview } from "@/hooks/useMarketOverview";
import { fmt2 } from "@/lib/format";
import { CRYPTO_MARKET_ID, formatAsOf, formatChange, formatQuote, quoteLabel } from "@/lib/marketFormat";
import { cn } from "@/lib/utils";

/** VN indices that get a KPI card; HNX/UPCoM only appear in the overview list. */
const VN_KPI_CODES = ["VNINDEX", "VN30"];

/** Smaller value on phones so long figures (turnover, breadth) are not truncated. */
const COMPACT_VALUE = "text-base sm:text-2xl";

export function ChangePct({ value }: { value: number }) {
  return (
    <span className={cn("tabular-nums", value >= 0 ? "text-green-600" : "text-red-600")}>
      {value >= 0 ? "+" : ""}
      {fmt2(value)}%
    </span>
  );
}

function KpiSkeleton() {
  return (
    <div className="h-[92px] animate-pulse rounded-card border border-surface-border bg-surface-card sm:h-[124px]" />
  );
}

/** The dashboard's top row: indices + HOSE turnover/breadth, or the top coins. */
export function MarketKpiRow({ marketId }: { marketId: number }) {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useMarketOverview(marketId);
  const isCrypto = marketId === CRYPTO_MARKET_ID;
  const trendLabel = isCrypto ? t("market.trend.24h") : t("market.trend.session");

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const quotes = isCrypto
    ? data.quotes
    : data.quotes.filter((q) => VN_KPI_CODES.includes(q.code));

  const cards: React.ReactNode[] = quotes.map((q) => (
    <StatCard
      key={q.code}
      title={quoteLabel(q.code)}
      value={formatQuote(q, isCrypto)}
      trend={{ value: Number(q.change_pct.toFixed(2)), label: trendLabel }}
      icon={q.change_pct >= 0 ? TrendingUp : TrendingDown}
    />
  ));

  if (data.turnover != null) {
    cards.push(
      <StatCard
        key="turnover"
        title={t("dashboard.kpiTitles.hoseTurnover")}
        value={t("dashboard.turnoverValue", {
          value: (data.turnover / 1e9).toLocaleString(i18n.language.startsWith("vi") ? "vi-VN" : "en-US", {
            maximumFractionDigits: 0,
          }),
        })}
        subtitle={t("dashboard.kpiSubtitles.session")}
        icon={BarChart3}
        valueClassName={COMPACT_VALUE}
      />,
    );
  }

  if (data.breadth) {
    const b = data.breadth;
    cards.push(
      <StatCard
        key="breadth"
        title={t("dashboard.kpiTitles.breadth")}
        value={
          <span className="tabular-nums">
            <span className="text-green-600">▲{b.advances}</span>{" "}
            <span className="text-red-600">▼{b.declines}</span>
          </span>
        }
        subtitle={t("dashboard.breadthDetail", {
          unchanged: b.unchanged,
          ceiling: b.ceiling,
          floor: b.floor,
        })}
        icon={Activity}
        valueClassName={COMPACT_VALUE}
      />,
    );
  }

  return <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{cards}</div>;
}

/** Advancers / unchanged / decliners as one proportional bar with a legend. */
export function BreadthBar({
  breadth,
  title,
}: {
  /** Ceiling/floor counts only exist for VN stocks. */
  breadth: { advances: number; declines: number; unchanged: number; ceiling?: number; floor?: number };
  title?: string;
}) {
  const { t } = useTranslation();
  const total = breadth.advances + breadth.unchanged + breadth.declines;
  if (total === 0) return null;
  const parts = [
    { key: "advances", count: breadth.advances, bar: "bg-green-500", text: "text-green-600" },
    { key: "unchanged", count: breadth.unchanged, bar: "bg-amber-400", text: "text-amber-600" },
    { key: "declines", count: breadth.declines, bar: "bg-red-500", text: "text-red-600" },
  ] as const;

  return (
    <div className="mt-5 border-t border-surface-border pt-4">
      <p className="mb-2 text-sm font-medium text-text-primary">{title ?? t("dashboard.kpiTitles.breadth")}</p>
      <div className="flex h-2 overflow-hidden rounded-full">
        {parts.map((p) => (
          <div key={p.key} className={p.bar} style={{ width: `${(p.count / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {parts.map((p) => (
          <span key={p.key}>
            {t(`dashboard.breadth.${p.key}`)} <span className={cn("font-semibold tabular-nums", p.text)}>{p.count}</span>
          </span>
        ))}
        {breadth.ceiling != null && (
          <span>
            {t("dashboard.breadth.ceiling")} <span className="font-semibold tabular-nums text-purple-600 dark:text-purple-400">{breadth.ceiling}</span>
          </span>
        )}
        {breadth.floor != null && (
          <span>
            {t("dashboard.breadth.floor")} <span className="font-semibold tabular-nums text-cyan-600 dark:text-cyan-400">{breadth.floor}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** "Current market" card: every quote with its change, plus HOSE breadth for vnstock. Hidden on error. */
export function MarketOverviewCard({ marketId, className }: { marketId: number; className?: string }) {
  const { t } = useTranslation();
  const { data } = useMarketOverview(marketId);
  if (!data) return null;

  const isCrypto = marketId === CRYPTO_MARKET_ID;
  const asOf = formatAsOf(data.as_of);

  return (
    <SectionCard
      title={t("dashboard.currentMarket")}
      headerAction={<span className="text-xs text-text-secondary">{t("dashboard.updatedAt", { time: asOf })}</span>}
      className={className}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-text-secondary">
            <th className="pb-2 text-left font-medium">{t(isCrypto ? "dashboard.columns.coin" : "dashboard.columns.index")}</th>
            <th className="pb-2 text-right font-medium">{t("dashboard.columns.value")}</th>
            <th className="hidden pb-2 text-right font-medium sm:table-cell">{t("dashboard.columns.change")}</th>
            <th className="pb-2 text-right font-medium">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {data.quotes.map((q) => (
            <tr key={q.code}>
              <td className="py-2.5 text-text-secondary">{quoteLabel(q.code)}</td>
              <td className="py-2.5 text-right font-medium tabular-nums text-text-primary">{formatQuote(q, isCrypto)}</td>
              <td
                className={cn(
                  "hidden py-2.5 text-right tabular-nums sm:table-cell",
                  q.change >= 0 ? "text-green-600" : "text-red-600",
                )}
              >
                {formatChange(q.change, isCrypto)}
              </td>
              <td className="py-2.5 text-right">
                <ChangePct value={q.change_pct} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.breadth && <BreadthBar breadth={data.breadth} />}
    </SectionCard>
  );
}
