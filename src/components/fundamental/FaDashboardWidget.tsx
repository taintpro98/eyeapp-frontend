import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { fetchFullScreener } from "@/api/fa";
import { taAgentRetry } from "@/lib/taAgent";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/hooks/useMarket";
import { formatScore } from "@/lib/fa/format";
import { RATING_CODES, ratingTier } from "@/lib/fa/ratings";
import { summarize } from "@/lib/fa/summary";
import { RatingBadge } from "./RatingBadge";
import { RATING_FILL } from "./ratingStyles";

const TOP = 3;

/** Dashboard snapshot of FA: rating mix and the strongest names. Silent on failure — the FA page explains errors. */
export function FaDashboardWidget() {
  const { t } = useTranslation();
  const market = useMarket();

  // Same query as the FA page's overview panel, so whichever opens first fills the cache.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["fa", "screener-full", "watched"],
    queryFn: () => fetchFullScreener({ watchedOnly: true }),
    staleTime: 5 * 60 * 1000,
    retry: taAgentRetry,
  });

  const summary = useMemo(() => summarize(data?.items ?? []), [data]);
  const total = data?.items.length ?? 0;

  if (isError || (!isLoading && total === 0)) return null;

  return (
    <SectionCard
      title={t("fa.dashboard.title")}
      subtitle={
        data?.period
          ? t("fa.dashboard.subtitle", { count: total, period: data.period, average: formatScore(summary.average) })
          : undefined
      }
    >
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-surface-border/40" />
      ) : (
        <>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-border/50" aria-hidden>
            {RATING_CODES.map((code) =>
              summary.counts[code] ? (
                <div
                  key={code}
                  className={RATING_FILL[ratingTier(code)]}
                  style={{ width: `${(summary.counts[code] / total) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary">
            {RATING_CODES.map((code) => (
              <li key={code} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${RATING_FILL[ratingTier(code)]}`} />
                {t(`fa.rating.${code}`)} <span className="tabular-nums text-text-primary">{summary.counts[code]}</span>
              </li>
            ))}
          </ul>

          <ol className="mt-4 divide-y divide-surface-border rounded-lg border border-surface-border">
            {summary.top.slice(0, TOP).map((item) => (
              <li key={item.ticker}>
                <Link
                  to={`/app/${market}/fundamental/${encodeURIComponent(item.ticker)}`}
                  className="flex items-center gap-3 p-3 hover:bg-surface-warm/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-text-primary">{item.ticker}</span>
                    <span className="block truncate text-xs text-text-secondary">{item.companyName ?? ""}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-text-primary">{formatScore(item.overallScore)}</span>
                  <RatingBadge rating={item.rating} />
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
      <Button variant="ghost" className="mt-4 w-full" asChild>
        <Link to={`/app/${market}/fundamental`}>
          {t("fa.dashboard.cta")} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </SectionCard>
  );
}
