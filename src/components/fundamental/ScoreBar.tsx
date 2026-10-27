import { cn } from "@/lib/utils";
import { formatScoreWithMax, scorePercent, scoreTier } from "@/lib/fa/scores";
import { RATING_FILL, RATING_TEXT } from "./ratingStyles";

type ScoreBarProps = {
  value: number | null | undefined;
  max: number;
  label?: string;
  /** Hide the "14/20" figure (e.g. in dense table cells). */
  compact?: boolean;
  /** Put the figure on its own line under the label — for narrow columns where both won't fit. */
  stacked?: boolean;
  className?: string;
};

/** Sub-score bar coloured by its share of the ceiling, with the "x/max" figure. */
export function ScoreBar({ value, max, label, compact, stacked, className }: ScoreBarProps) {
  const tier = scoreTier(value, max);
  const pct = scorePercent(value, max);

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || !compact) && (
        <div className={cn("text-xs", stacked ? "flex flex-col" : "flex items-center justify-between gap-2")}>
          {label && <span className="truncate font-medium text-text-primary">{label}</span>}
          {!compact && (
            <span className={cn("shrink-0 font-semibold tabular-nums", RATING_TEXT[tier])}>
              {formatScoreWithMax(value, max)}
            </span>
          )}
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-border/60"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value ?? undefined}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", RATING_FILL[tier])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
