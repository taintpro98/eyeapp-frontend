/**
 * Window events that let the chat drive the Vela chart without the two components
 * knowing about each other (same contract as the ta-agent web app).
 */

export type ChartCommand = {
  type: "hline" | "trendline" | "zone" | "fibretracement";
  price?: number;
  price_from?: number;
  price_to?: number;
  /** Epoch ms */
  time_from?: number;
  /** Epoch ms */
  time_to?: number;
  /** Semantic name (support / resistance / target / entry / neutral) or a hex colour. */
  color?: string;
  label?: string;
};

export type ChartIndicator = { type: string; inputs?: Record<string, number | string> };

export const CHART_COMMAND_EVENT = "chart:command";
export const CHART_INDICATOR_EVENT = "chart:indicator";

export function dispatchChartCommands(commands: ChartCommand[]) {
  window.dispatchEvent(new CustomEvent(CHART_COMMAND_EVENT, { detail: { commands } }));
}

export function dispatchChartIndicators(indicators: ChartIndicator[]) {
  window.dispatchEvent(new CustomEvent(CHART_INDICATOR_EVENT, { detail: { indicators } }));
}
