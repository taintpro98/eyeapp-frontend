import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Check, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { fetchUserMarkets } from "@/api/markets";
import { useAppStore } from "@/store/useAppStore";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function BillingPage() {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);

  const { data: userMarkets = [], isLoading } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  return (
    <div className="space-y-8">
      <PageHeader title={t("billing.title")} subtitle={t("billing.subtitle")} />

      <SectionCard
        title={t("billing.myMarkets")}
        subtitle={t("billing.myMarketsSubtitle")}
      >
        {isLoading ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("common.loading")}
          </p>
        ) : userMarkets.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("billing.noSubscriptions")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {userMarkets.map((market) => (
              <div
                key={market.code}
                className="rounded-lg border border-surface-border bg-surface-card p-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {market.name}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {t("billing.planLabel", { plan: capitalize(market.plan) })}
                    </p>
                  </div>
                  <PlanBadge label={capitalize(market.plan)} variant="default" />
                </div>

                {/* Feature list */}
                <ul className="mt-4 space-y-2.5">
                  {market.features.map((feature) => (
                    <li key={feature.code} className="flex items-center gap-2">
                      {feature.accessible ? (
                        <Check className="h-4 w-4 shrink-0 text-brand-primary" />
                      ) : (
                        <Check className="h-4 w-4 shrink-0 opacity-0" />
                      )}
                      <span className={`flex-1 text-sm ${feature.accessible ? "text-text-primary" : "text-text-secondary/50"}`}>
                        {feature.name}
                      </span>
                      {!feature.accessible && (
                        <>
                          <PlanBadge
                            label={capitalize(feature.required_plan)}
                            variant={feature.required_plan === "pro" ? "pro" : "premium"}
                          />
                          <Lock className="h-3.5 w-3.5 shrink-0 text-text-secondary/50" />
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Upgrade button if not on premium */}
                {market.plan !== "premium" && (
                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() =>
                      openUpgradeModal({
                        market: market.name,
                        marketCode: market.code,
                        reasonKey: "featureRequired",
                      })
                    }
                  >
                    {t("billing.cta.upgrade")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
