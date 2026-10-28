import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Lock } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { PlanBadge } from "@/components/PlanBadge";
import { Button } from "@/components/ui/button";
import type { UserMarket } from "@/api/markets";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type PlanSummaryCardProps = {
  /** The user's subscription to the selected market; undefined while loading. */
  market?: UserMarket;
  className?: string;
};

/** Current plan of the selected market: expiry, which features it unlocks, and upgrade/manage actions. */
export function PlanSummaryCard({ market, className }: PlanSummaryCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const plan = market?.plan ?? "free";
  const features = market?.features ?? [];
  const unlocked = features.filter((f) => f.accessible).length;

  let expiry = t("dashboard.noExpiry");
  if (market?.expires_at) {
    const expiresAt = new Date(market.expires_at);
    const date = expiresAt.toLocaleDateString(i18n.language.startsWith("vi") ? "vi-VN" : "en-US");
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS);
    expiry = daysLeft > 0 ? t("dashboard.expiresIn", { date, count: daysLeft }) : t("dashboard.expired", { date });
  }

  return (
    <SectionCard
      title={t("dashboard.planSummary")}
      headerAction={<PlanBadge label={market?.name ?? ""} variant="default" />}
      className={className}
    >
      <p className="text-2xl font-semibold text-text-primary">{capitalize(plan)}</p>
      <p className="mt-1 text-sm text-text-secondary">{expiry}</p>

      {features.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
            <span>{t("dashboard.featuresUnlocked")}</span>
            <span className="tabular-nums">
              {unlocked}/{features.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-border">
            <div
              className="h-full rounded-full bg-brand-primary dark:bg-brand-light"
              style={{ width: `${(unlocked / features.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {features.map((f) => (
              <li
                key={f.code}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 text-sm",
                  f.accessible ? "text-text-primary" : "text-text-secondary/60",
                )}
                title={f.accessible ? undefined : t("dashboard.requiresPlan", { plan: capitalize(f.required_plan) })}
              >
                {f.accessible ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-brand-primary dark:text-brand-light" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">{t(`dashboard.features.${f.code}`, { defaultValue: f.name })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/app/billing")}>
          {t("dashboard.managePlan")}
        </Button>
        {plan !== "premium" && (
          <Button className="flex-1" onClick={() => navigate("/app/billing")}>
            {t("dashboard.upgrade")}
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
