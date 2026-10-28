import { useId } from "react";
import type { MarketQuote } from "@/api/markets";
import { useMarketHistory } from "@/hooks/useMarketHistory";
import { ChangePct } from "@/components/MarketSnapshot";
import { formatQuote, quoteLabel } from "@/lib/marketFormat";
import { cn } from "@/lib/utils";

/**
 * Tiny intraday line (5-minute bars of the latest session; last 24h for crypto) — the same
 * window as the card's %, so its colour always matches it. The dashed line is the reference
 * price (previous close): above it the session is up, below it down.
 */
function Sparkline({ values, reference, up }: { values: number[]; reference: number; up: boolean }) {
  // One gradient per card: several sparklines share the page, so ids must not collide.
  const gradientId = useId();
  if (values.length < 2) return <div className="h-8" />;
  const min = Math.min(reference, ...values);
  const max = Math.max(reference, ...values);
  const span = max - min || 1;
  const y = (v: number) => 30 - ((v - min) / span) * 28 - 1;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${y(v)}`).join(" ");
  const color = up ? "rgb(34 197 94)" : "rgb(239 68 68)"; // green-500 / red-500, as the line
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Shade from the line down to the bottom edge. */}
      <polygon points={`0,30 ${points} 100,30`} fill={`url(#${gradientId})`} />
      <line
        x1={0}
        x2={100}
        y1={y(reference)}
        y2={y(reference)}
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
        className="stroke-text-secondary/40"
      />
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className={up ? "stroke-green-500" : "stroke-red-500"}
      />
    </svg>
  );
}

function IndexCard({
  marketId,
  quote,
  isCrypto,
  selected,
  onSelect,
}: {
  marketId: number;
  quote: MarketQuote;
  isCrypto: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { data } = useMarketHistory(marketId, quote.code, "1D");
  const closes = data?.points.map((p) => p.close) ?? [];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-card border bg-surface-card p-4 text-left shadow-card transition-shadow hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:p-5",
        selected ? "border-brand-primary ring-1 ring-brand-primary/40" : "border-surface-border",
      )}
    >
      <p className="text-xs font-medium text-text-secondary sm:text-sm">{quoteLabel(quote.code)}</p>
      <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-text-primary sm:text-2xl">
        {formatQuote(quote, isCrypto)}
      </p>
      <p className="text-xs sm:text-sm">
        <ChangePct value={quote.change_pct} />
      </p>
      <div className="mt-2">
        <Sparkline values={closes} reference={quote.value - quote.change} up={quote.change_pct >= 0} />
      </div>
    </button>
  );
}

/** Block ①: every index/coin with its session change and intraday sparkline; picks the chart's symbol. */
export function IndexStrip({
  marketId,
  quotes,
  isCrypto,
  selected,
  onSelect,
}: {
  marketId: number;
  quotes: MarketQuote[];
  isCrypto: boolean;
  selected: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {quotes.map((q) => (
        <IndexCard
          key={q.code}
          marketId={marketId}
          quote={q}
          isCrypto={isCrypto}
          selected={q.code === selected}
          onSelect={() => onSelect(q.code)}
        />
      ))}
    </div>
  );
}
