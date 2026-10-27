import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LegendEntry = { dataKey: string; label: string; color: string };

/** Click-to-toggle legend. Buttons so it works by keyboard and touch. */
export function ChartLegend({
  items,
  hidden,
  onToggle,
}: {
  items: LegendEntry[];
  hidden: string[];
  onToggle: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {items.map((item) => {
        const isHidden = hidden.includes(item.dataKey);
        return (
          <button
            key={item.dataKey}
            type="button"
            onClick={() => onToggle(item.dataKey)}
            aria-pressed={!isHidden}
            title={t(isHidden ? "fa.charts.show" : "fa.charts.hide", { name: item.label })}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium transition-colors touch-manipulation",
              isHidden
                ? "border-surface-border text-text-secondary line-through opacity-60"
                : "border-surface-border bg-surface-warm/60 text-text-primary hover:bg-surface-warm",
            )}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

type TooltipEntry = { dataKey?: string | number; name?: string; value?: unknown; color?: string };

/** Recharts custom tooltip content: period header + one row per visible series. */
export function ChartTooltip({
  active,
  payload,
  label,
  periodLabel,
  format,
  names,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  periodLabel: string;
  format: (dataKey: string, value: number | null) => string;
  names: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="pointer-events-none min-w-[180px] rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs shadow-soft">
      <p className="mb-1.5 flex items-center justify-between gap-3 border-b border-surface-border pb-1.5 font-semibold text-text-primary">
        <span>{periodLabel}</span>
        <span className="tabular-nums text-text-secondary">{label}</span>
      </p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "");
          const value = typeof entry.value === "number" ? entry.value : null;
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
                <span className="truncate">{names[key] ?? key}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-text-primary">{format(key, value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <BarChart3 className="h-7 w-7 text-text-secondary opacity-50" />
      <p className="max-w-[240px] text-xs text-text-secondary">{message}</p>
    </div>
  );
}
