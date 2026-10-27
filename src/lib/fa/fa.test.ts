import { describe, expect, it } from "vitest";
import { canonicalRating, ratingFromScore, ratingLabelKey, ratingTier } from "./ratings";
import { formatScoreWithMax, SCORE_MAX, scorePercent, scoreTier } from "./scores";
import { normalizeInsights } from "./insights";
import { comparePeriods, formatPeriodLabel, periodSortKey } from "./period";
import { latestValue, mergeSeries, pivotFinancials } from "./pivot";
import { formatBillionVnd, formatPct, formatVndAxis } from "./format";
import { applyScreener } from "./screener";
import type { ScreenerItem } from "@/api/fa";

describe("ratings", () => {
  it("canonicalises codes and the legacy AVERAGE_FA alias", () => {
    expect(canonicalRating(" good_fa ")).toBe("GOOD_FA");
    expect(canonicalRating("AVERAGE_FA")).toBe("FAIR_FA");
    expect(canonicalRating("STRONG")).toBe("STRONG_FA");
    expect(canonicalRating("poor")).toBe("POOR_FA");
    expect(canonicalRating("BOGUS")).toBeNull();
    expect(canonicalRating(null)).toBeNull();
  });

  it("weights unknown ratings last", () => {
    expect(ratingTier("STRONG_FA")).toBe(5);
    expect(ratingTier("POOR_FA")).toBe(1);
    expect(ratingTier(undefined)).toBe(0);
  });

  it("never exposes the raw enum as a label key", () => {
    expect(ratingLabelKey("WEAK_FA")).toBe("fa.rating.WEAK_FA");
    expect(ratingLabelKey("???")).toBe("fa.rating.unknown");
  });

  it("maps scores to the engine thresholds", () => {
    expect(ratingFromScore(80)).toBe("STRONG_FA");
    expect(ratingFromScore(79.9)).toBe("GOOD_FA");
    expect(ratingFromScore(50)).toBe("FAIR_FA");
    expect(ratingFromScore(35)).toBe("WEAK_FA");
    expect(ratingFromScore(0)).toBe("POOR_FA");
  });
});

describe("scores", () => {
  it("judges a sub-score against its own ceiling", () => {
    // 16/20 = 80% → top tier, even though 16 is "low" on a 0–100 scale
    expect(scoreTier(16, SCORE_MAX.growth)).toBe(5);
    expect(scoreTier(16, SCORE_MAX.overall)).toBe(1);
    expect(scoreTier(null, 20)).toBe(0);
    expect(scoreTier(5, 0)).toBe(0);
  });

  it("clamps the bar percentage", () => {
    expect(scorePercent(25, 20)).toBe(100);
    expect(scorePercent(-3, 20)).toBe(0);
    expect(scorePercent(undefined, 20)).toBe(0);
  });

  it("formats with the denominator", () => {
    expect(formatScoreWithMax(14.4, 20)).toBe("14/20");
    expect(formatScoreWithMax(72.36, 100)).toBe("72,4/100");
    expect(formatScoreWithMax(null, 20)).toBe("—");
  });
});

describe("insights", () => {
  it("de-duplicates case- and whitespace-insensitively", () => {
    const { positives } = normalizeInsights(["ROE cao (21%)", "roe  cao (21%)", "ROE cao (21%)"], []);
    expect(positives).toHaveLength(1);
  });

  it("moves English declines filed as highlights to the negatives", () => {
    const { positives, negatives } = normalizeInsights(["Revenue declined 5% year-over-year"], []);
    expect(positives).toHaveLength(0);
    expect(negatives[0].source).toBe("highlight");
  });

  it("keeps Vietnamese highlights where ta-agent put them", () => {
    const { positives, negatives } = normalizeInsights(["Nợ vay giảm mạnh"], ["Biên gộp thu hẹp"]);
    expect(positives.map((i) => i.text)).toEqual(["Nợ vay giảm mạnh"]);
    expect(negatives.map((i) => i.text)).toEqual(["Biên gộp thu hẹp"]);
  });

  it("ignores blanks and non-strings", () => {
    const { positives, negatives } = normalizeInsights(["  ", null as unknown as string], undefined);
    expect(positives).toHaveLength(0);
    expect(negatives).toHaveLength(0);
  });
});

describe("period", () => {
  it("sorts mixed period formats chronologically", () => {
    const periods = ["2025Q1", "Q4/24", "2024-Q3", "2023"];
    expect([...periods].sort(comparePeriods)).toEqual(["2023", "2024-Q3", "Q4/24", "2025Q1"]);
    expect(periodSortKey("garbage")).toBe(0);
  });

  it("formats compact axis labels", () => {
    expect(formatPeriodLabel("2026Q2")).toBe("Q2/26");
    expect(formatPeriodLabel("Q3/2025")).toBe("Q3/25");
    expect(formatPeriodLabel("2024")).toBe("2024");
  });
});

describe("pivot", () => {
  const quarter = [
    { metricCode: "REVENUE", unit: "", values: [{ period: "2025Q2", value: 200 }, { period: "2025Q1", value: 100 }] },
    { metricCode: "NPAT", unit: "", values: [{ period: "2025Q1", value: 10 }, { period: "2025Q2", value: 30 }] },
    { metricCode: "TOTAL_LIABILITIES", unit: "", values: [{ period: "2025Q2", value: 500 }] },
    { metricCode: "CURRENT_LIABILITIES", unit: "", values: [{ period: "2025Q2", value: 300 }] },
    { metricCode: "TOTAL_EQUITY", unit: "", values: [{ period: "2025Q2", value: 250 }] },
  ];

  it("sorts rows and derives margins, long-term debt and D/E", () => {
    const rows = pivotFinancials(quarter);
    expect(rows.map((r) => r.period)).toEqual(["2025Q1", "2025Q2"]);
    expect(rows[0].label).toBe("Q1/25");
    expect(rows[1].NET_MARGIN).toBe(15);
    expect(rows[1].LONG_TERM_LIABILITIES).toBe(200);
    expect(rows[1].DEBT_TO_EQUITY).toBe(2);
    // Two quarters are not enough for a trailing-12-month ROE.
    expect(rows[1].ROE).toBeUndefined();
  });

  const series = (metricCode: string, points: Record<string, number>) => ({
    metricCode,
    unit: "",
    values: Object.entries(points).map(([period, value]) => ({ period, value })),
  });

  it("computes TTM ROE/ROA over consecutive quarters with year-ago averages", () => {
    const q = ["2024Q2", "2024Q3", "2024Q4", "2025Q1", "2025Q2"];
    const rows = pivotFinancials([
      series("REVENUE", Object.fromEntries(q.map((p) => [p, 100]))),
      series("NPAT", Object.fromEntries(q.map((p) => [p, 99]))),
      series("NPAT_PARENT", Object.fromEntries(q.map((p) => [p, 10]))),
      series("TOTAL_EQUITY", { "2024Q2": 150, "2025Q1": 180, "2025Q2": 250 }),
      series("TOTAL_ASSETS", { "2025Q1": 400, "2025Q2": 500 }),
    ]);
    expect(rows.map((r) => r.ROE)).toEqual([undefined, undefined, undefined, 40 / 180 * 100, 40 / 200 * 100]);
    expect(rows[4].ROA).toBe(8); // no year-ago assets → period-end balance
  });

  it("skips TTM across a gap in the reports", () => {
    const rows = pivotFinancials([
      series("NPAT", { "2024Q1": 1, "2024Q2": 1, "2024Q4": 1, "2025Q1": 1 }),
      series("TOTAL_EQUITY", { "2025Q1": 10 }),
    ]);
    expect(rows[3].ROE).toBeUndefined();
  });

  it("drops stray annual points and trailing price-only quarters", () => {
    const rows = pivotFinancials([
      series("REVENUE", { "2025Q1": 1, "2025Q2": 2 }),
      series("NPAT", { "2025": 9, "2025Q1": 1, "2025Q2": 1 }),
      series("CLOSE_PRICE", { "2025Q1": 10, "2025Q2": 11, "2025Q3": 12 }),
    ]);
    expect(rows.map((r) => r.period)).toEqual(["2025Q1", "2025Q2"]);
  });

  it("keeps annual-only data as is", () => {
    const rows = pivotFinancials([series("NPAT_YEARLY", { "2023": 1, "2024": 2 })]);
    expect(rows.map((r) => r.period)).toEqual(["2023", "2024"]);
  });

  it("derives P/B from par value and D/E from interest-bearing debt", () => {
    const rows = pivotFinancials([
      series("REVENUE", { "2025Q1": 13_000 }),
      series("CLOSE_PRICE", { "2025Q1": 70_000 }),
      series("TOTAL_EQUITY", { "2025Q1": 41_000 }),
      series("CHARTER_CAPITAL", { "2025Q1": 17_000 * 10_000 }),
      series("TOTAL_LIABILITIES", { "2025Q1": 32_000 }),
      series("SHORT_TERM_DEBT", { "2025Q1": 16_000 }),
      series("LONG_TERM_DEBT", { "2025Q1": 400 }),
    ]);
    expect(rows[0].PB).toBeCloseTo(70_000 / (41_000 / 17_000), 6);
    expect(rows[0].DEBT_TO_EQUITY).toBeCloseTo(0.4, 6);
  });

  it("leaves D/E empty for banks (no net revenue)", () => {
    const rows = pivotFinancials([
      series("REVENUE", { "2025Q1": 0 }),
      series("NPAT", { "2025Q1": 10_000 }),
      series("TOTAL_EQUITY", { "2025Q1": 260_000 }),
      series("SHORT_TERM_DEBT", { "2025Q1": 0 }),
      series("LONG_TERM_DEBT", { "2025Q1": 0 }),
    ]);
    expect(rows[0].DEBT_TO_EQUITY).toBeUndefined();
  });

  it("never overwrites a metric the backend already sent", () => {
    const rows = pivotFinancials([
      ...quarter,
      { metricCode: "LONG_TERM_LIABILITIES", unit: "", values: [{ period: "2025Q2", value: 180 }] },
    ]);
    expect(rows[1].LONG_TERM_LIABILITIES).toBe(180);
  });

  it("merges series lists without mutating them", () => {
    const pit = [
      { metricCode: "REVENUE", unit: "", values: [{ period: "2025Q2", value: 999 }, { period: "2025Q3", value: 300 }] },
      { metricCode: "CLOSE_PRICE", unit: "", values: [{ period: "2025Q2", value: 25000 }] },
    ];
    const before = JSON.stringify(quarter);
    const merged = mergeSeries(quarter, pit);
    expect(JSON.stringify(quarter)).toBe(before);
    const revenue = merged.find((s) => s.metricCode === "REVENUE")!;
    expect(revenue.values.find((v) => v.period === "2025Q2")!.value).toBe(200); // first list wins
    expect(revenue.values.some((v) => v.period === "2025Q3")).toBe(true);
    expect(merged.some((s) => s.metricCode === "CLOSE_PRICE")).toBe(true);
  });

  it("finds the latest non-null value", () => {
    const rows = pivotFinancials(quarter);
    expect(latestValue(rows, "REVENUE")).toBe(200);
    expect(latestValue(rows, "TOTAL_EQUITY")).toBe(250);
    expect(latestValue(rows, "MISSING")).toBeNull();
  });
});

describe("screener", () => {
  const item = (ticker: string, extra: Partial<ScreenerItem>): ScreenerItem => ({
    ticker,
    companyName: null,
    exchange: "HOSE",
    industry: null,
    overallScore: null,
    rating: null,
    growthScore: null,
    profitabilityScore: null,
    valuationScore: null,
    solvencyScore: null,
    cashflowScore: null,
    peTtm: null,
    pb: null,
    revenueYoy: null,
    npatYoy: null,
    netMargin: null,
    roe: null,
    ...extra,
  });
  const items = [
    item("AAA", { overallScore: 90, rating: "STRONG", peTtm: 10 }),
    item("BBB", { overallScore: 85, rating: "STRONG_FA", exchange: "UPCoM", companyName: "Đầu Tư Bất Động Sản" }),
    item("CCC", { overallScore: 60, rating: "FAIR", peTtm: 5 }),
    item("DDD", { overallScore: null, rating: null, peTtm: 7 }),
  ];
  const byScore = { field: "overallScore", dir: "desc" } as const;

  it("matches both spellings of a rating", () => {
    expect(applyScreener(items, { rating: "STRONG_FA" }, byScore).map((i) => i.ticker)).toEqual(["AAA", "BBB"]);
  });

  it("matches exchanges case-insensitively", () => {
    expect(applyScreener(items, { exchange: "UPCOM" }, byScore).map((i) => i.ticker)).toEqual(["BBB"]);
  });

  it("searches ticker and name without accents", () => {
    expect(applyScreener(items, { query: "dau tu" }, byScore).map((i) => i.ticker)).toEqual(["BBB"]);
    expect(applyScreener(items, { query: "ccc" }, byScore).map((i) => i.ticker)).toEqual(["CCC"]);
  });

  it("applies a minimum score and keeps missing values last in both directions", () => {
    expect(applyScreener(items, { minScore: 80 }, byScore).map((i) => i.ticker)).toEqual(["AAA", "BBB"]);
    const pe = (dir: "asc" | "desc") => applyScreener(items, {}, { field: "peTtm", dir }).map((i) => i.ticker);
    expect(pe("asc")).toEqual(["CCC", "DDD", "AAA", "BBB"]);
    expect(pe("desc")).toEqual(["AAA", "DDD", "CCC", "BBB"]);
  });
});

describe("format", () => {
  it("formats VND amounts in billions", () => {
    expect(formatBillionVnd(3_400_000_000)).toBe("3,4 tỷ");
    expect(formatBillionVnd(1_250_000_000_000)).toBe("1,25 nghìn tỷ");
    expect(formatBillionVnd(null)).toBe("—");
  });

  it("formats percent values already in percent", () => {
    expect(formatPct(18.46)).toBe("18,5%");
    expect(formatPct(12, { signed: true })).toBe("+12,0%");
    expect(formatPct(-3.2, { signed: true })).toBe("-3,2%");
  });

  it("formats chart axis ticks", () => {
    expect(formatVndAxis(25_000_000_000_000)).toBe("25k tỷ");
    expect(formatVndAxis(340_000_000_000)).toBe("340 tỷ");
    expect(formatVndAxis(12_000_000)).toBe("12 tr");
  });
});

describe("taAgentRetry", () => {
  it("fails fast on auth and other 4xx answers", async () => {
    const { taAgentRetry, TaAgentError } = await import("@/lib/taAgent");
    expect(taAgentRetry(0, new TaAgentError("unauthorized", 401, ""))).toBe(false);
    expect(taAgentRetry(0, new TaAgentError("forbidden", 403, ""))).toBe(false);
    expect(taAgentRetry(0, new TaAgentError("http", 404, ""))).toBe(false);
  });

  it("retries network and server errors once", async () => {
    const { taAgentRetry, TaAgentError } = await import("@/lib/taAgent");
    expect(taAgentRetry(0, new TaAgentError("unreachable", 0, ""))).toBe(true);
    expect(taAgentRetry(0, new TaAgentError("http", 502, ""))).toBe(true);
    expect(taAgentRetry(1, new TaAgentError("http", 502, ""))).toBe(false);
  });
});
