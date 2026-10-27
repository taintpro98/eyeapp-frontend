import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FinancialRow } from "@/lib/fa/pivot";
import { cn } from "@/lib/utils";
import { FinancialChart } from "./charts/FinancialChart";
import { FINANCIAL_CHARTS } from "./charts/chartSpecs";

type Range = "4" | "8" | "all";
const RANGES: Range[] = ["4", "8", "all"];

type FinancialChartsSectionProps = {
  rows: FinancialRow[];
  isLoading: boolean;
};

export function FinancialChartsSection({ rows, isLoading }: FinancialChartsSectionProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("8");

  const visible = useMemo(() => (range === "all" ? rows : rows.slice(-Number(range))), [rows, range]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{t("fa.charts.sectionTitle")}</h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            {t("fa.charts.sectionSubtitle", { count: rows.length })}
          </p>
        </div>
        <div
          className="inline-flex self-start rounded-lg border border-surface-border bg-surface-card p-1 text-xs sm:self-auto"
          role="group"
          aria-label={t("fa.charts.rangeLabel")}
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors touch-manipulation",
                range === r
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {r === "all" ? t("fa.charts.rangeAll", { count: rows.length }) : t("fa.charts.rangeQuarters", { count: Number(r) })}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading
          ? FINANCIAL_CHARTS.map((spec) => (
              <div key={spec.id} className="h-[340px] animate-pulse rounded-card border border-surface-border bg-surface-card" />
            ))
          : FINANCIAL_CHARTS.map((spec) => <FinancialChart key={spec.id} spec={spec} rows={visible} />)}
      </div>
    </section>
  );
}
