import { taAgentFetch } from "@/lib/taAgent";

/**
 * Fundamental analysis (FA) data from ta-agent `/api/fa/*`, reached through the
 * eyeapp-backend proxy (see lib/taAgent).
 * Shapes mirror ta-agent's routers/services (the source of truth), which differ
 * from the older fundamental-ui types in places (benchmark field names,
 * priceSource values, extra screener columns).
 */

export type FaRatingCode = "STRONG_FA" | "GOOD_FA" | "FAIR_FA" | "WEAK_FA" | "POOR_FA";

export type ScreenerItem = {
  ticker: string;
  companyName: string | null;
  exchange: string | null;
  industry: string | null;
  overallScore: number | null;
  rating: FaRatingCode | string | null;
  growthScore: number | null;
  profitabilityScore: number | null;
  valuationScore: number | null;
  solvencyScore: number | null;
  cashflowScore: number | null;
  peTtm: number | null;
  pb: number | null;
  revenueYoy: number | null;
  npatYoy: number | null;
  netMargin: number | null;
  roe: number | null;
};

export type ScreenerResponse = {
  items: ScreenerItem[];
  totalCount: number;
  period: string | null;
  page: number;
  pageSize: number;
};

/** Columns ta-agent can sort on server-side (SORT_COLUMN_MAP). */
export type ScreenerSortField =
  | "overallScore"
  | "peTtm"
  | "pb"
  | "roe"
  | "revenueYoy"
  | "npatYoy"
  | "netMargin"
  | "growthScore"
  | "profitabilityScore"
  | "valuationScore";

export type ScreenerParams = {
  period?: string;
  rating?: string;
  minScore?: number;
  exchange?: string;
  watchedOnly?: boolean;
  sortBy?: ScreenerSortField;
  sortDir?: "asc" | "desc";
  /** 0-based */
  page?: number;
  pageSize?: number;
};

export type RatioEntry = { value: number | null; quality_status?: string | null };

export type TickerOverview = {
  ticker: string;
  companyName: string | null;
  industry: string | null;
  exchange: string | null;
  period: string | null;
  price: number | null;
  /** "VPS" realtime, "DB" close price from statements, "NONE" */
  priceSource: string;
  faScore: number | null;
  rating: FaRatingCode | string | null;
  dataQuality: string | null;
  growthScore: number | null;
  profitabilityScore: number | null;
  valuationScore: number | null;
  stabilityScore: number | null;
  solvencyScore: number | null;
  cashflowScore: number | null;
  dataQualityScore: number | null;
  highlights: string[];
  warnings: string[];
  ratios?: Record<string, RatioEntry>;
  peTtm?: number | null;
  pb?: number | null;
  marketCap?: number | null;
};

export type MetricDataPoint = { period: string; value: number | null; quality?: string | null };
export type MetricSeries = { metricCode: string; unit: string; values: MetricDataPoint[] };

export type FinancialsPeriodType = "QUARTER" | "YEAR" | "POINT_IN_TIME";

export type TickerFinancials = {
  ticker: string;
  periodType: FinancialsPeriodType;
  series: MetricSeries[];
};

export type RatioItem = { ratioCode: string; value: number | null; quality?: string | null };

export type TickerRatios = {
  ticker: string;
  period: string | null;
  ratios: RatioItem[];
};

export type ScoreHistoryItem = {
  period: string;
  overallScore: number | null;
  rating: FaRatingCode | string | null;
  growthScore: number | null;
  profitabilityScore: number | null;
  valuationScore: number | null;
  solvencyScore: number | null;
  cashflowScore: number | null;
  stabilityScore: number | null;
  dataQualityScore: number | null;
};

export type ScoreHistory = { ticker: string; history: ScoreHistoryItem[] };

export type IndustryBenchmark = {
  industry: string;
  tickerCount: number;
  medianScore: number | null;
  medianPE: number | null;
  medianPB: number | null;
  medianNetMargin: number | null;
  medianROE: number | null;
  medianRevenueYoY: number | null;
};

export type IndustryBenchmarkResponse = {
  benchmarks: IndustryBenchmark[];
  period: string | null;
};

/** market_id of VN stocks in eyeapp-backend — FA data only exists for listed Vietnamese companies. */
export const VN_STOCK_MARKET_ID = 2;

const enc = encodeURIComponent;

export function fetchScreener(params: ScreenerParams = {}): Promise<ScreenerResponse> {
  return taAgentFetch<ScreenerResponse>("/screener", params);
}

/** ta-agent pages at most `pageSize` rows; collect the whole set for dashboard aggregates. */
export async function fetchFullScreener(
  params: Omit<ScreenerParams, "page" | "pageSize"> = {},
  { pageSize = 100, maxPages = 10 }: { pageSize?: number; maxPages?: number } = {},
): Promise<ScreenerResponse> {
  const seen = new Map<string, ScreenerItem>();
  let first: ScreenerResponse | null = null;

  for (let page = 0; page < maxPages; page += 1) {
    const res = await fetchScreener({ ...params, page, pageSize });
    first ??= res;
    for (const item of res.items) seen.set(item.ticker, item);
    if (res.items.length < pageSize || seen.size >= res.totalCount) break;
  }

  return {
    items: Array.from(seen.values()),
    totalCount: first?.totalCount ?? seen.size,
    period: first?.period ?? null,
    page: 0,
    pageSize: seen.size,
  };
}

export function fetchTickerOverview(ticker: string, period?: string): Promise<TickerOverview> {
  return taAgentFetch<TickerOverview>(`/tickers/${enc(ticker)}/overview`, { period });
}

export function fetchTickerFinancials(
  ticker: string,
  periodType: FinancialsPeriodType = "QUARTER",
): Promise<TickerFinancials> {
  return taAgentFetch<TickerFinancials>(`/tickers/${enc(ticker)}/financials`, { periodType });
}

export function fetchTickerRatios(ticker: string, period?: string): Promise<TickerRatios> {
  return taAgentFetch<TickerRatios>(`/tickers/${enc(ticker)}/ratios`, { period });
}

export function fetchScoreHistory(ticker: string): Promise<ScoreHistory> {
  return taAgentFetch<ScoreHistory>(`/tickers/${enc(ticker)}/score-history`);
}

export function fetchIndustryBenchmarks(period?: string): Promise<IndustryBenchmarkResponse> {
  return taAgentFetch<IndustryBenchmarkResponse>("/benchmarks/industry", { period });
}

/** ta-agent answers 200 with empty fields for unknown tickers — treat that as "not found". */
export function isEmptyOverview(o: TickerOverview | undefined | null): boolean {
  return !!o && !o.companyName && o.faScore == null && o.price == null;
}
