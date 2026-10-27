import { useTranslation } from "react-i18next";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RATING_CODES } from "@/lib/fa/ratings";
import { FilterSelect } from "./FilterSelect";
import { DEFAULT_SCREENER_FILTERS, type ScreenerFilterState } from "./screenerFilterState";

// Values are matched case-insensitively (ta-agent stores "UPCoM"); labels use the official spelling.
const EXCHANGES = [
  { value: "HOSE", label: "HOSE" },
  { value: "HNX", label: "HNX" },
  { value: "UPCOM", label: "UPCoM" },
];
const MIN_SCORES = ["50", "65", "80"];
const PAGE_SIZES = [20, 50, 100];

type ScreenerFiltersProps = {
  value: ScreenerFilterState;
  onChange: (next: ScreenerFilterState) => void;
};

export function ScreenerFilters({ value, onChange }: ScreenerFiltersProps) {
  const { t } = useTranslation();
  const set = <K extends keyof ScreenerFilterState>(key: K, v: ScreenerFilterState[K]) => onChange({ ...value, [key]: v });

  const isDefault =
    value.query === DEFAULT_SCREENER_FILTERS.query &&
    value.exchange === DEFAULT_SCREENER_FILTERS.exchange &&
    value.rating === DEFAULT_SCREENER_FILTERS.rating &&
    value.minScore === DEFAULT_SCREENER_FILTERS.minScore &&
    value.watchedOnly === DEFAULT_SCREENER_FILTERS.watchedOnly;

  return (
    <div className="rounded-card border border-surface-border bg-surface-card p-4 shadow-card">
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          type="search"
          value={value.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder={t("fa.screener.filters.query")}
          aria-label={t("fa.screener.filters.query")}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FilterSelect
          id="fa-exchange"
          label={t("fa.screener.filters.exchange")}
          value={value.exchange}
          onChange={(v) => set("exchange", v)}
          options={[{ value: "", label: t("fa.screener.filters.allExchanges") }, ...EXCHANGES]}
        />
        <FilterSelect
          id="fa-rating"
          label={t("fa.screener.filters.rating")}
          value={value.rating}
          onChange={(v) => set("rating", v)}
          options={[
            { value: "", label: t("fa.screener.filters.allRatings") },
            ...RATING_CODES.map((code) => ({ value: code, label: t(`fa.rating.${code}`) })),
          ]}
        />
        <FilterSelect
          id="fa-min-score"
          label={t("fa.screener.filters.minScore")}
          value={value.minScore}
          onChange={(v) => set("minScore", v)}
          options={[
            { value: "", label: t("fa.screener.filters.anyScore") },
            ...MIN_SCORES.map((s) => ({ value: s, label: `≥ ${s}` })),
          ]}
        />
        <FilterSelect
          id="fa-page-size"
          label={t("fa.screener.filters.pageSize")}
          value={String(value.pageSize)}
          onChange={(v) => set("pageSize", Number(v))}
          options={PAGE_SIZES.map((n) => ({ value: String(n), label: t("fa.screener.filters.perPage", { count: n }) }))}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={value.watchedOnly}
            onChange={(e) => set("watchedOnly", e.target.checked)}
            className="h-4 w-4 rounded border-surface-border accent-brand-primary"
          />
          {t("fa.screener.filters.watchedOnly")}
        </label>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => onChange({ ...DEFAULT_SCREENER_FILTERS, pageSize: value.pageSize })}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("fa.screener.filters.reset")}
          </Button>
        )}
      </div>
    </div>
  );
}
