import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { isEmptyOverview } from "@/api/fa";
import { useFaOverview } from "@/hooks/useFaOverview";
import { useMarket } from "@/hooks/useMarket";
import { formatScore } from "@/lib/fa/format";
import { SCORE_MAX } from "@/lib/fa/scores";
import { RatingBadge } from "./RatingBadge";
import { ScoreBar } from "./ScoreBar";

/**
 * Compact FA score for a ticker, as one column of the asset summary card, linking
 * to the full fundamental page. FA lives in a separate service, so on any error or
 * missing data this renders nothing rather than breaking the host card.
 */
export function FaSummaryBlock({ ticker, className }: { ticker: string; className?: string }) {
  const { t } = useTranslation();
  const market = useMarket();
  const { data, isLoading, isError } = useFaOverview(ticker);

  if (isError || isEmptyOverview(data) || (!isLoading && data?.faScore == null)) return null;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {t("fa.summary.title")}
          {data?.period && <span className="ml-1 font-normal normal-case tracking-normal">· {data.period}</span>}
        </p>
        <Link
          to={`/app/${market}/fundamental/${encodeURIComponent(ticker)}`}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-primary hover:underline dark:text-brand-light"
        >
          {t("fa.summary.cta")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-3 h-20 animate-pulse rounded bg-surface-border/50" />
      ) : (
        <>
          <div className="mt-2 flex items-center gap-2">
            <p className="tabular-nums">
              <span className="text-2xl font-bold text-text-primary">{formatScore(data?.faScore)}</span>
              <span className="text-xs text-text-secondary">/100</span>
            </p>
            <RatingBadge rating={data?.rating} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <ScoreBar stacked label={t("fa.group.growth")} value={data?.growthScore} max={SCORE_MAX.growth} />
            <ScoreBar stacked label={t("fa.group.profitability")} value={data?.profitabilityScore} max={SCORE_MAX.profitability} />
            <ScoreBar stacked label={t("fa.group.valuation")} value={data?.valuationScore} max={SCORE_MAX.valuation} />
          </div>
        </>
      )}
    </div>
  );
}
