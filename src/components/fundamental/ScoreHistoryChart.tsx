import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreHistoryItem } from "@/api/fa";
import { SectionCard } from "@/components/SectionCard";
import { useChartTheme } from "@/hooks/useChartTheme";
import { comparePeriods, formatPeriodLabel } from "@/lib/fa/period";
import { formatScoreWithMax, SCORE_MAX } from "@/lib/fa/scores";
import { ChartEmpty, ChartLegend, ChartTooltip } from "./charts/ChartParts";

type ScoreHistoryChartProps = {
  history: ScoreHistoryItem[] | undefined;
  isLoading: boolean;
};

const SERIES = [
  { dataKey: "overallScore", group: "overall", max: SCORE_MAX.overall, color: 0, axis: "left" },
  { dataKey: "growthScore", group: "growth", max: SCORE_MAX.growth, color: 1, axis: "right" },
  { dataKey: "profitabilityScore", group: "profitability", max: SCORE_MAX.profitability, color: 2, axis: "right" },
  { dataKey: "valuationScore", group: "valuation", max: SCORE_MAX.valuation, color: 3, axis: "right" },
] as const;

/** Overall score (0–100, left axis) with the three 0–20 core groups (right axis). */
export function ScoreHistoryChart({ history, isLoading }: ScoreHistoryChartProps) {
  const { t } = useTranslation();
  const theme = useChartTheme();
  const [hidden, setHidden] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      [...(history ?? [])]
        .sort((a, b) => comparePeriods(a.period, b.period))
        .map((item) => ({ ...item, label: formatPeriodLabel(item.period) })),
    [history],
  );

  const legend = SERIES.map((s) => ({ dataKey: s.dataKey, label: t(`fa.group.${s.group}`), color: theme.series[s.color] }));
  const names = Object.fromEntries(legend.map((l) => [l.dataKey, l.label]));
  const maxOf = Object.fromEntries(SERIES.map((s) => [s.dataKey, s.max])) as Record<string, number>;
  const hasData = rows.some((r) => r.overallScore != null);
  const toggle = (key: string) => setHidden((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const axisProps = { stroke: theme.grid, tick: { fill: theme.axis, fontSize: 11 }, tickLine: false, axisLine: false } as const;

  return (
    <SectionCard
      title={t("fa.history.title")}
      subtitle={t("fa.history.subtitle")}
      headerAction={
        hasData ? (
          <span className="rounded-md border border-surface-border px-2 py-0.5 text-xs text-text-secondary">
            {t("fa.history.periods", { count: rows.length })}
          </span>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="h-[280px] animate-pulse rounded-lg bg-surface-border/40" />
      ) : (
        <>
          {hasData && <ChartLegend items={legend} hidden={hidden} onToggle={toggle} />}
          <div className="mt-3 h-[260px] w-full">
            {!hasData ? (
              <ChartEmpty message={t("fa.history.empty")} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" {...axisProps} axisLine={{ stroke: theme.grid }} minTickGap={12} />
                  <YAxis yAxisId="left" {...axisProps} width={32} domain={[0, 100]} ticks={[0, 35, 50, 65, 80, 100]} />
                  <YAxis yAxisId="right" orientation="right" {...axisProps} width={28} domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} />
                  {/* Rating thresholds on the 0–100 axis */}
                  {([80, 65, 50] as const).map((y, i) => (
                    <ReferenceLine
                      key={y}
                      yAxisId="left"
                      y={y}
                      stroke={theme.rating[(5 - i) as 5 | 4 | 3]}
                      strokeOpacity={0.45}
                      strokeDasharray="4 4"
                    />
                  ))}
                  <Tooltip
                    content={
                      <ChartTooltip
                        periodLabel={t("fa.charts.period")}
                        names={names}
                        format={(key, value) => formatScoreWithMax(value, maxOf[key] ?? 100)}
                      />
                    }
                  />
                  {SERIES.map((s) => (
                    <Line
                      key={s.dataKey}
                      type="monotone"
                      dataKey={s.dataKey}
                      yAxisId={s.axis}
                      stroke={theme.series[s.color]}
                      strokeWidth={s.dataKey === "overallScore" ? 2.5 : 1.5}
                      dot={rows.length <= 12 ? { r: 2.5 } : false}
                      connectNulls
                      hide={hidden.includes(s.dataKey)}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {hasData && <p className="mt-2 text-xs text-text-secondary">{t("fa.history.axesNote")}</p>}
        </>
      )}
    </SectionCard>
  );
}
