import type { RatingTier } from "./ratings";

/** Per-group ceilings of the FA Score engine. Total = 100. */
export const SCORE_MAX = {
  overall: 100,
  growth: 20,
  profitability: 20,
  valuation: 20,
  solvency: 15,
  cashflow: 10,
  stability: 5,
  dataQuality: 10,
} as const;

/** The 7 groups in display order, keyed by the overview / score-history field. */
export const SCORE_GROUPS = [
  { field: "growthScore", key: "growth", max: SCORE_MAX.growth },
  { field: "profitabilityScore", key: "profitability", max: SCORE_MAX.profitability },
  { field: "valuationScore", key: "valuation", max: SCORE_MAX.valuation },
  { field: "solvencyScore", key: "solvency", max: SCORE_MAX.solvency },
  { field: "cashflowScore", key: "cashflow", max: SCORE_MAX.cashflow },
  { field: "stabilityScore", key: "stability", max: SCORE_MAX.stability },
  { field: "dataQualityScore", key: "dataQuality", max: SCORE_MAX.dataQuality },
] as const;

/**
 * Tier of a sub-score, normalised against its own ceiling first — a raw 0–20
 * growth score must not be judged on the 0–100 scale.
 */
export function scoreTier(value: number | null | undefined, max: number): RatingTier {
  if (value == null || !Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  const pct = (value / max) * 100;
  if (pct >= 80) return 5;
  if (pct >= 65) return 4;
  if (pct >= 50) return 3;
  if (pct >= 35) return 2;
  return 1;
}

/** 0–100 share of the ceiling, clamped; 0 when there is no data. */
export function scorePercent(value: number | null | undefined, max: number): number {
  if (value == null || !Number.isFinite(value) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** Sub-scores are meaningless without their denominator: "14/20". */
export function formatScoreWithMax(value: number | null | undefined, max: number): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const rounded = max <= 20 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("vi-VN")}/${max}`;
}
