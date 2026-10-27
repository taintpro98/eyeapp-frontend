import { useTranslation } from "react-i18next";
import type { TickerOverview } from "@/api/fa";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatScore, formatVnd } from "@/lib/fa/format";
import { ratingTier } from "@/lib/fa/ratings";
import { RatingBadge } from "./RatingBadge";
import { RATING_FILL } from "./ratingStyles";

type FaTickerHeaderProps = {
  ticker: string;
  overview: TickerOverview | undefined;
  isLoading: boolean;
};

const PRICE_SOURCE_KEYS: Record<string, string> = {
  VPS: "fa.header.priceSource.realtime",
  DB: "fa.header.priceSource.statement",
};

function Skeleton() {
  return (
    <div className="animate-pulse rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-28 rounded bg-surface-border/60" />
          <div className="h-4 w-56 rounded bg-surface-border/60" />
        </div>
        <div className="h-10 w-40 rounded bg-surface-border/60" />
        <div className="h-12 w-48 rounded bg-surface-border/60" />
      </div>
    </div>
  );
}

export function FaTickerHeader({ ticker, overview, isLoading }: FaTickerHeaderProps) {
  const { t } = useTranslation();

  if (isLoading) return <Skeleton />;

  const score = overview?.faScore ?? null;
  const tier = ratingTier(overview?.rating);
  const priceSourceKey = overview?.priceSource ? PRICE_SOURCE_KEYS[overview.priceSource] : undefined;

  return (
    <div className="rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Identity */}
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{ticker}</h2>
            {overview?.exchange && (
              <Badge className="bg-brand-primary/10 text-brand-primary dark:text-brand-light">{overview.exchange}</Badge>
            )}
            {overview?.period && (
              <span className="text-xs text-text-secondary">{t("fa.header.period", { period: overview.period })}</span>
            )}
          </div>
          <p className="truncate text-sm font-medium text-text-primary sm:text-base">
            {overview?.companyName ?? t("fa.header.unknownCompany")}
          </p>
          {overview?.industry && <p className="text-xs text-text-secondary">{overview.industry}</p>}
        </div>

        {/* Price */}
        <div>
          <p className="text-xs text-text-secondary">{t("fa.header.price")}</p>
          <p className="text-2xl font-bold tabular-nums text-text-primary">{formatVnd(overview?.price)}</p>
          {priceSourceKey && <p className="text-xs text-text-secondary">{t(priceSourceKey)}</p>}
        </div>

        {/* FA score */}
        <div className="flex items-center gap-4 lg:justify-end">
          <div className="min-w-[96px]">
            <p className="text-xs text-text-secondary">{t("fa.header.faScore")}</p>
            <p className="tabular-nums">
              <span className="text-2xl font-bold text-text-primary">{formatScore(score)}</span>
              <span className="ml-0.5 text-xs text-text-secondary">/100</span>
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border/60">
              <div
                className={cn("h-full rounded-full", RATING_FILL[tier])}
                style={{ width: `${Math.min(100, Math.max(0, score ?? 0))}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <RatingBadge rating={overview?.rating} size="md" />
            {overview?.dataQuality && (
              <span className="text-xs text-text-secondary">
                {t("fa.header.dataQuality")}: {t(`fa.dataQuality.${overview.dataQuality}`, { defaultValue: t("fa.dataQuality.unknown") })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
