import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { mockSignalsList } from "@/data/mockSignals";
import { formatSignalMinutesAgo } from "@/lib/formatSignalTime";
import { cn } from "@/lib/utils";

export function SignalsPage() {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);

  const columns = useMemo(
    () => [
      { key: "symbol", header: t("signals.columns.symbol") },
      {
        key: "type",
        header: t("signals.columns.type"),
        render: (row: (typeof mockSignalsList)[number]) =>
          t(`signalsEnum.type.${row.type}` as never),
      },
      {
        key: "strength",
        header: t("signals.columns.strength"),
        render: (row: (typeof mockSignalsList)[number]) =>
          t(`signalsEnum.strength.${row.strength}` as never),
      },
      {
        key: "confidence",
        header: t("signals.columns.confidence"),
        render: (row: (typeof mockSignalsList)[number]) => (
          <span
            className={
              row.confidence >= 80
                ? "font-medium text-green-600 dark:text-green-400"
                : ""
            }
          >
            {row.confidence}%
          </span>
        ),
      },
      {
        key: "minutesAgo",
        header: t("signals.columns.time"),
        render: (row: (typeof mockSignalsList)[number]) =>
          formatSignalMinutesAgo(row.minutesAgo, t),
      },
      {
        key: "premium",
        header: "",
        render: (row: (typeof mockSignalsList)[number]) =>
          row.premium ? (
            <PlanBadge label={t("common.pro")} variant="pro" />
          ) : null,
      },
    ],
    [t],
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        title={t("signals.title")}
        subtitle={t("signals.subtitle")}
        children={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input
              placeholder={t("signals.filterPlaceholder")}
              className="w-full min-w-0 sm:w-48"
            />
            <Button variant="outline" className="w-full shrink-0 sm:w-auto">
              {t("signals.filters")}
            </Button>
          </div>
        }
      />

      <SectionCard
        title={t("signals.activeSignals")}
        subtitle={t("signals.activeSignalsSubtitle")}
        className="p-3 sm:p-4 md:p-6"
      >
        <DataTable
          columns={columns}
          data={mockSignalsList}
          renderMobileCard={(row) => (
            <div
              className={cn(
                "rounded-lg border border-surface-border bg-surface-card p-3 sm:p-4",
                "dark:bg-zinc-900/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-semibold text-text-primary">
                  {row.symbol}
                </span>
                {row.premium ? (
                  <PlanBadge label={t("common.pro")} variant="pro" />
                ) : null}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    {t("signals.mobile.type")}
                  </dt>
                  <dd className="mt-0.5 font-medium text-text-primary">
                    {t(`signalsEnum.type.${row.type}` as never)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    {t("signals.mobile.strength")}
                  </dt>
                  <dd className="mt-0.5 font-medium text-text-primary">
                    {t(`signalsEnum.strength.${row.strength}` as never)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    {t("signals.mobile.confidence")}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 font-medium tabular-nums",
                      row.confidence >= 80 &&
                        "text-green-600 dark:text-green-400",
                    )}
                  >
                    {row.confidence}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    {t("signals.mobile.time")}
                  </dt>
                  <dd className="mt-0.5 text-text-primary">
                    {formatSignalMinutesAgo(row.minutesAgo, t)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title={t("signals.advancedAnalytics")}
        subtitle={t("signals.advancedAnalyticsSubtitle")}
        className="relative overflow-hidden p-3 sm:p-4 md:p-6"
      >
        <div className="pointer-events-none select-none blur-sm">
          <div className="h-48 rounded-lg border border-surface-border bg-surface-warm/50 p-4">
            <p className="text-text-secondary">
              {t("signals.advancedAnalyticsBlurb")}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <Button
            className="w-full max-w-sm sm:w-auto"
            onClick={() =>
              openUpgradeModal({
                featureKey: "advancedAnalytics",
                reasonKey: "proPlan",
              })
            }
          >
            <Lock className="mr-2 h-4 w-4" />
            {t("signals.unlockAdvancedAnalytics")}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
