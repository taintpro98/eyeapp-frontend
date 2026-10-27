import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchFullScreener } from "@/api/fa";
import { taAgentRetry } from "@/lib/taAgent";
import { SectionCard } from "@/components/SectionCard";
import { StatCard } from "@/components/StatCard";
import { useMarket } from "@/hooks/useMarket";
import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/fa/format";
import { RATING_CODES, ratingTier } from "@/lib/fa/ratings";
import { TOP_N, summarize } from "@/lib/fa/summary";
import { RatingBadge } from "./RatingBadge";
import { RATING_FILL } from "./ratingStyles";

/** Watchlist-wide snapshot: how many names sit in each rating, and the strongest ones. */
export function FaOverviewPanel() {
  const { t } = useTranslation();
  const market = useMarket();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["fa", "screener-full", "watched"],
    queryFn: () => fetchFullScreener({ watchedOnly: true }),
    staleTime: 5 * 60 * 1000,
    retry: taAgentRetry,
  });

  const summary = useMemo(() => summarize(data?.items ?? []), [data]);
  const total = data?.items.length ?? 0;

  // The screener below hits the same service and explains the failure; one message per page is enough.
  if (isError) return null;

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-card border border-surface-border bg-surface-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title={t("fa.overview.tracked")} value={total} subtitle={data?.period ? t("fa.header.period", { period: data.period }) : undefined} />
        <StatCard title={t("fa.overview.average")} value={formatScore(summary.average)} subtitle={t("fa.overview.outOf100")} />
        <StatCard
          title={t("fa.overview.goodShare")}
          value={summary.goodShare == null ? "—" : `${Math.round(summary.goodShare)}%`}
          subtitle={t("fa.overview.goodShareHint")}
        />
        <StatCard title={t("fa.overview.strongCount")} value={summary.counts.STRONG_FA} subtitle={t("fa.rating.STRONG_FA")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard title={t("fa.overview.distribution")} subtitle={t("fa.overview.distributionHint")} className="lg:col-span-3">
          {/* Stacked share bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-border/50" aria-hidden>
            {RATING_CODES.map((code) =>
              summary.counts[code] ? (
                <div
                  key={code}
                  className={RATING_FILL[ratingTier(code)]}
                  style={{ width: `${(summary.counts[code] / Math.max(1, total)) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <ul className="mt-4 space-y-2.5">
            {RATING_CODES.map((code) => {
              const count = summary.counts[code];
              const pct = total ? (count / total) * 100 : 0;
              return (
                <li key={code} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0">
                    <RatingBadge rating={code} />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-border/50">
                    <div className={cn("h-full rounded-full", RATING_FILL[ratingTier(code)])} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right tabular-nums text-text-primary">
                    {count} <span className="text-xs text-text-secondary">({Math.round(pct)}%)</span>
                  </span>
                </li>
              );
            })}
          </ul>
          {summary.unrated > 0 && (
            <p className="mt-3 text-xs text-text-secondary">{t("fa.overview.unrated", { count: summary.unrated })}</p>
          )}
        </SectionCard>

        <SectionCard title={t("fa.overview.top", { count: TOP_N })} className="lg:col-span-2">
          <ol className="divide-y divide-surface-border">
            {summary.top.map((item, idx) => (
              <li key={item.ticker}>
                <Link
                  to={`/app/${market}/fundamental/${encodeURIComponent(item.ticker)}`}
                  className="flex items-center gap-3 py-2.5 hover:text-brand-primary dark:hover:text-brand-light"
                >
                  <span className="w-5 text-xs tabular-nums text-text-secondary">{idx + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">{item.ticker}</span>
                    <span className="block truncate text-xs text-text-secondary">{item.industry ?? item.companyName ?? ""}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-bold tabular-nums text-text-primary">{formatScore(item.overallScore)}</span>
                    <RatingBadge rating={item.rating} className="mt-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}
