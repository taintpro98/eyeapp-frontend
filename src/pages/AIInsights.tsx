import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { PremiumPreviewCard } from "@/components/PremiumPreviewCard";
import { Lumi } from "@/components/Lumi";
import { openLumiChat } from "@/data/mockLumiChat";
import { Sparkles, MessageCircle } from "lucide-react";

export function AIInsightsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <PageHeader
        title={t("aiInsights.title")}
        subtitle={t("aiInsights.subtitle")}
      />

      {/* Banner giới thiệu trợ lý Lumi */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-r from-surface-card via-surface-warm/40 to-surface-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-cream dark:bg-brand-primary/20 p-1.5 shadow-md ring-2 ring-brand-primary/20">
              <Lumi mood="happy" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {t("lumiChat.banner.title")}
                </h3>
                <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold">
                  {t("lumiChat.banner.online")}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                {t("lumiChat.banner.desc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => openLumiChat()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark active:scale-95 transition-all shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t("lumiChat.banner.cta")}</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          </button>
        </div>
      </div>

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
