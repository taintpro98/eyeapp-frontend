import {
  formatMultipleAxis,
  formatMultiple,
  formatPct,
  formatPctAxis,
  formatPriceAxis,
  formatVnd,
  formatVndAxis,
  formatVndTooltip,
} from "@/lib/fa/format";

export type ValueKind = "vnd" | "pct" | "multiple" | "price";

export type SeriesSpec = {
  /** Metric code in the pivoted rows. */
  dataKey: string;
  /** i18n key for the legend / tooltip label. */
  labelKey: string;
  /** Index into the chart theme palette. */
  color: 0 | 1 | 2 | 3 | 4;
  type: "bar" | "line";
  stackId?: string;
  /** For dual-axis charts: which axis the series is drawn on. */
  axis?: "left" | "right";
};

export type ReferenceSpec = { y: number; labelKey?: string; axis?: "left" | "right"; tone?: "zero" | "accent" };

export type ChartSpec = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  emptyKey: string;
  left: ValueKind;
  /** Present for dual-axis charts. */
  right?: ValueKind;
  series: SeriesSpec[];
  references?: ReferenceSpec[];
};

export const AXIS_FORMAT: Record<ValueKind, (v: number) => string> = {
  vnd: formatVndAxis,
  pct: formatPctAxis,
  multiple: formatMultipleAxis,
  price: formatPriceAxis,
};

export const TOOLTIP_FORMAT: Record<ValueKind, (v: number | null | undefined) => string> = {
  vnd: formatVndTooltip,
  pct: (v) => formatPct(v, { signed: true, digits: 2 }),
  multiple: (v) => formatMultiple(v),
  price: formatVnd,
};

/** The 8 financial statement charts. Metric codes follow ta-agent's MetricCode catalog. */
export const FINANCIAL_CHARTS: ChartSpec[] = [
  {
    id: "revenue-profit",
    titleKey: "fa.charts.revenueProfit.title",
    subtitleKey: "fa.charts.revenueProfit.subtitle",
    emptyKey: "fa.charts.empty",
    left: "vnd",
    series: [
      { dataKey: "REVENUE", labelKey: "fa.metric.REVENUE", color: 0, type: "bar" },
      { dataKey: "GROSS_PROFIT", labelKey: "fa.metric.GROSS_PROFIT", color: 1, type: "bar" },
      { dataKey: "NPAT", labelKey: "fa.metric.NPAT", color: 2, type: "bar" },
    ],
  },
  {
    id: "margins",
    titleKey: "fa.charts.margins.title",
    subtitleKey: "fa.charts.margins.subtitle",
    emptyKey: "fa.charts.empty",
    left: "pct",
    series: [
      { dataKey: "GROSS_MARGIN", labelKey: "fa.metric.GROSS_MARGIN", color: 0, type: "line" },
      { dataKey: "OPERATING_MARGIN", labelKey: "fa.metric.OPERATING_MARGIN", color: 1, type: "line" },
      { dataKey: "NET_MARGIN", labelKey: "fa.metric.NET_MARGIN", color: 2, type: "line" },
    ],
    references: [{ y: 0, tone: "zero" }],
  },
  {
    id: "assets",
    titleKey: "fa.charts.assets.title",
    subtitleKey: "fa.charts.assets.subtitle",
    emptyKey: "fa.charts.empty",
    left: "vnd",
    series: [
      { dataKey: "CURRENT_ASSETS", labelKey: "fa.metric.CURRENT_ASSETS", color: 0, type: "bar", stackId: "assets" },
      { dataKey: "NON_CURRENT_ASSETS", labelKey: "fa.metric.NON_CURRENT_ASSETS", color: 3, type: "bar", stackId: "assets" },
    ],
  },
  {
    id: "capital",
    titleKey: "fa.charts.capital.title",
    subtitleKey: "fa.charts.capital.subtitle",
    emptyKey: "fa.charts.empty",
    left: "vnd",
    series: [
      { dataKey: "CURRENT_LIABILITIES", labelKey: "fa.metric.CURRENT_LIABILITIES", color: 4, type: "bar", stackId: "capital" },
      { dataKey: "LONG_TERM_LIABILITIES", labelKey: "fa.metric.LONG_TERM_LIABILITIES", color: 1, type: "bar", stackId: "capital" },
      { dataKey: "TOTAL_EQUITY", labelKey: "fa.metric.TOTAL_EQUITY", color: 0, type: "bar", stackId: "capital" },
    ],
  },
  {
    id: "cashflow",
    titleKey: "fa.charts.cashflow.title",
    subtitleKey: "fa.charts.cashflow.subtitle",
    emptyKey: "fa.charts.empty",
    left: "vnd",
    series: [
      { dataKey: "CFO", labelKey: "fa.metric.CFO", color: 0, type: "bar" },
      { dataKey: "CFI", labelKey: "fa.metric.CFI", color: 1, type: "bar" },
      { dataKey: "CFF", labelKey: "fa.metric.CFF", color: 2, type: "bar" },
    ],
    references: [{ y: 0, tone: "zero" }],
  },
  {
    id: "leverage",
    titleKey: "fa.charts.leverage.title",
    subtitleKey: "fa.charts.leverage.subtitle",
    emptyKey: "fa.charts.empty",
    left: "multiple",
    series: [
      { dataKey: "DEBT_TO_EQUITY", labelKey: "fa.metric.DEBT_TO_EQUITY", color: 4, type: "line" },
      { dataKey: "CURRENT_RATIO", labelKey: "fa.metric.CURRENT_RATIO", color: 2, type: "line" },
    ],
    references: [{ y: 1, labelKey: "fa.charts.leverage.reference", tone: "accent" }],
  },
  {
    id: "valuation",
    titleKey: "fa.charts.valuation.title",
    subtitleKey: "fa.charts.valuation.subtitle",
    emptyKey: "fa.charts.empty",
    left: "price",
    right: "multiple",
    series: [
      { dataKey: "PB", labelKey: "fa.metric.PB", color: 1, type: "line", axis: "right" },
      { dataKey: "CLOSE_PRICE", labelKey: "fa.metric.CLOSE_PRICE", color: 0, type: "line", axis: "left" },
    ],
  },
  {
    id: "efficiency",
    titleKey: "fa.charts.efficiency.title",
    subtitleKey: "fa.charts.efficiency.subtitle",
    emptyKey: "fa.charts.empty",
    left: "pct",
    series: [
      { dataKey: "ROE", labelKey: "fa.metric.ROE", color: 0, type: "line" },
      { dataKey: "ROA", labelKey: "fa.metric.ROA", color: 2, type: "line" },
    ],
    references: [{ y: 0, tone: "zero" }],
  },
];
