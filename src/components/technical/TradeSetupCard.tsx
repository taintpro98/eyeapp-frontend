import { useTranslation } from "react-i18next";
import { BarChart3, ChevronRight, Eye, ShieldAlert, Target, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { dispatchChartCommands } from "./chartBridge";

/** Mirrors the createTradeSetup tool output (api/_agent/tools.ts). */
export type TradeSetup = {
  ticker: string;
  direction: "long" | "short";
  entry: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2?: number;
  risk_reward_ratio: number;
  recommendation: "BUY" | "SELL" | "WATCH";
  reasoning: string;
};

const BADGE = {
  BUY: { className: "text-rating-5", Icon: TrendingUp },
  SELL: { className: "text-rating-1", Icon: TrendingDown },
  WATCH: { className: "text-rating-3", Icon: Eye },
} as const;

const price = (v: number) => v.toLocaleString("vi-VN");

/** Entry / stop-loss / take-profit plan produced by the assistant, with a one-click draw on the chart. */
export function TradeSetupCard({ setup }: { setup: TradeSetup }) {
  const { t } = useTranslation();
  const badge = BADGE[setup.recommendation] ?? BADGE.WATCH;

  const draw = () =>
    dispatchChartCommands([
      { type: "hline", price: setup.entry, color: "entry", label: `Entry ${price(setup.entry)}` },
      { type: "hline", price: setup.stop_loss, color: "resistance", label: `SL ${price(setup.stop_loss)}` },
      { type: "hline", price: setup.take_profit_1, color: "target", label: `TP1 ${price(setup.take_profit_1)}` },
      ...(setup.take_profit_2
        ? [{ type: "hline" as const, price: setup.take_profit_2, color: "target", label: `TP2 ${price(setup.take_profit_2)}` }]
        : []),
    ]);

  const rows = [
    { key: "entry", Icon: ChevronRight, value: setup.entry, className: "text-rating-3" },
    { key: "stopLoss", Icon: ShieldAlert, value: setup.stop_loss, className: "text-rating-1" },
    { key: "tp1", Icon: Target, value: setup.take_profit_1, className: "text-rating-5" },
    ...(setup.take_profit_2 ? [{ key: "tp2", Icon: Target, value: setup.take_profit_2, className: "text-rating-5" }] : []),
  ];

  return (
    <div className="my-2 rounded-lg border border-surface-border bg-surface-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", badge.className)}>
          <badge.Icon className="h-4 w-4" />
          {t(`technical.chat.trade.${setup.recommendation.toLowerCase()}`)}
        </span>
        <span className="text-base font-bold text-text-primary">{setup.ticker}</span>
      </div>
      <dl className="space-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-1.5">
            <row.Icon className={cn("h-3 w-3 shrink-0", row.className)} />
            <dt className="text-text-secondary">{t(`technical.chat.trade.${row.key}`)}</dt>
            <dd className={cn("ml-auto font-medium tabular-nums", row.className)}>{price(row.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-sm text-text-secondary">
        {t("technical.chat.trade.riskReward")}{" "}
        <span className="font-semibold text-text-primary">1 : {setup.risk_reward_ratio}</span>
      </p>
      {setup.reasoning && (
        <p className="mt-2 border-t border-surface-border pt-2 text-xs leading-relaxed text-text-secondary">{setup.reasoning}</p>
      )}
      <button
        type="button"
        onClick={draw}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-primary/30 bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-brand-primary/20"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        {t("technical.chat.trade.draw")}
      </button>
    </div>
  );
}
