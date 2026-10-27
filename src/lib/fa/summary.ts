import type { ScreenerItem } from "@/api/fa";
import { RATING_CODES, canonicalRating } from "./ratings";

export const TOP_N = 5;

/** Rating counts, average score and the top names of a screener set. */
export function summarize(items: ScreenerItem[]) {
  const counts = Object.fromEntries(RATING_CODES.map((c) => [c, 0])) as Record<(typeof RATING_CODES)[number], number>;
  let unrated = 0;
  let scoreSum = 0;
  let scored = 0;
  for (const item of items) {
    const code = canonicalRating(item.rating);
    if (code) counts[code] += 1;
    else unrated += 1;
    if (item.overallScore != null) {
      scoreSum += item.overallScore;
      scored += 1;
    }
  }
  const top = [...items]
    .filter((i) => i.overallScore != null)
    .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
    .slice(0, TOP_N);
  return {
    counts,
    unrated,
    average: scored ? scoreSum / scored : null,
    goodShare: items.length ? ((counts.STRONG_FA + counts.GOOD_FA) / items.length) * 100 : null,
    top,
  };
}
