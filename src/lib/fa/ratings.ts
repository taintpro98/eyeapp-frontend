import type { FaRatingCode } from "@/api/fa";

export const RATING_CODES: FaRatingCode[] = ["STRONG_FA", "GOOD_FA", "FAIR_FA", "WEAK_FA", "POOR_FA"];

/** 5 = best, 1 = worst, 0 = unknown. Doubles as the sort weight and the `rating-N` colour token. */
export type RatingTier = 0 | 1 | 2 | 3 | 4 | 5;

const TIERS: Record<FaRatingCode, RatingTier> = {
  STRONG_FA: 5,
  GOOD_FA: 4,
  FAIR_FA: 3,
  WEAK_FA: 2,
  POOR_FA: 1,
};

/**
 * Older engines emitted AVERAGE_FA for what is now FAIR_FA; ta-agent's score
 * calculator writes the bare STRONG/GOOD/FAIR/WEAK/POOR, and both spellings can
 * appear in the same period (the snapshots come from different runs).
 */
const ALIASES: Record<string, FaRatingCode> = {
  AVERAGE_FA: "FAIR_FA",
  STRONG: "STRONG_FA",
  GOOD: "GOOD_FA",
  FAIR: "FAIR_FA",
  WEAK: "WEAK_FA",
  POOR: "POOR_FA",
};

export function canonicalRating(code: string | null | undefined): FaRatingCode | null {
  if (!code) return null;
  const key = code.trim().toUpperCase();
  if (key in TIERS) return key as FaRatingCode;
  return ALIASES[key] ?? null;
}

export function ratingTier(code: string | null | undefined): RatingTier {
  const key = canonicalRating(code);
  return key ? TIERS[key] : 0;
}

/** i18n key for the rating label; unknown codes map to "unknown", never the raw enum. */
export function ratingLabelKey(code: string | null | undefined): string {
  return `fa.rating.${canonicalRating(code) ?? "unknown"}`;
}

/** Same thresholds as the FA Score engine (≥80 / 65 / 50 / 35). */
export function ratingFromScore(score: number): FaRatingCode {
  if (score >= 80) return "STRONG_FA";
  if (score >= 65) return "GOOD_FA";
  if (score >= 50) return "FAIR_FA";
  if (score >= 35) return "WEAK_FA";
  return "POOR_FA";
}
