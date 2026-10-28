import { useTranslation } from "react-i18next";
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { ForeignFlow, ForeignStock } from "@/api/markets";
import { SectionCard } from "@/components/SectionCard";
import { SymbolLink } from "@/components/SymbolLink";
import { useChartTheme } from "@/hooks/useChartTheme";
import { cn } from "@/lib/utils";

const UP = "rgb(34 197 94)";
const DOWN = "rgb(239 68 68)";

/** Block ⑤ (vnstock): HOSE foreign net flow today, its 20-session history and the top net buyers/sellers. */
export function ForeignFlowCard({ flow, className }: { flow: ForeignFlow; className?: string }) {
  const { t, i18n } = useTranslation();
  const theme = useChartTheme();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const billions = (v: number, signed = false) =>
    `${signed && v > 0 ? "+" : ""}${(v / 1e9).toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  const tyDong = (v: number, signed = false) => t("dashboard.turnoverValue", { value: billions(v, signed) });

  const { latest } = flow;
  const bars = flow.history.map((h) => ({
    date: h.date.split("-").reverse().slice(0, 2).join("/"),
    value: h.net_value / 1e9,
  }));
  const [d, m] = latest.date.split("-").reverse();

  // One scale for both lists, so a buyer's bar and a seller's bar compare directly.
  const maxAbs = Math.max(1, ...[...latest.top_buy, ...latest.top_sell].map((s) => Math.abs(s.net_value)));

  const list = (items: ForeignStock[], tone: "buy" | "sell") => (
    <div>
      <p className={cn("mb-1.5 text-xs font-medium text-text-secondary", tone === "buy" && "text-right")}>
        {t(`market.foreign.top.${tone}`)}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-text-secondary">—</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((s) => (
            // Mirror image across the card's centre: buyers read "value · bar · code",
            // sellers "code · bar · value", so both bars grow outwards from the middle.
            <li
              key={s.code}
              className={cn(
                "grid items-center gap-2 text-sm",
                tone === "buy" ? "grid-cols-[auto_1fr_3rem]" : "grid-cols-[3rem_1fr_auto]",
              )}
            >
              {tone === "sell" && <SymbolLink symbol={s.code} className="font-semibold text-text-primary" />}
              {tone === "buy" && (
                <span className="w-12 tabular-nums text-green-600">{billions(s.net_value, true)}</span>
              )}
              <div
                className={cn(
                  "flex h-2 overflow-hidden rounded-full bg-surface-border/50",
                  tone === "buy" && "justify-end",
                )}
              >
                <div
                  className={cn("h-full rounded-full", tone === "buy" ? "bg-green-500" : "bg-red-500")}
                  style={{ width: `${(Math.abs(s.net_value) / maxAbs) * 100}%` }}
                />
              </div>
              {tone === "buy" && (
                <SymbolLink symbol={s.code} className="justify-self-end font-semibold text-text-primary" />
              )}
              {tone === "sell" && (
                <span className="w-12 text-right tabular-nums text-red-600">{billions(s.net_value, true)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <SectionCard
      title={t("market.foreign.title")}
      subtitle={t("market.foreign.subtitle", { date: `${d}/${m}` })}
      className={className}
    >
      <p className="text-xs text-text-secondary">{t("market.foreign.net")}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", latest.net_value >= 0 ? "text-green-600" : "text-red-600")}>
        {tyDong(latest.net_value, true)}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">
        {t("market.foreign.buySell", { buy: billions(latest.buy_value), sell: billions(latest.sell_value) })}
      </p>

      {bars.length > 1 && (
        <div className="mt-3 h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <ReferenceLine y={0} stroke={theme.grid} />
              <Tooltip
                cursor={{ fill: theme.cursor }}
                content={({ active, payload }) => {
                  const p = active && payload?.[0]?.payload;
                  if (!p) return null;
                  return (
                    <div className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs shadow-soft">
                      <span className="text-text-secondary">{p.date}</span>{" "}
                      <span className={cn("font-semibold tabular-nums", p.value >= 0 ? "text-green-600" : "text-red-600")}>
                        {t("dashboard.turnoverValue", {
                          value: `${p.value > 0 ? "+" : ""}${p.value.toLocaleString(locale, { maximumFractionDigits: 0 })}`,
                        })}
                      </span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[2, 2, 2, 2]} isAnimationActive={false}>
                {bars.map((b) => (
                  <Cell key={b.date} fill={b.value >= 0 ? UP : DOWN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-1 text-xs text-text-secondary">{t("market.foreign.history", { count: bars.length })}</p>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
        {list(latest.top_buy, "buy")}
        {list(latest.top_sell, "sell")}
      </div>
    </SectionCard>
  );
}
