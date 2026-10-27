import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "@/components/SectionCard";
import { useChartTheme } from "@/hooks/useChartTheme";
import type { FinancialRow } from "@/lib/fa/pivot";
import { AXIS_FORMAT, TOOLTIP_FORMAT, type ChartSpec } from "./chartSpecs";
import { ChartEmpty, ChartLegend, ChartTooltip } from "./ChartParts";

type FinancialChartProps = {
  spec: ChartSpec;
  rows: FinancialRow[];
};

/** One statement chart driven by a ChartSpec: bars and/or lines, optional stacks and a second axis. */
export function FinancialChart({ spec, rows }: FinancialChartProps) {
  const { t } = useTranslation();
  const theme = useChartTheme();
  const [hidden, setHidden] = useState<string[]>([]);

  const legend = useMemo(
    () => spec.series.map((s) => ({ dataKey: s.dataKey, label: t(s.labelKey), color: theme.series[s.color] })),
    [spec, t, theme],
  );
  const names = useMemo(() => Object.fromEntries(legend.map((l) => [l.dataKey, l.label])), [legend]);
  const kindOf = useMemo(
    () => Object.fromEntries(spec.series.map((s) => [s.dataKey, s.axis === "right" && spec.right ? spec.right : spec.left])),
    [spec],
  );

  const hasData = rows.some((row) => spec.series.some((s) => typeof row[s.dataKey] === "number"));
  const latest = rows[rows.length - 1]?.label;
  const toggle = (key: string) => setHidden((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const dual = !!spec.right;

  const axisProps = {
    stroke: theme.grid,
    tick: { fill: theme.axis, fontSize: 11 },
    tickLine: false,
  } as const;

  return (
    <SectionCard
      title={t(spec.titleKey)}
      subtitle={t(spec.subtitleKey)}
      className="flex flex-col"
      headerAction={
        latest && hasData ? (
          <span className="rounded-md border border-surface-border px-2 py-0.5 text-xs text-text-secondary">{latest}</span>
        ) : undefined
      }
    >
      {hasData && <ChartLegend items={legend} hidden={hidden} onToggle={toggle} />}
      <div className="mt-3 h-[240px] w-full sm:h-[260px]">
        {!hasData ? (
          <ChartEmpty message={t(spec.emptyKey)} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 8, right: dual ? 4 : 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
              <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" {...axisProps} axisLine={{ stroke: theme.grid }} minTickGap={12} />
              <YAxis yAxisId="left" {...axisProps} axisLine={false} width={56} tickFormatter={AXIS_FORMAT[spec.left]} />
              {spec.right && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  {...axisProps}
                  axisLine={false}
                  width={44}
                  tickFormatter={AXIS_FORMAT[spec.right]}
                />
              )}
              <Tooltip
                cursor={{ fill: theme.cursor }}
                content={
                  <ChartTooltip
                    periodLabel={t("fa.charts.period")}
                    names={names}
                    format={(key, value) => TOOLTIP_FORMAT[kindOf[key] ?? spec.left](value)}
                  />
                }
              />
              {spec.references?.map((ref) => (
                <ReferenceLine
                  key={`${ref.y}-${ref.axis ?? "left"}`}
                  y={ref.y}
                  yAxisId={ref.axis ?? "left"}
                  stroke={ref.tone === "accent" ? theme.axis : theme.zero}
                  strokeDasharray="3 3"
                  label={
                    ref.labelKey
                      ? { value: t(ref.labelKey), fill: theme.axis, fontSize: 11, position: "insideTopRight" }
                      : undefined
                  }
                />
              ))}
              {spec.series.map((s) =>
                s.type === "bar" ? (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    yAxisId={s.axis ?? "left"}
                    stackId={s.stackId}
                    fill={theme.series[s.color]}
                    radius={s.stackId ? 0 : [3, 3, 0, 0]}
                    maxBarSize={28}
                    hide={hidden.includes(s.dataKey)}
                    isAnimationActive={false}
                  />
                ) : (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    yAxisId={s.axis ?? "left"}
                    stroke={theme.series[s.color]}
                    strokeWidth={2}
                    dot={rows.length <= 12 ? { r: 2.5 } : false}
                    activeDot={{ r: 4 }}
                    connectNulls
                    hide={hidden.includes(s.dataKey)}
                    isAnimationActive={false}
                  />
                ),
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  );
}
