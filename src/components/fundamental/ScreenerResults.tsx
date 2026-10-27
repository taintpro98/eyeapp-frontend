import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ScreenerItem, ScreenerSortField } from "@/api/fa";
import { useMarket } from "@/hooks/useMarket";
import { cn } from "@/lib/utils";
import { formatMultiple, formatPct, formatScore } from "@/lib/fa/format";
import { SCORE_MAX } from "@/lib/fa/scores";
import { RatingBadge } from "./RatingBadge";
import { ScoreBar } from "./ScoreBar";

export type SortState = { field: ScreenerSortField; dir: "asc" | "desc" };

type ScreenerResultsProps = {
  items: ScreenerItem[];
  sort: SortState;
  onSort: (field: ScreenerSortField) => void;
  /** Rank of the first row (page offset + 1). */
  startRank: number;
};

type Column = {
  key: string;
  labelKey: string;
  sortField?: ScreenerSortField;
  align?: "left" | "right";
  render: (item: ScreenerItem) => React.ReactNode;
  className?: string;
};

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

export function ScreenerResults({ items, sort, onSort, startRank }: ScreenerResultsProps) {
  const { t } = useTranslation();
  const market = useMarket();
  const href = (ticker: string) => `/app/${market}/fundamental/${encodeURIComponent(ticker)}`;

  const columns: Column[] = [
    {
      key: "overallScore",
      labelKey: "fa.screener.columns.score",
      sortField: "overallScore",
      align: "right",
      render: (i) => <span className="font-semibold tabular-nums text-text-primary">{formatScore(i.overallScore)}</span>,
    },
    { key: "rating", labelKey: "fa.screener.columns.rating", render: (i) => <RatingBadge rating={i.rating} /> },
    {
      key: "growthScore",
      labelKey: "fa.group.growth",
      sortField: "growthScore",
      render: (i) => <ScoreBar value={i.growthScore} max={SCORE_MAX.growth} />,
      className: "min-w-[84px]",
    },
    {
      key: "profitabilityScore",
      labelKey: "fa.group.profitability",
      sortField: "profitabilityScore",
      render: (i) => <ScoreBar value={i.profitabilityScore} max={SCORE_MAX.profitability} />,
      className: "min-w-[84px]",
    },
    {
      key: "valuationScore",
      labelKey: "fa.group.valuation",
      sortField: "valuationScore",
      render: (i) => <ScoreBar value={i.valuationScore} max={SCORE_MAX.valuation} />,
      className: "min-w-[84px]",
    },
    { key: "peTtm", labelKey: "fa.screener.columns.pe", sortField: "peTtm", align: "right", render: (i) => formatMultiple(i.peTtm, 1) },
    { key: "pb", labelKey: "fa.screener.columns.pb", sortField: "pb", align: "right", render: (i) => formatMultiple(i.pb, 2) },
    { key: "roe", labelKey: "fa.screener.columns.roe", sortField: "roe", align: "right", render: (i) => formatPct(i.roe) },
    {
      key: "revenueYoy",
      labelKey: "fa.screener.columns.revenueYoy",
      sortField: "revenueYoy",
      align: "right",
      render: (i) => (
        <span className={cn(i.revenueYoy != null && (i.revenueYoy >= 0 ? "text-rating-5" : "text-rating-1"))}>
          {formatPct(i.revenueYoy, { signed: true })}
        </span>
      ),
    },
  ];

  const header = (col: Column) => {
    const content = (
      <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
        {t(col.labelKey)}
        {col.sortField && <SortIcon active={sort.field === col.sortField} dir={sort.dir} />}
      </span>
    );
    return (
      <th
        key={col.key}
        scope="col"
        aria-sort={col.sortField && sort.field === col.sortField ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
        className={cn("whitespace-nowrap px-2.5 py-3 font-medium", col.align === "right" ? "text-right" : "text-left")}
      >
        {col.sortField ? (
          <button
            type="button"
            onClick={() => onSort(col.sortField!)}
            className={cn("hover:text-text-primary", sort.field === col.sortField && "text-text-primary")}
          >
            {content}
          </button>
        ) : (
          content
        )}
      </th>
    );
  };

  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto rounded-card border border-surface-border bg-surface-card shadow-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border bg-surface-warm/40 text-xs text-text-secondary">
            <tr>
              <th scope="col" className="w-8 px-2.5 py-3 text-right font-medium">#</th>
              <th scope="col" className="px-2.5 py-3 text-left font-medium">{t("fa.screener.columns.ticker")}</th>
              {columns.map(header)}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.ticker} className="group border-b border-surface-border last:border-0 hover:bg-surface-warm/50">
                <td className="px-2.5 py-3 text-right text-xs tabular-nums text-text-secondary">{startRank + idx}</td>
                <td className="max-w-[190px] px-2.5 py-3">
                  <Link
                    to={href(item.ticker)}
                    aria-label={t("fa.screener.open", { ticker: item.ticker })}
                    className="block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-text-primary group-hover:text-brand-primary dark:group-hover:text-brand-light">
                        {item.ticker}
                      </span>
                      {item.exchange && <span className="text-[11px] text-text-secondary">{item.exchange}</span>}
                    </span>
                    <span className="block truncate text-xs text-text-secondary">{item.companyName ?? item.industry ?? ""}</span>
                  </Link>
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-2.5 py-3 tabular-nums text-text-primary", col.align === "right" && "text-right", col.className)}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {items.map((item, idx) => (
          <li key={item.ticker}>
            <Link
              to={href(item.ticker)}
              className="block rounded-card border border-surface-border bg-surface-card p-4 shadow-card active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5">
                    <span className="text-xs tabular-nums text-text-secondary">{startRank + idx}.</span>
                    <span className="font-semibold text-text-primary">{item.ticker}</span>
                    {item.exchange && <span className="text-[11px] text-text-secondary">{item.exchange}</span>}
                  </p>
                  <p className="truncate text-xs text-text-secondary">{item.companyName ?? item.industry ?? ""}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg font-bold tabular-nums text-text-primary">{formatScore(item.overallScore)}</span>
                  <RatingBadge rating={item.rating} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <ScoreBar stacked label={t("fa.group.growth")} value={item.growthScore} max={SCORE_MAX.growth} />
                <ScoreBar stacked label={t("fa.group.profitability")} value={item.profitabilityScore} max={SCORE_MAX.profitability} />
                <ScoreBar stacked label={t("fa.group.valuation")} value={item.valuationScore} max={SCORE_MAX.valuation} />
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-surface-border pt-3 text-xs">
                {[
                  ["fa.screener.columns.pe", formatMultiple(item.peTtm, 1)],
                  ["fa.screener.columns.pb", formatMultiple(item.pb, 2)],
                  ["fa.screener.columns.roe", formatPct(item.roe)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-text-secondary">{t(label)}</dt>
                    <dd className="font-semibold tabular-nums text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
