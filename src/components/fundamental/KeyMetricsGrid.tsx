import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RatioItem, TickerOverview } from "@/api/fa";
import { StatCard } from "@/components/StatCard";
import { formatBillionVnd, formatMultiple, formatPct } from "@/lib/fa/format";
import { latestValue, type FinancialRow } from "@/lib/fa/pivot";

type KeyMetricsGridProps = {
  overview: TickerOverview | undefined;
  ratios: RatioItem[] | undefined;
  rows: FinancialRow[];
  isLoading: boolean;
};

type Metric = { key: string; value: string; hint: string };

export function KeyMetricsGrid({ overview, ratios, rows, isLoading }: KeyMetricsGridProps) {
  const { t } = useTranslation();

  const metrics = useMemo<Metric[]>(() => {
    const ratio = (code: string): number | null => {
      const fromList = ratios?.find((r) => r.ratioCode === code)?.value;
      if (fromList != null) return fromList;
      return overview?.ratios?.[code]?.value ?? null;
    };
    const billionUnits = [t("fa.unit.billion"), t("fa.unit.thousandBillion"), 1] as const;

    const pe = overview?.peTtm ?? ratio("PE_TTM");
    const pb = overview?.pb ?? ratio("PB");
    const marketCap = overview?.marketCap ?? ratio("MARKET_CAP");
    const roe = ratio("ROE") ?? latestValue(rows, "ROE");
    const roa = ratio("ROA") ?? latestValue(rows, "ROA");
    const de = ratio("DEBT_TO_EQUITY") ?? latestValue(rows, "DEBT_TO_EQUITY");
    const netMargin = ratio("NET_MARGIN") ?? latestValue(rows, "NET_MARGIN");
    const revenueYoy = ratio("REVENUE_YOY");
    const cash = latestValue(rows, "CASH_AND_EQUIVALENTS");
    const cfo = latestValue(rows, "CFO");
    // Banks and insurers report profit but zero net revenue in ta-agent's mapping; debt, margin and
    // revenue growth ratios come out as 0 or empty for them and would read as "no leverage".
    const isFinancial = rows.length > 0 && !latestValue(rows, "REVENUE") && latestValue(rows, "NPAT") != null;
    const notApplicable = t("fa.metrics.notApplicable");

    const hint = (key: string, cond: boolean | null) =>
      cond == null ? t("fa.metrics.noData") : t(`fa.metrics.${key}.${cond ? "good" : "default"}`);

    return [
      { key: "pe", value: formatMultiple(pe), hint: pe == null ? t("fa.metrics.noData") : t(pe < 10 ? "fa.metrics.pe.cheap" : pe > 25 ? "fa.metrics.pe.rich" : "fa.metrics.pe.default") },
      { key: "pb", value: formatMultiple(pb), hint: hint("pb", pb == null ? null : pb < 1) },
      { key: "marketCap", value: formatBillionVnd(marketCap, ...billionUnits), hint: t("fa.metrics.marketCap.default") },
      { key: "roe", value: formatPct(roe), hint: hint("roe", roe == null ? null : roe >= 15) },
      { key: "roa", value: formatPct(roa), hint: hint("roa", roa == null ? null : roa >= 10) },
      isFinancial
        ? { key: "de", value: "—", hint: notApplicable }
        : { key: "de", value: formatMultiple(de), hint: de == null ? t("fa.metrics.noData") : t(de <= 1 ? "fa.metrics.de.good" : de > 2 ? "fa.metrics.de.high" : "fa.metrics.de.default") },
      { key: "netMargin", value: isFinancial ? "—" : formatPct(netMargin), hint: isFinancial ? notApplicable : t("fa.metrics.netMargin.default") },
      { key: "revenueYoy", value: isFinancial ? "—" : formatPct(revenueYoy, { signed: true }), hint: isFinancial ? notApplicable : t("fa.metrics.revenueYoy.default") },
      { key: "cash", value: formatBillionVnd(cash, ...billionUnits), hint: t("fa.metrics.cash.default") },
      { key: "cfo", value: formatBillionVnd(cfo, ...billionUnits), hint: cfo == null ? t("fa.metrics.noData") : t(cfo >= 0 ? "fa.metrics.cfo.good" : "fa.metrics.cfo.negative") },
    ];
  }, [overview, ratios, rows, t]);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold text-text-primary">{t("fa.metrics.title")}</h3>
        {overview?.period && (
          <span className="text-xs text-text-secondary">{t("fa.header.period", { period: overview.period })}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-card border border-surface-border bg-surface-card" />
            ))
          : metrics.map((m) => (
              <StatCard
                key={m.key}
                title={t(`fa.metrics.${m.key}.title`)}
                value={m.value}
                subtitle={m.hint}
                valueClassName="sm:text-xl"
              />
            ))}
      </div>
    </section>
  );
}
