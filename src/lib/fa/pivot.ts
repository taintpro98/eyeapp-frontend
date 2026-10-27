import type { MetricSeries } from "@/api/fa";
import { comparePeriods, formatPeriodLabel, periodSortKey } from "./period";

/** One row per period, keyed by metric code (REVENUE, NPAT, …) plus derived fields. */
export type FinancialRow = {
  period: string;
  label: string;
  [metric: string]: number | string | null | undefined;
};

/**
 * Merge several series lists (e.g. QUARTER + POINT_IN_TIME) without mutating
 * the inputs — they are React Query cache entries. The first list wins when a
 * metric/period pair appears twice.
 */
export function mergeSeries(...lists: (MetricSeries[] | null | undefined)[]): MetricSeries[] {
  const byMetric = new Map<string, Map<string, MetricSeries["values"][number]>>();
  for (const list of lists) {
    for (const series of list ?? []) {
      if (!series?.metricCode) continue;
      let periods = byMetric.get(series.metricCode);
      if (!periods) {
        periods = new Map();
        byMetric.set(series.metricCode, periods);
      }
      for (const point of series.values ?? []) {
        if (point?.period && !periods.has(point.period)) periods.set(point.period, point);
      }
    }
  }
  return Array.from(byMetric, ([metricCode, periods]) => ({
    metricCode,
    unit: "",
    values: Array.from(periods.values()),
  }));
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Vietnamese shares have a 10,000 VND par value, so charter capital / 10,000 = shares outstanding. */
const PAR_VALUE_VND = 10_000;

/** Rows carrying at least one of these come from a filed report (not just a price snapshot). */
const STATEMENT_METRICS = ["REVENUE", "NPAT", "TOTAL_ASSETS", "TOTAL_EQUITY", "CFO"];

const isQuarter = (period: string) => /^\d{4}[-_]?Q[1-4]$/i.test(period);

/** Point-in-time fields derived from a single row, only filled when the source metric is missing. */
function derive(row: FinancialRow) {
  const revenue = num(row.REVENUE);
  const ratio = (part: unknown) => {
    const p = num(part);
    return revenue && p != null ? (p / revenue) * 100 : null;
  };

  row.GROSS_MARGIN ??= ratio(row.GROSS_PROFIT);
  row.OPERATING_MARGIN ??= ratio(row.OPERATING_PROFIT);
  row.NET_MARGIN ??= ratio(row.NPAT);

  const totalAssets = num(row.TOTAL_ASSETS);
  const currentAssets = num(row.CURRENT_ASSETS);
  if (row.NON_CURRENT_ASSETS == null && totalAssets != null && currentAssets != null) {
    row.NON_CURRENT_ASSETS = Math.max(0, totalAssets - currentAssets);
  }

  const totalLiabilities = num(row.TOTAL_LIABILITIES);
  const currentLiabilities = num(row.CURRENT_LIABILITIES);
  if (row.LONG_TERM_LIABILITIES == null && totalLiabilities != null && currentLiabilities != null) {
    row.LONG_TERM_LIABILITIES = Math.max(0, totalLiabilities - currentLiabilities);
  }

  const equity = num(row.TOTAL_EQUITY);
  // Same definition as ta-agent's DEBT_TO_EQUITY (interest-bearing debt, not all liabilities),
  // so the chart agrees with the key-metric card; total liabilities only as a last resort.
  const stDebt = num(row.SHORT_TERM_DEBT);
  const ltDebt = num(row.LONG_TERM_DEBT);
  const debt = stDebt != null || ltDebt != null ? (stDebt ?? 0) + (ltDebt ?? 0) : totalLiabilities;
  // Banks/insurers report zero net revenue here and no meaningful debt split.
  if (row.DEBT_TO_EQUITY == null && revenue && debt != null && equity && equity > 0) {
    row.DEBT_TO_EQUITY = debt / equity;
  }
  if (row.CURRENT_RATIO == null && currentAssets != null && currentLiabilities && currentLiabilities > 0) {
    row.CURRENT_RATIO = currentAssets / currentLiabilities;
  }

  // P/B per quarter from the period-end close; matches ta-agent's PB where both exist.
  const price = num(row.CLOSE_PRICE);
  const charter = num(row.CHARTER_CAPITAL);
  if (row.PB == null && price != null && equity && equity > 0 && charter && charter > 0) {
    row.PB = price / (equity / (charter / PAR_VALUE_VND));
  }
}

/**
 * Trailing-twelve-month ROE/ROA, the way ta-agent computes them: last 4 quarters
 * of NPAT (parent share when reported) over the average of this and the
 * year-ago balance. A single quarter's profit over equity reads ~4x too low.
 */
function deriveTtm(rows: FinancialRow[]) {
  const npat = (row: FinancialRow) => num(row.NPAT_PARENT) ?? num(row.NPAT);
  rows.forEach((row, i) => {
    if (i < 3 || !isQuarter(row.period)) return;
    const window = rows.slice(i - 3, i + 1);
    // Only consecutive quarters: a gap in the reports would silently shrink the sum.
    if (periodSortKeyGap(window) !== 3) return;
    const profits = window.map(npat);
    if (profits.some((p) => p == null)) return;
    const ttm = (profits as number[]).reduce((a, b) => a + b, 0);

    const yearAgo = i >= 4 ? rows[i - 4] : undefined;
    const avg = (metric: string) => {
      const now = num(row[metric]);
      if (now == null) return null;
      const before = yearAgo ? num(yearAgo[metric]) : null;
      return before == null ? now : (now + before) / 2;
    };

    const equity = avg("TOTAL_EQUITY");
    const assets = avg("TOTAL_ASSETS");
    if (row.ROE == null && equity && equity > 0) row.ROE = (ttm / equity) * 100;
    if (row.ROA == null && assets && assets > 0) row.ROA = (ttm / assets) * 100;
  });
}

/** Number of quarter steps between the first and last row of a window. */
function periodSortKeyGap(window: FinancialRow[]): number {
  const index = (p: string) => {
    const k = periodSortKey(p);
    return Math.floor(k / 10) * 4 + (k % 10);
  };
  return index(window[window.length - 1].period) - index(window[0].period);
}

/**
 * Pivot metric series into chronologically sorted rows ready for Recharts.
 * When quarterly data exists, stray annual points (ta-agent mixes a yearly NPAT
 * into the quarter series) are dropped, as are trailing quarters that only have
 * a price — they would leave an empty column at the end of every chart.
 */
export function pivotFinancials(series: MetricSeries[] | null | undefined): FinancialRow[] {
  const byPeriod = new Map<string, FinancialRow>();

  for (const s of series ?? []) {
    if (!s?.metricCode) continue;
    for (const point of s.values ?? []) {
      if (!point?.period) continue;
      let row = byPeriod.get(point.period);
      if (!row) {
        row = { period: point.period, label: formatPeriodLabel(point.period) };
        byPeriod.set(point.period, row);
      }
      row[s.metricCode] = point.value;
    }
  }

  let rows = Array.from(byPeriod.values()).sort((a, b) => comparePeriods(a.period, b.period));
  if (rows.some((r) => isQuarter(r.period))) rows = rows.filter((r) => isQuarter(r.period));

  const hasStatement = (r: FinancialRow) => STATEMENT_METRICS.some((m) => num(r[m]) != null);
  if (rows.some(hasStatement)) {
    while (rows.length && !hasStatement(rows[rows.length - 1])) rows.pop();
  }

  rows.forEach(derive);
  deriveTtm(rows);
  return rows;
}

/** Latest non-null value of a metric across rows (rows sorted oldest → newest). */
export function latestValue(rows: FinancialRow[], metric: string): number | null {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const v = num(rows[i][metric]);
    if (v != null) return v;
  }
  return null;
}
