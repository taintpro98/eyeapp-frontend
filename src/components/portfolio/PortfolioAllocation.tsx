import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/formatVnd";
import {
  buildDonutGradient,
  orderSlicesForDisplay,
} from "@/lib/portfolioAllocation";
import type { PortfolioSlice } from "@/data/mockPortfolio";

type PortfolioAllocationProps = {
  slices: PortfolioSlice[];
  className?: string;
};

/** Larger when stacked (mobile); compact beside legend from md+ */
const donutSize =
  "h-44 w-44 min-[400px]:h-48 min-[400px]:w-48 md:h-48 md:w-48 lg:h-52 lg:w-52 xl:h-56 xl:w-56";

export function PortfolioAllocation({
  slices,
  className,
}: PortfolioAllocationProps) {
  const { t } = useTranslation();
  const assetLabel = (s: PortfolioSlice) =>
    t(`portfolio.assets.${s.key}`, { defaultValue: s.label });

  const orderedSlices = useMemo(() => orderSlicesForDisplay(slices), [slices]);
  const { gradient: donutBg } = useMemo(
    () => buildDonutGradient(slices),
    [slices],
  );

  const weightLegendSlices = useMemo(
    () => orderedSlices.filter((s) => s.percent > 0),
    [orderedSlices],
  );

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {/* Chart — own panel */}
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl",
          "border-0 bg-gradient-to-b from-surface-warm/60 to-surface-card/30 px-3 py-4 sm:px-6 sm:py-6 md:border md:border-surface-border md:px-10 md:py-8",
          "dark:from-zinc-800/50 dark:to-zinc-900/20",
        )}
      >
        <div
          className={cn(
            "flex w-full max-w-xl flex-col items-center gap-5",
            "md:flex-row md:flex-nowrap md:items-center md:justify-center md:gap-8 lg:gap-10",
          )}
        >
          <div className={cn("relative shrink-0", donutSize)}>
            {donutBg ? (
              <div
                className={cn(
                  "h-full w-full rounded-full",
                  "transition-transform duration-500 ease-out hover:scale-[1.03]",
                )}
                style={{ background: donutBg }}
              />
            ) : (
              <div className="h-full w-full rounded-full border border-dashed border-surface-border bg-surface-warm/40" />
            )}

            <div
              className={cn(
                "absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2",
                "rounded-full bg-surface-card",
              )}
              aria-hidden
            />
          </div>

          {weightLegendSlices.length > 0 && (
            <ul
              className={cn(
                "flex w-full max-w-md flex-col gap-2.5 text-text-primary",
                "text-sm min-[400px]:text-base",
                "md:min-w-0 md:max-w-none md:flex-1 md:gap-2 md:text-sm",
                "lg:min-w-[13rem]",
              )}
              aria-label={t("common.aria.allocationByWeight")}
            >
              {weightLegendSlices.map((s) => (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 border-b border-surface-border/50 pb-2.5 last:border-0 last:pb-0",
                    "md:border-0 md:pb-0",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="min-w-0 flex-1 font-medium md:truncate">
                    {assetLabel(s)}
                  </span>
                  <span className="shrink-0 tabular-nums text-text-secondary">
                    {s.percent.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* List — separate panel below */}
      <div
        className={cn(
          "mt-4 rounded-xl border border-surface-border border-t-2 border-t-brand-primary/25 sm:mt-6",
          "bg-surface-warm/30 px-3 py-4 sm:px-5 sm:py-5 md:px-6 dark:bg-zinc-900/40",
        )}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {t("portfolio.holdingBreakdown")}
        </p>

        {/* Mobile: stacked cards — no horizontal scroll */}
        <div className="flex flex-col gap-3 md:hidden">
          {orderedSlices.map((s, i) => {
            const hasSlice = s.percent > 0;
            return (
              <div
                key={s.key}
                className={cn(
                  "rounded-lg border border-surface-border/60 px-3 py-3",
                  hasSlice
                    ? "bg-surface-card/80 dark:bg-zinc-800/50"
                    : "bg-surface-warm/40 opacity-95 dark:bg-zinc-900/30",
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-surface-border/40 pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10",
                        !hasSlice && "opacity-50",
                      )}
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate font-medium text-text-primary">
                      {assetLabel(s)}
                    </span>
                  </div>
                  <span className="shrink-0 tabular-nums text-sm text-text-secondary">
                    {s.percent === 0 ? "0%" : `${s.percent.toFixed(2)}%`}
                  </span>
                </div>
                <dl className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1.5 text-xs min-[400px]:text-sm">
                  <dt className="text-text-secondary">
                    {t("portfolio.table.entry")}
                  </dt>
                  <dd className="text-right tabular-nums text-text-primary">
                    {formatVnd(s.entryPrice)}
                  </dd>
                  <dt className="text-text-secondary">
                    {t("portfolio.table.current")}
                  </dt>
                  <dd className="text-right tabular-nums text-text-primary">
                    {formatVnd(s.currentPrice)}
                  </dd>
                  <dt className="text-text-secondary">
                    {t("portfolio.table.return")}
                  </dt>
                  <dd className="text-right tabular-nums font-medium">
                    {s.returnPct == null ? (
                      <span className="text-text-secondary">—</span>
                    ) : (
                      <span
                        className={cn(
                          s.returnPct > 0 &&
                            "text-emerald-600 dark:text-emerald-400",
                          s.returnPct < 0 && "text-red-600 dark:text-red-400",
                          s.returnPct === 0 && "text-text-secondary",
                        )}
                      >
                        {s.returnPct > 0 ? "+" : ""}
                        {s.returnPct.toFixed(2)}%
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                <th className="px-2 py-2 pr-2">{t("portfolio.table.asset")}</th>
                <th className="px-2 py-2 text-right tabular-nums">
                  {t("portfolio.table.weight")}
                </th>
                <th className="px-2 py-2 text-right tabular-nums">
                  {t("portfolio.table.entry")}
                </th>
                <th className="px-2 py-2 text-right tabular-nums">
                  {t("portfolio.table.current")}
                </th>
                <th className="px-2 py-2 text-right tabular-nums">
                  {t("portfolio.table.return")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orderedSlices.map((s, i) => {
                const hasSlice = s.percent > 0;
                return (
                  <tr
                    key={s.key}
                    className={cn(
                      "border-b border-surface-border/60 transition-colors last:border-0",
                      hasSlice
                        ? "bg-surface-card/50 hover:bg-brand-primary/[0.04] dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70"
                        : "opacity-90 hover:bg-surface-warm/40 dark:hover:bg-zinc-800/30",
                    )}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10",
                            !hasSlice && "opacity-50",
                          )}
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="font-medium text-text-primary">
                          {assetLabel(s)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text-primary">
                      {s.percent === 0 ? "0%" : `${s.percent.toFixed(2)}%`}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text-primary">
                      {formatVnd(s.entryPrice)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text-primary">
                      {formatVnd(s.currentPrice)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums font-medium">
                      {s.returnPct == null ? (
                        <span className="text-text-secondary">—</span>
                      ) : (
                        <span
                          className={cn(
                            s.returnPct > 0 &&
                              "text-emerald-600 dark:text-emerald-400",
                            s.returnPct < 0 && "text-red-600 dark:text-red-400",
                            s.returnPct === 0 && "text-text-secondary",
                          )}
                        >
                          {s.returnPct > 0 ? "+" : ""}
                          {s.returnPct.toFixed(2)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
