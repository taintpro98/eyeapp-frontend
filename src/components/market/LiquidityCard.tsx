import { useTranslation } from "react-i18next";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { MarketOverview } from "@/api/markets";
import { SectionCard } from "@/components/SectionCard";
import { BreadthBar } from "@/components/MarketSnapshot";
import { useChartTheme } from "@/hooks/useChartTheme";
import { useMarketHistory } from "@/hooks/useMarketHistory";
import { cn } from "@/lib/utils";

const AVG_SESSIONS = 20;

/** Block ③ (vnstock): HOSE turnover against its 20-session average, plus today's breadth. */
export function LiquidityCard({
  marketId,
  overview,
  className,
}: {
  marketId: number;
  overview: MarketOverview;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const theme = useChartTheme();
  // VNINDEX turnover covers the whole HOSE floor; 3M comfortably holds 21 sessions.
  const { data } = useMarketHistory(marketId, "VNINDEX", "3M");

  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const billions = (v: number) => (v / 1e9).toLocaleString(locale, { maximumFractionDigits: 0 });

  const sessions = (data?.points ?? []).filter((p) => p.turnover != null);
  const recent = sessions.slice(-AVG_SESSIONS);
  // Average of the sessions before today, so today is compared against the past.
  const prior = sessions.slice(-AVG_SESSIONS - 1, -1);
  const avg = prior.length ? prior.reduce((sum, p) => sum + (p.turnover ?? 0), 0) / prior.length : null;
  const today = overview.turnover ?? null;
  const vsAvg = today != null && avg ? ((today - avg) / avg) * 100 : null;

  const bars = recent.map((p) => ({
    date: p.date.split("-").reverse().slice(0, 2).join("/"),
    value: (p.turnover ?? 0) / 1e9,
  }));

  return (
    <SectionCard title={t("market.liquidity.title")} className={className}>
      {today != null && (
        <div>
          <p className="text-xs text-text-secondary">{t("market.liquidity.turnover")}</p>
          <p className="text-2xl font-semibold tabular-nums text-text-primary">
            {t("dashboard.turnoverValue", { value: billions(today) })}
          </p>
          {vsAvg != null && avg != null && (
            <p className="mt-0.5 text-xs text-text-secondary">
              <span className={cn("font-semibold tabular-nums", vsAvg >= 0 ? "text-green-600" : "text-red-600")}>
                {vsAvg >= 0 ? "+" : ""}
                {vsAvg.toFixed(0)}%
              </span>{" "}
              {t("market.liquidity.vsAvg", { count: prior.length, value: billions(avg) })}
            </p>
          )}
        </div>
      )}

      {bars.length > 1 && (
        <div className="mt-3 h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <Tooltip
                cursor={{ fill: theme.cursor }}
                content={({ active, payload }) => {
                  const p = active && payload?.[0]?.payload;
                  if (!p) return null;
                  return (
                    <div className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs shadow-soft">
                      <span className="text-text-secondary">{p.date}</span>{" "}
                      <span className="font-semibold tabular-nums text-text-primary">
                        {t("dashboard.turnoverValue", { value: p.value.toLocaleString(locale, { maximumFractionDigits: 0 }) })}
                      </span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                {bars.map((b, i) => (
                  <Cell key={b.date} fill={i === bars.length - 1 ? theme.series[0] : theme.grid} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {overview.breadth && <BreadthBar breadth={overview.breadth} />}
    </SectionCard>
  );
}
