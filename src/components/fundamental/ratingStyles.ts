import type { RatingTier } from "@/lib/fa/ratings";

/**
 * Literal class names per tier — Tailwind only emits classes it can find
 * verbatim, so `bg-rating-${tier}` would produce no CSS.
 */
export const RATING_TEXT: Record<RatingTier, string> = {
  0: "text-text-secondary",
  1: "text-rating-1",
  2: "text-rating-2",
  3: "text-rating-3",
  4: "text-rating-4",
  5: "text-rating-5",
};

export const RATING_FILL: Record<RatingTier, string> = {
  0: "bg-surface-border",
  1: "bg-rating-1",
  2: "bg-rating-2",
  3: "bg-rating-3",
  4: "bg-rating-4",
  5: "bg-rating-5",
};

export const RATING_SOFT: Record<RatingTier, string> = {
  0: "bg-surface-border/50 border-surface-border",
  1: "bg-rating-1/10 border-rating-1/30",
  2: "bg-rating-2/10 border-rating-2/30",
  3: "bg-rating-3/10 border-rating-3/30",
  4: "bg-rating-4/10 border-rating-4/30",
  5: "bg-rating-5/10 border-rating-5/30",
};
