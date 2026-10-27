import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { fetchHistory, fetchSymbolInfo, searchSymbols, type UdfResolution } from "@/api/ta";
import { useThemeStore } from "@/store/useThemeStore";
import { CHART_COMMAND_EVENT, CHART_INDICATOR_EVENT, type ChartCommand, type ChartIndicator } from "./chartBridge";
import { cn } from "@/lib/utils";

/** Vela has no published typings for the workspace handle we use; keep the surface we touch explicit. */
type VelaWorkspaceHandle = {
  destroy(): void;
  setTheme(theme: "light" | "dark"): void;
  active: { setSymbol(symbol: string): void };
  chart: {
    data: { registerProvider(name: string, provider: unknown): void; ready(): Promise<void> };
    addNativeIndicator(type: string, options: { inputs: Record<string, unknown> }): void;
    indicators(): { remove(): void }[];
    drawings: {
      all(): { id: string }[];
      removeMany(ids: string[]): void;
      add(type: string, spec: Record<string, unknown>): void;
    };
    getVisibleRange(): { from: number; to: number } | null;
  };
};

type ChartColors = { up: string; down: string; ema10: string; ema50: string; volumeMa: string };

function cssColor(name: string): string {
  const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return channels ? `rgb(${channels.split(/\s+/).join(", ")})` : "#888888";
}

/** Candle and overlay colours from the brand tokens, read after the theme class is applied. */
function readColors(): ChartColors {
  return {
    up: cssColor("--rating-5"),
    down: cssColor("--rating-1"),
    ema10: cssColor("--chart-2"),
    ema50: cssColor("--chart-4"),
    volumeMa: cssColor("--chart-3"),
  };
}

/** Same default set as the ta-agent web app, so both products show the same picture. */
function defaultIndicators(colors: ChartColors) {
  return [
    { type: "volume", inputs: {} },
    { type: "ema", inputs: { length: 10, color: colors.ema10 } },
    { type: "ema", inputs: { length: 50, color: colors.ema50 } },
    { type: "bollinger-bands", inputs: {} },
    { type: "rsi", inputs: {} },
    { type: "macd", inputs: {} },
  ];
}

/** Where the chart state (drawings, symbol, timeframe) lives; the pre-2026-10-27 key held stale colours. */
const STORAGE_KEY = "alumieye-vela";
const LEGACY_STORAGE_KEY = "vela-workspace";

/**
 * Vela persists each chart's full renderer config (background, grid, separators) and
 * then treats it as a user override, so a chart saved in light mode keeps light
 * gridlines after the app switches to dark. Persist only what the user made —
 * drawings, symbol, timeframe — and let the theme and our default indicators drive
 * the rest on every load.
 */
const DERIVED_CHART_KEYS = ["rendererConfig", "indicators"];

function stripDerived(raw: string | null): string | null {
  if (!raw) return raw;
  try {
    const doc = JSON.parse(raw) as { charts?: Record<string, unknown>[] };
    for (const chart of doc.charts ?? []) {
      for (const key of DERIVED_CHART_KEYS) delete chart[key];
    }
    return JSON.stringify(doc);
  } catch {
    return null; // unreadable state: start fresh rather than crash the chart
  }
}

const chartStorage = {
  get(key: string): string | null {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return stripDerived(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      const cleaned = stripDerived(value);
      if (cleaned) localStorage.setItem(key, cleaned);
    } catch {
      // quota / privacy mode: drawings just won't survive a reload
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

/**
 * The assistant names a line's meaning, not a hex: map it onto the brand's market
 * colours so drawn levels match the candles in both themes. A raw hex still works.
 */
function resolveDrawColor(color: string | undefined): string {
  const semantic: Record<string, string> = {
    support: "--rating-5",
    target: "--rating-5",
    resistance: "--rating-1",
    entry: "--rating-3",
    neutral: "--brand-primary",
  };
  const trimmed = color?.trim() ?? "";
  const token = semantic[trimmed.toLowerCase()];
  if (token) return cssColor(token);
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed;
  return cssColor("--brand-primary");
}

/** Same identity rule as the ta-agent app: pane indicators by type, overlays by type + inputs. */
const PANE_INDICATORS = new Set(["rsi", "macd", "stochastic", "stoch-rsi", "cci", "williams-r", "mfi", "cmf", "obv", "adx", "atr", "volume"]);

function indicatorKey(type: string, inputs?: Record<string, unknown>): string {
  const kind = type.trim().toLowerCase();
  if (PANE_INDICATORS.has(kind)) return kind;
  const params = Object.entries(inputs ?? {})
    .filter(([key, value]) => value != null && !["color", "colour", "linewidth", "linestyle", "visible"].includes(key.toLowerCase()))
    .map(([key, value]) => `${key.toLowerCase()}=${String(value)}`)
    .sort();
  return params.length ? `${kind}(${params.join(",")})` : kind;
}

function drawCommand(ws: VelaWorkspaceHandle, cmd: ChartCommand) {
  const now = Date.now();
  const color = resolveDrawColor(cmd.color);
  const text = (hAlign: "left" | "center", vAlign: "bottom" | "center") =>
    cmd.label ? { value: cmd.label, size: "small", hAlign, vAlign } : undefined;

  if (cmd.type === "hline" && cmd.price != null) {
    ws.chart.drawings.add("hline", {
      anchors: [{ time: now, price: cmd.price }],
      style: { lineColor: color, lineWidth: 2, lineStyle: 0 },
      text: text("left", "bottom"),
    });
  } else if (cmd.type === "trendline" && cmd.price_from != null && cmd.price_to != null) {
    ws.chart.drawings.add("trendline", {
      anchors: [
        { time: cmd.time_from || now - 30 * 86_400_000, price: cmd.price_from },
        { time: cmd.time_to || now, price: cmd.price_to },
      ],
      style: { lineColor: color, lineWidth: 2, lineStyle: 0 },
      text: text("left", "bottom"),
    });
  } else if (cmd.type === "zone" && cmd.price_from != null && cmd.price_to != null) {
    const range = ws.chart.getVisibleRange();
    ws.chart.drawings.add("box", {
      anchors: [
        { time: range ? range.from : now - 60 * 86_400_000, price: cmd.price_from },
        { time: range ? range.to : now, price: cmd.price_to },
      ],
      style: { lineColor: color, lineWidth: 1, lineStyle: 0, fillColor: color, fillOpacity: 0.1 },
      text: text("center", "center"),
    });
  } else if (cmd.type === "fibretracement" && cmd.price_from != null && cmd.price_to != null) {
    ws.chart.drawings.add("fibretracement", {
      anchors: [
        { time: cmd.time_from || now - 60 * 86_400_000, price: cmd.price_from },
        { time: cmd.time_to || now, price: cmd.price_to },
      ],
    });
  }
}

const bareTicker = (raw: string) => (raw.includes(":") ? raw.split(":").pop()! : raw).toUpperCase();

/** Vela DataProvider over ta-agent's UDF feed (via the eyeapp-backend proxy). */
class TaAgentProvider {
  info() {
    return {
      name: "hose",
      displayName: "HOSE / HNX / UPCoM",
      supportedTimeframes: ["1", "15", "60", "D", "W", "M"] as readonly string[],
      capabilities: { enumerate: true, stream: false, symbolInfo: true },
    };
  }

  async listSymbols() {
    try {
      // An empty query lists every active symbol (~1,800 for the whole VN market).
      const items = await searchSymbols("", 3000);
      return items.map((s) => ({
        ticker: (s.symbol || s.ticker).toUpperCase(),
        description: s.description,
        type: "stock",
        prefix: s.exchange || "HOSE",
      }));
    } catch {
      return [];
    }
  }

  async getSymbolInfo(raw: string) {
    try {
      const info = await fetchSymbolInfo(bareTicker(raw));
      if (info.s === "error") return undefined;
      return {
        ticker: info.name,
        description: info.description,
        exchange: info.exchange,
        timezone: info.timezone,
        session: info.session,
        currency: info.currency_code,
        pricescale: info.pricescale,
      };
    } catch {
      return undefined;
    }
  }

  async getBars(raw: string, timeframe: string, range: { from?: number; to?: number; limit?: number }) {
    const resolution = (timeframe === "1W" ? "W" : timeframe === "1M" ? "M" : timeframe) as UdfResolution;
    // Vela speaks milliseconds, UDF seconds.
    const now = Math.floor(Date.now() / 1000);
    try {
      const data = await fetchHistory({
        symbol: bareTicker(raw),
        resolution,
        from: range.from ? Math.floor(range.from / 1000) : now - 86400 * 365 * 5,
        to: range.to ? Math.floor(range.to / 1000) : now,
        countback: range.limit || 500,
      });
      if (data.s !== "ok" || !data.t?.length) return [];
      return data.t.map((ts, i) => ({
        time: ts * 1000,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i] || 0,
      }));
    } catch {
      return [];
    }
  }
}

/** 20-bar volume moving average drawn over Vela's volume bars (Vela has no built-in one). */
let volumeMaRegistered = false;
let volumeMaColor = "#888888";

async function registerVolumeMa() {
  if (volumeMaRegistered) return;
  const { registerRendererLayer } = await import("@luxalgo/vela");
  registerRendererLayer({
    id: "volume-ma",
    placement: "above-data",
    create() {
      let canvas: HTMLCanvasElement | null = null;
      let ctx: CanvasRenderingContext2D | null = null;
      return {
        mount(c: HTMLCanvasElement) {
          canvas = c;
          ctx = c.getContext("2d");
        },
        destroy() {
          canvas = null;
          ctx = null;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vela's layer args are untyped at this entry point
        render({ bars, coords, bounds }: any) {
          if (!ctx || !canvas || !bars?.length || bounds.height <= 0) return;
          const dpr = coords.dpr || window.devicePixelRatio || 1;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

          const range = coords.visibleLogicalRange?.();
          if (!range) return;
          const i0 = Math.max(0, Math.floor(range.from));
          const i1 = Math.min(bars.length - 1, Math.ceil(range.to));
          if (i0 > i1) return;

          let maxVol = 0;
          for (let i = i0; i <= i1; i++) maxVol = Math.max(maxVol, bars[i]?.volume ?? 0);
          if (maxVol <= 0) return;

          const period = 20;
          const bottom = bounds.top + bounds.height;
          const maxH = bounds.height * 0.2; // volume bars use the bottom 20% of the pane

          ctx.save();
          ctx.beginPath();
          ctx.rect(0, bounds.top, coords.width, bounds.height);
          ctx.clip();
          ctx.beginPath();
          ctx.strokeStyle = volumeMaColor;
          ctx.lineWidth = 1.5;
          ctx.lineJoin = "round";
          let started = false;
          for (let i = Math.max(0, i0 - 1); i <= Math.min(bars.length - 1, i1 + 1); i++) {
            if (i < period - 1) continue;
            let sum = 0;
            for (let k = i - period + 1; k <= i; k++) sum += bars[k]?.volume || 0;
            const y = bottom - Math.min(bounds.height, (sum / period / maxVol) * maxH);
            const x = coords.logicalToX(i);
            if (started) ctx.lineTo(x, y);
            else {
              ctx.moveTo(x, y);
              started = true;
            }
          }
          ctx.stroke();
          ctx.restore();
        },
      };
    },
  });
  volumeMaRegistered = true;
}

type VelaChartProps = { ticker: string; className?: string };

function VelaChartInner({ ticker, className }: VelaChartProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<VelaWorkspaceHandle | null>(null);
  const colorsRef = useRef<ChartColors | null>(null);
  /** Indicators on the chart, by identity, so the assistant never stacks a second RSI pane. */
  const onChartRef = useRef(new Set<string>());
  // Read by init() without making the workspace depend on the theme (it is swapped live below).
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);

  const applyDefaults = useCallback((ws: VelaWorkspaceHandle) => {
    const colors = colorsRef.current ?? readColors();
    onChartRef.current = new Set();
    for (const ind of defaultIndicators(colors)) {
      try {
        ws.chart.addNativeIndicator(ind.type, { inputs: ind.inputs });
        onChartRef.current.add(indicatorKey(ind.type, ind.inputs));
      } catch (err) {
        console.warn("[VelaChart] default indicator failed:", ind.type, err);
      }
    }
  }, []);

  const clearIndicators = (ws: VelaWorkspaceHandle) => {
    try {
      for (const handle of ws.chart.indicators()) {
        try {
          handle.remove();
        } catch {
          // already gone
        }
      }
    } catch {
      // workspace not ready
    }
  };

  const handleReset = useCallback(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    clearIndicators(ws);
    try {
      const drawings = ws.chart.drawings.all();
      if (drawings.length) ws.chart.drawings.removeMany(drawings.map((d) => d.id));
    } catch {
      // no drawings
    }
    applyDefaults(ws);
  }, [applyDefaults]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) wrapperRef.current?.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Build the workspace once; theme and symbol changes are applied to it live below.
  useEffect(() => {
    let destroyed = false;
    setFailed(false);

    const init = async () => {
      const colors = readColors();
      colorsRef.current = colors;
      volumeMaColor = colors.volumeMa;
      try {
        await registerVolumeMa();
      } catch (err) {
        console.warn("[VelaChart] volume MA layer failed:", err);
      }

      const { VelaWorkspace } = await import("@luxalgo/vela/workspace");
      if (destroyed || !containerRef.current) return;

      const ws = new VelaWorkspace(containerRef.current, {
        // Seed the symbol so the first load never asks the provider for "" (Vela toasts an error).
        symbol: ticker.toUpperCase(),
        timeframe: "D",
        layout: false,
        theme: themeRef.current,
        upColor: colors.up,
        downColor: colors.down,
        drawings: true,
        drawingToolbar: true,
        currentPriceLine: true,
        animations: true,
        volume: true,
        watermark: true,
        timezone: "Asia/Ho_Chi_Minh",
        persist: STORAGE_KEY, // keeps the user's drawings across reloads (colours excluded, see chartStorage)
        storage: chartStorage,
        live: false,
      }) as unknown as VelaWorkspaceHandle;
      workspaceRef.current = ws;

      ws.chart.data.registerProvider("hose", new TaAgentProvider());
      await ws.chart.data.ready();
      if (destroyed) return;
      ws.active.setSymbol(ticker.toUpperCase());
      // persist: true restores the last saved canvas (background included), which would
      // override the theme option — re-assert the app theme now that the cell exists.
      ws.setTheme(themeRef.current);

      // Vela restores persisted indicators asynchronously; wait, then replace them with the
      // defaults so a reload never stacks a second RSI/MACD pane (drawings are kept).
      window.setTimeout(() => {
        if (destroyed) return;
        clearIndicators(ws);
        applyDefaults(ws);
      }, 500);
    };

    init().catch((err) => {
      console.error("[VelaChart] init failed:", err);
      if (!destroyed) setFailed(true);
    });

    return () => {
      destroyed = true;
      try {
        workspaceRef.current?.destroy();
      } catch {
        // already destroyed
      }
      workspaceRef.current = null;
    };
    // ticker and theme changes are handled below without rebuilding the workspace
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyDefaults]);

  // Chart bridge: drawings and indicators requested by the assistant (ChatPanel).
  useEffect(() => {
    const onCommand = (e: Event) => {
      const ws = workspaceRef.current;
      const commands = (e as CustomEvent<{ commands?: ChartCommand[] }>).detail?.commands;
      if (!ws || !commands) return;
      for (const cmd of commands) {
        try {
          drawCommand(ws, cmd);
        } catch (err) {
          console.warn("[VelaChart] drawing failed:", cmd, err);
        }
      }
    };
    const onIndicator = (e: Event) => {
      const ws = workspaceRef.current;
      const indicators = (e as CustomEvent<{ indicators?: ChartIndicator[] }>).detail?.indicators;
      if (!ws || !indicators) return;
      for (const ind of indicators) {
        const key = indicatorKey(ind.type, ind.inputs);
        if (onChartRef.current.has(key)) continue;
        try {
          ws.chart.addNativeIndicator(ind.type, { inputs: ind.inputs ?? {} });
          onChartRef.current.add(key);
        } catch (err) {
          console.warn("[VelaChart] indicator failed:", ind, err);
        }
      }
    };
    window.addEventListener(CHART_COMMAND_EVENT, onCommand);
    window.addEventListener(CHART_INDICATOR_EVENT, onIndicator);
    return () => {
      window.removeEventListener(CHART_COMMAND_EVENT, onCommand);
      window.removeEventListener(CHART_INDICATOR_EVENT, onIndicator);
    };
  }, []);

  // Follow the app's light/dark switch: Vela re-inks the chrome and every pane in place.
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return; // still initialising; init() applies themeRef itself
    // The .dark class is toggled by ThemeProvider's effect, which runs after this child's,
    // so read the token-based colours on the next frame.
    const frame = requestAnimationFrame(() => {
      volumeMaColor = readColors().volumeMa;
      try {
        ws.setTheme(theme);
      } catch (err) {
        console.warn("[VelaChart] theme swap failed:", err);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  useEffect(() => {
    try {
      workspaceRef.current?.active.setSymbol(ticker.toUpperCase());
    } catch {
      // workspace still initialising; init() sets the symbol itself
    }
  }, [ticker]);

  const buttonClass =
    "inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-card px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary";

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-card border border-surface-border bg-surface-card shadow-card",
        isFullscreen && "rounded-none",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-3 py-2">
        <span className="text-sm font-semibold text-text-primary">{t("technical.chart.title", { ticker })}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handleReset} title={t("technical.chart.resetHint")} className={buttonClass}>
            <RotateCcw className="h-3 w-3" />
            {t("technical.chart.reset")}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? t("technical.chart.exitFullscreen") : t("technical.chart.fullscreen")}
            className={buttonClass}
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            <span className="hidden sm:inline">
              {isFullscreen ? t("technical.chart.exitFullscreen") : t("technical.chart.fullscreen")}
            </span>
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="h-full w-full" />
        {failed && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-card text-sm text-text-secondary">
            {t("technical.chart.failed")}
          </div>
        )}
      </div>
    </div>
  );
}

export const VelaChart = memo(VelaChartInner);
