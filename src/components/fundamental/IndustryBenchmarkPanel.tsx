import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, ArrowUpDown, Factory } from "lucide-react";
import { fetchIndustryBenchmarks, type IndustryBenchmark } from "@/api/fa";
import { taAgentRetry } from "@/lib/taAgent";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { formatMultiple, formatPct, formatScore } from "@/lib/fa/format";
import { ratingFromScore, ratingTier } from "@/lib/fa/ratings";
import { FaErrorState } from "./FaErrorState";
import { RATING_FILL } from "./ratingStyles";

type SortKey = keyof Pick<
  IndustryBenchmark,
  "industry" | "tickerCount" | "medianScore" | "medianPE" | "medianPB" | "medianROE" | "medianNetMargin" | "medianRevenueYoY"
>;

const COLUMNS: { key: SortKey; labelKey: string; format: (b: IndustryBenchmark) => string }[] = [
  { key: "tickerCount", labelKey: "fa.benchmark.columns.tickers", format: (b) => String(b.tickerCount) },
  { key: "medianScore", labelKey: "fa.benchmark.columns.score", format: (b) => formatScore(b.medianScore) },
  { key: "medianPE", labelKey: "fa.benchmark.columns.pe", format: (b) => formatMultiple(b.medianPE, 1) },
  { key: "medianPB", labelKey: "fa.benchmark.columns.pb", format: (b) => formatMultiple(b.medianPB, 2) },
  { key: "medianROE", labelKey: "fa.benchmark.columns.roe", format: (b) => formatPct(b.medianROE) },
  { key: "medianNetMargin", labelKey: "fa.benchmark.columns.netMargin", format: (b) => formatPct(b.medianNetMargin) },
  { key: "medianRevenueYoY", labelKey: "fa.benchmark.columns.revenueYoy", format: (b) => formatPct(b.medianRevenueYoY, { signed: true }) },
];

function compare(a: IndustryBenchmark, b: IndustryBenchmark, key: SortKey): number {
  const va = a[key];
  const vb = b[key];
  if (va == null && vb == null) return 0;
  if (va == null) return 1; // missing values last regardless of direction
  if (vb == null) return -1;
  return typeof va === "string" ? va.localeCompare(vb as string, "vi") : (va as number) - (vb as number);
}

/** Median FA score bar on a 0–100 track, coloured by the rating it would earn. */
function MedianScoreBar({ value }: { value: number | null }) {
  const tier = value == null ? 0 : ratingTier(ratingFromScore(value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-border/60">
      <div className={cn("h-full rounded-full", RATING_FILL[tier])} style={{ width: `${Math.min(100, value ?? 0)}%` }} />
    </div>
  );
}

export function IndustryBenchmarkPanel() {
  const { t } = useTranslation();
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "medianScore", dir: "desc" });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["fa", "benchmarks"],
    queryFn: () => fetchIndustryBenchmarks(),
    staleTime: 5 * 60 * 1000,
    retry: taAgentRetry,
  });

  const rows = useMemo(() => {
    const list = [...(data?.benchmarks ?? [])];
    list.sort((a, b) => {
      const c = compare(a, b, sort.key);
      // keep nulls last: only flip comparisons between two present values
      if (a[sort.key] == null || b[sort.key] == null) return c;
      return sort.dir === "asc" ? c : -c;
    });
    return list;
  }, [data, sort]);

  const toggle = (key: SortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "desc" ? "asc" : "desc" } : { key, dir: key === "industry" ? "asc" : "desc" }));

  const sortIcon = (key: SortKey) =>
    sort.key !== key ? (
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    ) : sort.dir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );

  if (isError) return <FaErrorState error={error} onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg border border-surface-border bg-surface-card" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return <EmptyState icon={Factory} title={t("fa.benchmark.empty.title")} description={t("fa.benchmark.empty.description")} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-secondary">
        {t("fa.benchmark.summary", { count: rows.length, period: data?.period ?? "—" })}
      </p>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-card border border-surface-border bg-surface-card shadow-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border bg-surface-warm/40 text-xs text-text-secondary">
            <tr>
              <th scope="col" className="px-3 py-3 text-left font-medium">
                <button type="button" onClick={() => toggle("industry")} className="inline-flex items-center gap-1 hover:text-text-primary">
                  {t("fa.benchmark.columns.industry")} {sortIcon("industry")}
                </button>
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className="whitespace-nowrap px-3 py-3 text-right font-medium"
                >
                  <button type="button" onClick={() => toggle(col.key)} className="inline-flex flex-row-reverse items-center gap-1 hover:text-text-primary">
                    {t(col.labelKey)} {sortIcon(col.key)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.industry} className="border-b border-surface-border last:border-0 hover:bg-surface-warm/50">
                <td className="min-w-[200px] px-3 py-3">
                  <p className="font-medium text-text-primary">{b.industry}</p>
                  <MedianScoreBar value={b.medianScore} />
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-text-primary">
                    {col.format(b)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((b) => (
          <li key={b.industry} className="rounded-card border border-surface-border bg-surface-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{b.industry}</p>
                <p className="text-xs text-text-secondary">{t("fa.benchmark.tickerCount", { count: b.tickerCount })}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums text-text-primary">{formatScore(b.medianScore)}</p>
                <p className="text-[11px] text-text-secondary">{t("fa.benchmark.columns.score")}</p>
              </div>
            </div>
            <div className="mt-2">
              <MedianScoreBar value={b.medianScore} />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-surface-border pt-3 text-xs">
              {COLUMNS.filter((c) => c.key !== "tickerCount" && c.key !== "medianScore").map((col) => (
                <div key={col.key}>
                  <dt className="text-text-secondary">{t(col.labelKey)}</dt>
                  <dd className="font-semibold tabular-nums text-text-primary">{col.format(b)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
