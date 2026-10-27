import { useTranslation } from "react-i18next";
import type { TickerOverview } from "@/api/fa";
import { SectionCard } from "@/components/SectionCard";
import { formatScoreWithMax, SCORE_GROUPS } from "@/lib/fa/scores";
import { RatingBadge } from "./RatingBadge";
import { ScoreBar } from "./ScoreBar";

type ScoreBreakdownCardProps = {
  overview: TickerOverview | undefined;
  isLoading: boolean;
};

/** The FA score split into its 7 groups, each judged against its own ceiling. */
export function ScoreBreakdownCard({ overview, isLoading }: ScoreBreakdownCardProps) {
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t("fa.breakdown.title")}
      subtitle={t("fa.breakdown.subtitle")}
      headerAction={
        !isLoading && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-bold tabular-nums text-text-primary">
              {formatScoreWithMax(overview?.faScore, 100)}
            </span>
            <RatingBadge rating={overview?.rating} />
          </div>
        )
      }
    >
      <div className="space-y-3.5">
        {SCORE_GROUPS.map((group) =>
          isLoading ? (
            <div key={group.key} className="h-8 animate-pulse rounded bg-surface-border/50" />
          ) : (
            <ScoreBar
              key={group.key}
              label={t(`fa.group.${group.key}`)}
              value={overview?.[group.field] ?? null}
              max={group.max}
            />
          ),
        )}
      </div>
      <p className="mt-4 border-t border-surface-border pt-3 text-xs text-text-secondary">{t("fa.breakdown.footnote")}</p>
    </SectionCard>
  );
}
