import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { PremiumPreviewCard } from "@/components/PremiumPreviewCard";

export function AIInsightsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <PageHeader
        title={t("aiInsights.title")}
        subtitle={t("aiInsights.subtitle")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <PremiumPreviewCard
          upgradeFeatureKey="marketDirection"
          title={t("aiInsights.marketDirection")}
          description={t("aiInsights.marketDirectionDesc")}
        >
          <div className="rounded-lg border border-surface-border bg-surface-warm/30 p-4">
            <p className="text-sm text-text-secondary">
              {t("common.sampleInsight")}
            </p>
            <p className="mt-1 font-medium">{t("aiInsights.sampleBullish")}</p>
          </div>
        </PremiumPreviewCard>
        <PremiumPreviewCard
          upgradeFeatureKey="sentimentAnalysis"
          title={t("aiInsights.sentimentAnalysis")}
          description={t("aiInsights.sentimentAnalysisDesc")}
        >
          <div className="rounded-lg border border-surface-border bg-surface-warm/30 p-4">
            <p className="text-sm text-text-secondary">
              {t("common.sampleInsight")}
            </p>
            <p className="mt-1 font-medium">{t("aiInsights.sampleGreed")}</p>
          </div>
        </PremiumPreviewCard>
      </div>
    </div>
  );
}
