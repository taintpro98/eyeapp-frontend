import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { normalizeInsights, type Insight } from "@/lib/fa/insights";

type InsightsCardsProps = {
  highlights: string[] | undefined;
  warnings: string[] | undefined;
  isLoading: boolean;
};

function InsightList({ items, positive }: { items: Insight[]; positive: boolean }) {
  const Icon = positive ? CheckCircle2 : AlertTriangle;
  return (
    <ul className="space-y-2.5">
      {items.map((insight) => (
        <li key={insight.text} className="flex items-start gap-2 text-sm text-text-primary">
          <Icon className={positive ? "mt-0.5 h-4 w-4 shrink-0 text-rating-5" : "mt-0.5 h-4 w-4 shrink-0 text-rating-2"} />
          <span>{insight.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function InsightsCards({ highlights, warnings, isLoading }: InsightsCardsProps) {
  const { t } = useTranslation();
  const { positives, negatives } = useMemo(() => normalizeInsights(highlights, warnings), [highlights, warnings]);

  const skeleton = (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-surface-border/50" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionCard
        title={t("fa.insights.strengths")}
        headerAction={!isLoading && <span className="text-xs text-text-secondary">{t("fa.insights.count", { count: positives.length })}</span>}
      >
        {isLoading ? (
          skeleton
        ) : positives.length ? (
          <InsightList items={positives} positive />
        ) : (
          <p className="py-4 text-center text-sm text-text-secondary">{t("fa.insights.noStrengths")}</p>
        )}
      </SectionCard>

      <SectionCard
        title={t("fa.insights.risks")}
        headerAction={!isLoading && <span className="text-xs text-text-secondary">{t("fa.insights.count", { count: negatives.length })}</span>}
      >
        {isLoading ? (
          skeleton
        ) : negatives.length ? (
          <InsightList items={negatives} positive={false} />
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center">
            <ShieldCheck className="h-6 w-6 text-rating-5" />
            <p className="text-sm text-text-primary">{t("fa.insights.noRisks")}</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
