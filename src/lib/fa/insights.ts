export type Insight = {
  text: string;
  source: "highlight" | "warning";
};

/**
 * The old Java engine filed declines as highlights (English text); a sentence
 * matching these is moved to the negatives. ta-agent already splits its
 * Vietnamese output correctly, and Vietnamese words like "giảm" are ambiguous
 * ("nợ vay giảm" is good news), so they are deliberately not matched.
 */
const NEGATIVE = /\b(declin|decreas|fell|drop|negative|loss|deficit|below|weak|high risk)/i;

/** Split, de-duplicate (case/whitespace-insensitive) and re-classify highlights and warnings. */
export function normalizeInsights(
  highlights: string[] | null | undefined,
  warnings: string[] | null | undefined,
): { positives: Insight[]; negatives: Insight[] } {
  const positives: Insight[] = [];
  const negatives: Insight[] = [];
  const seen = new Set<string>();

  const ingest = (list: string[] | null | undefined, source: Insight["source"]) => {
    for (const raw of list ?? []) {
      if (typeof raw !== "string") continue;
      const text = raw.trim();
      if (!text) continue;

      const key = text.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) continue;
      seen.add(key);

      const insight: Insight = { text, source };
      const isNegative = source === "warning" || NEGATIVE.test(text);
      (isNegative ? negatives : positives).push(insight);
    }
  };

  ingest(highlights, "highlight");
  ingest(warnings, "warning");
  return { positives, negatives };
}
