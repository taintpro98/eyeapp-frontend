import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CandlestickChart, LineChart } from "lucide-react";
import type { Vela } from "@luxalgo/vela";
import type { HistoryRange, MarketHistoryPoint } from "@/api/markets";
import { SectionCard } from "@/components/SectionCard";
import { ChangePct } from "@/components/MarketSnapshot";
import { useMarketHistory } from "@/hooks/useMarketHistory";
import { useThemeStore } from "@/store/useThemeStore";
import { quoteLabel } from "@/lib/marketFormat";
import { cn } from "@/lib/utils";

const RANGES: HistoryRange[] = ["1D", "1M", "3M", "1Y", "5Y"];
type ChartKind = "line" | "candle";

/** Bar size the backend returns per range (5-minute intraday, weekly for 5Y, daily otherwise). */
const TIMEFRAME: Record<HistoryRange, string> = { "1D": "5", "1M": "D", "3M": "D", "1Y": "D", "5Y": "W" };
const PRICE_STYLE: Record<ChartKind, string> = { line: "area", candle: "candles" };

function cssColor(name: string): string {
  const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return channels ? `rgb(${channels.split(/\s+/).join(", ")})` : "#888888";
}

type Bar = ReturnType<typeof toBars>[number];

/**
 * Frame exactly the bars the backend returned (it already trimmed them to the range).
 * Vela applies its own default window once history is painted, so wait for that first.
 */
async function frameAll(chart: Vela, bars: Bar[]) {
  if (bars.length < 2) return;
  await chart.historyComplete();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  chart.setVisibleRange({ from: bars[0].time, to: bars[bars.length - 1].time });
}

function toBars(points: MarketHistoryPoint[]) {
  return points.map((p) => ({
    time: p.time * 1000, // Vela speaks milliseconds
    open: p.open || p.close,
    high: p.high || p.close,
    low: p.low || p.close,
    close: p.close,
    volume: p.volume || 0,
  }));
}

/**
 * Block ②: price chart of the selected index/coin on Vela's core chart (the same
 * engine as the asset page's workspace, without its toolbar): real time axis,
 * crosshair with price labels, zoom/pan and volume. Bars come from
 * `/markets/{id}/history`; the chart runs offline on them. Hidden on error.
 */
export function IndexChart({
  marketId,
  code,
  isCrypto,
  className,
}: {
  marketId: number;
  code: string;
  isCrypto: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const [range, setRange] = useState<HistoryRange>("3M");
  const [kind, setKind] = useState<ChartKind>("line");
  const [failed, setFailed] = useState(false);
  const { data, isLoading, isError } = useMarketHistory(marketId, code, range);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Vela | null>(null);
  /** Bars currently on the chart, to re-frame them after a resize. */
  const barsRef = useRef<Bar[]>([]);
  // Latest props for the async init, which must not re-run when they change.
  const latest = useRef({ data, range, kind, theme, code, isCrypto });
  latest.current = { data, range, kind, theme, code, isCrypto };

  // Create the chart once the first bars arrive: Vela only adds its volume pane when the
  // initial dataset carries volume. Later changes are applied in place below.
  const hasData = !!data;
  useEffect(() => {
    if (!hasData) return;
    let destroyed = false;
    (async () => {
      const { Vela } = await import("@luxalgo/vela");
      if (destroyed || !containerRef.current) return;
      const cur = latest.current;
      const bars = toBars(cur.data?.points ?? []);
      barsRef.current = bars;
      const chart = new Vela(containerRef.current, {
        symbol: cur.code,
        timeframe: TIMEFRAME[cur.range],
        data: bars,
        theme: cur.theme,
        upColor: cssColor("--rating-5"),
        downColor: cssColor("--rating-1"),
        priceStyle: PRICE_STYLE[cur.kind],
        volume: true,
        currentPriceLine: true,
        drawings: false, // a glance chart: no drawing toolbar
        live: false,
      });
      chartRef.current = chart;
      chart.renderer.set({
        timezone: cur.isCrypto ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Asia/Ho_Chi_Minh",
        countdown: false, // static history: a bar-close countdown means nothing
      });
      // The Vela logomark stays on: its NOTICE requires a visible attribution.
      await chart.ready();
      if (!destroyed) await frameAll(chart, bars);
    })().catch((err) => {
      console.error("[IndexChart] init failed:", err);
      if (!destroyed) setFailed(true);
    });
    return () => {
      destroyed = true;
      try {
        chartRef.current?.destroy();
      } catch {
        // already destroyed
      }
      chartRef.current = null;
    };
  }, [hasData]);

  // New bars (code or range changed, or a refetch landed).
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data) return;
    const bars = toBars(data.points);
    barsRef.current = bars;
    chart
      .setMarket({ symbol: code, timeframe: TIMEFRAME[range], data: bars })
      .then(() => (chartRef.current === chart ? frameAll(chart, bars) : undefined))
      .catch((err) => console.warn("[IndexChart] setMarket failed:", err));
  }, [data, code, range]);

  // Vela keeps the bar width when its container narrows or widens (sidebar toggle, window
  // resize, phone rotation), which would crop the oldest bars: re-frame the whole range.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let width = el.clientWidth;
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const chart = chartRef.current;
        const bars = barsRef.current;
        if (chart && bars.length > 1) chart.setVisibleRange({ from: bars[0].time, to: bars[bars.length - 1].time });
      }, 200);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    chartRef.current?.renderer.set("priceStyle", PRICE_STYLE[kind]);
  }, [kind]);

  useEffect(() => {
    chartRef.current?.setTheme(theme);
  }, [theme]);

  if ((isError && !data) || failed) return null;

  const points = data?.points ?? [];
  const first = points[0];
  const last = points[points.length - 1];
  // Change over the shown period: from the first bar's open (or close) to the last close.
  const base = first ? first.open || first.close : 0;
  const periodPct = base && last ? ((last.close - base) / base) * 100 : null;
  const rangeChangeKey = range === "1D" ? (isCrypto ? "1Dcrypto" : "1Dstocks") : range;

  return (
    <SectionCard
      title={t("market.chart.title", { name: quoteLabel(code) })}
      subtitle={
        periodPct != null ? (
          <span>
            {t(`market.chart.rangeChange.${rangeChangeKey}`)} <ChangePct value={periodPct} />
          </span>
        ) : undefined
      }
      headerAction={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-surface-border p-0.5" role="group" aria-label={t("market.chart.kindLabel")}>
            {(["line", "candle"] as const).map((k) => {
              const Icon = k === "line" ? LineChart : CandlestickChart;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={k === kind}
                  title={t(`market.chart.kind.${k}`)}
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors",
                    k === kind ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="sr-only">{t(`market.chart.kind.${k}`)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex rounded-lg border border-surface-border p-0.5" role="tablist">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === range}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  r === range ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t(`market.chart.ranges.${r}`)}
              </button>
            ))}
          </div>
        </div>
      }
      className={className}
    >
      <div className="relative h-[320px] w-full overflow-hidden rounded-lg">
        <div ref={containerRef} className="absolute inset-0" />
        {isLoading && <div className="absolute inset-0 animate-pulse bg-surface-border/40" />}
      </div>
    </SectionCard>
  );
}
