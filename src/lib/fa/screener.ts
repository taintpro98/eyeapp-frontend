import type { ScreenerItem, ScreenerSortField } from "@/api/fa";
import { canonicalRating } from "./ratings";

export type ScreenerCriteria = {
  /** Ticker or company name fragment; accent- and case-insensitive. */
  query?: string;
  exchange?: string;
  /** Canonical rating code (STRONG_FA…); matches every spelling ta-agent stores. */
  rating?: string;
  minScore?: number | null;
};

export type ScreenerSort = { field: ScreenerSortField; dir: "asc" | "desc" };

/** "Đầu Tư" → "dau tu": lets "dau tu" or "ĐẦU TƯ" find the same company. */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

/**
 * Filter and sort the full screener set client-side. ta-agent filters with
 * exact string matches, which misses rows whose rating is stored as "STRONG"
 * instead of "STRONG_FA" and the exchange spelled "UPCoM"; the whole universe
 * is a few hundred rows, so doing it here is both correct and instant.
 */
export function applyScreener(items: ScreenerItem[], criteria: ScreenerCriteria, sort: ScreenerSort): ScreenerItem[] {
  const query = criteria.query ? foldText(criteria.query) : "";
  const exchange = criteria.exchange?.toUpperCase() ?? "";
  const rating = criteria.rating ? canonicalRating(criteria.rating) : null;
  const minScore = criteria.minScore ?? null;

  const filtered = items.filter((item) => {
    if (exchange && item.exchange?.toUpperCase() !== exchange) return false;
    if (rating && canonicalRating(item.rating) !== rating) return false;
    if (minScore != null && (item.overallScore == null || item.overallScore < minScore)) return false;
    if (query) {
      const haystack = foldText(`${item.ticker} ${item.companyName ?? ""}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sign = sort.dir === "asc" ? 1 : -1;
  return filtered.sort((a, b) => {
    const va = a[sort.field];
    const vb = b[sort.field];
    // Missing values sink to the bottom in both directions.
    if (va == null && vb == null) return a.ticker.localeCompare(b.ticker);
    if (va == null) return 1;
    if (vb == null) return -1;
    return va === vb ? a.ticker.localeCompare(b.ticker) : (va - vb) * sign;
  });
}
